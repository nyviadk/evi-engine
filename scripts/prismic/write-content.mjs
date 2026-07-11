// scripts/prismic/write-content.mjs
//
// Init-content for en ny tenant. Opretter home + kontakt + om + navigation
// + footer med init-default's værdier via Prismic Migration API.
//
// Kør:
//   node scripts/prismic/write-content.mjs --hostname <hostname> [--dry]

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { webcrypto } from "crypto";
import { createInterface } from "readline";
import { createWriteClient, createMigration } from "@prismicio/client";
import init_default from "./templates/init-default.mjs";

const DEV_VARS_KEY = "TOKEN_MASTER_KEY";
const KV_BINDING = "TENANTS";

// ==========================================
// ENTRY
// ==========================================

const args = process.argv.slice(2);
const is_dry_run = args.includes("--dry");
const hostname_idx = args.indexOf("--hostname");
const hostname = hostname_idx >= 0 ? args[hostname_idx + 1] : null;

if (!hostname) {
  console.error(
    "Usage: node scripts/prismic/write-content.mjs --hostname <hostname> [--dry]",
  );
  process.exit(1);
}

console.log(`\n📝 Write content${is_dry_run ? " (DRY RUN)" : ""}\n`);

const config = {
  hostname,
  operations: [
    { op: "create-page", ...init_default.pages.home },
    { op: "create-navigation", ...init_default.navigation },
    { op: "create-footer", ...init_default.footer },
    { op: "create-business", ...init_default.business },
    { op: "create-settings", ...init_default.settings },
  ],
};

const tenant = await fetch_tenant_from_kv(hostname);
const tokens = await decrypt_tokens(tenant);

print_preview(config, tenant);

if (!is_dry_run) {
  await confirm_or_abort(config, tenant);
  await execute_operations(config, tenant, tokens);
  console.log("\n✅ Færdig!");
} else {
  console.log("\n🔍 Dry run — ingen skrivning udført.");
}

// ==========================================
// HELPERS
// ==========================================

async function fetch_tenant_from_kv(hostname) {
  console.log(`☁️  Henter tenant fra KV for hostname: ${hostname}...`);
  let output;
  try {
    output = execSync(
      `npx wrangler kv key get "${hostname}" --binding="${KV_BINDING}" --remote`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
  } catch (err) {
    console.error(`❌ Kunne ikke hente tenant fra KV.`);
    console.error(`   Er hostname "${hostname}" registreret via push-tenant.mjs?`);
    throw err;
  }

  const json_start = output.indexOf("{");
  if (json_start < 0) throw new Error("Uventet KV output-format");
  const parsed = JSON.parse(output.slice(json_start));
  if (!parsed.repo) throw new Error("Tenant mangler 'repo' i KV entry");
  if (!parsed.prismic_write_api_token) {
    throw new Error("Tenant mangler 'prismic_write_api_token' i KV entry");
  }
  console.log(`✅ Tenant fundet — repo: ${parsed.repo}`);
  return parsed;
}

async function decrypt_tokens(tenant) {
  const master_key_b64 = read_master_key_from_dev_vars();
  const raw = Buffer.from(master_key_b64, "base64");
  const key = await webcrypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  return {
    read: await decrypt_token(tenant.prismic_token, key),
    write: await decrypt_token(tenant.prismic_write_api_token, key),
  };
}

function read_master_key_from_dev_vars() {
  const contents = readFileSync(".dev.vars", "utf8");
  const match = contents.match(
    new RegExp(`^\\s*${DEV_VARS_KEY}\\s*=\\s*"?([^"\\r\\n]+)"?\\s*$`, "m"),
  );
  if (!match) throw new Error(`${DEV_VARS_KEY} mangler i .dev.vars`);
  return match[1];
}

async function decrypt_token(encoded, key) {
  const parts = encoded.split(":");
  if (parts.length !== 3 || parts[0] !== "v1") {
    throw new Error(`Uventet token-format (forventede v1:iv:ct)`);
  }
  const iv = Buffer.from(parts[1], "base64");
  const ct = Buffer.from(parts[2], "base64");
  const pt = await webcrypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}

function print_preview(config, tenant) {
  console.log("\n📋 Preview:");
  console.log(`   Repo:         ${tenant.repo}`);
  console.log(`   Hostname:     ${config.hostname}`);
  console.log(`   Operations:   ${config.operations.length}`);
  for (const op of config.operations) {
    const label = op.uid || op.op.replace("create-", "");
    console.log(
      `     - ${op.op}: ${label} (${op.slices?.length ?? 0} slices)`,
    );
  }
}

async function confirm_or_abort(config, tenant) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(
      `\n⚠️  Du er ved at skrive til repo "${tenant.repo}" (hostname: ${config.hostname}). Skriv 'YES' for at fortsætte: `,
      resolve,
    );
  });
  rl.close();
  if (answer.trim() !== "YES") {
    console.log("❌ Aborted.");
    process.exit(0);
  }
}

async function execute_operations(config, tenant, tokens) {
  const write_client = createWriteClient(tenant.repo, {
    writeToken: tokens.write,
  });

  // Fetch alt eksisterende én gang. Bruges til skip-if-exists så re-runs er idempotente.
  const existing = new Set();
  try {
    const all = await write_client.dangerouslyGetAll();
    for (const doc of all) {
      const key = doc.uid
        ? `${doc.type}:${doc.lang}:${doc.uid}`
        : `${doc.type}:${doc.lang}`;
      existing.add(key);
    }
  } catch {
    // Empty repo — no existing docs
  }

  const migration = createMigration();
  let queued = 0;
  let skipped = 0;

  for (const op of config.operations) {
    const registered = register_op(migration, op, existing);
    if (registered) queued++;
    else skipped++;
  }

  console.log(`\n📋 ${queued} at oprette, ${skipped} eksisterer allerede.`);

  if (queued === 0) {
    console.log("✅ Intet at gøre.");
    return;
  }

  console.log("\n📤 Kører migration...");
  await write_client.migrate(migration, {
    reporter: (event) => {
      if (event.type === "documents:creating") {
        console.log(
          `   → Opretter ${event.data.current}/${event.data.total}: ${event.data.document.document?.type ?? "?"}`,
        );
      }
    },
  });
}

function register_op(migration, op, existing) {
  const lang = op.lang || "da-dk";
  switch (op.op) {
    case "create-page": {
      if (!op.uid) throw new Error(`create-page mangler 'uid'`);
      const key = `page:${lang}:${op.uid}`;
      if (existing.has(key)) return false;
      register_create_page(migration, op);
      return true;
    }
    case "create-navigation": {
      if (existing.has(`navigation:${lang}`)) return false;
      migration.createDocument(
        {
          type: "navigation",
          lang,
          data: {
            slices: (op.slices ?? []).map(convert_slice),
            language_selector: op.language_selector ?? "Slået fra",
          },
        },
        op.title ?? "Navigation",
      );
      return true;
    }
    case "create-footer": {
      if (existing.has(`footer:${lang}`)) return false;
      migration.createDocument(
        {
          type: "footer",
          lang,
          data: {
            logo: {},
            info_text: rt_paragraph(op.info_text),
            copyright: rt_paragraph(op.copyright),
            legal_links: (op.legal_links ?? []).map((l) => link(l.url, l.text)),
            columns: (op.columns ?? []).map(convert_slice),
            language_selector: op.language_selector ?? "Slået fra",
            background_theme: op.background_theme ?? "Mørk",
          },
        },
        op.title ?? "Footer",
      );
      return true;
    }
    case "create-business": {
      if (existing.has(`business:${lang}`)) return false;
      migration.createDocument(
        { type: "business", lang, data: {} },
        op.title ?? "Business",
      );
      return true;
    }
    case "create-settings": {
      if (existing.has(`settings:${lang}`)) return false;
      migration.createDocument(
        { type: "settings", lang, data: {} },
        op.title ?? "Indstillinger",
      );
      return true;
    }
    default:
      throw new Error(`Ukendt operation: ${op.op}`);
  }
}

function register_create_page(migration, op) {
  if (!op.uid) throw new Error(`create-page mangler 'uid'`);
  const lang = op.lang || "da-dk";
  const slices = (op.slices ?? []).map(convert_slice);
  migration.createDocument(
    {
      type: "page",
      lang,
      uid: op.uid,
      data: {
        meta_title: op.meta_title ?? "",
        meta_description: op.meta_description ?? "",
        noindex: op.noindex ?? false,
        slices,
      },
    },
    op.title ?? op.uid,
  );
}

function convert_slice(slice) {
  switch (slice.type) {
    case "hero_simple":
      return {
        slice_type: "hero_simple",
        variation: "default",
        primary: {
          heading: rt_heading1(slice.heading),
          body: rt_paragraph(slice.body),
          cta_link: link(slice.cta_url, slice.cta_text),
          background_theme: slice.background_theme || "Lys",
        },
      };
    case "header_classic":
      return {
        slice_type: "header_classic",
        variation: "default",
        primary: {
          logo: {},
          nav_items: (slice.nav_items ?? []).map((item) =>
            link(item.url, item.text),
          ),
          cta_link: slice.cta_url
            ? link(slice.cta_url, slice.cta_text)
            : { link_type: "Any" },
        },
      };
    default:
      throw new Error(`Ukendt slice-type i converter: ${slice.type}`);
  }
}

function rt_heading1(text) {
  if (!text) return [];
  return [{ type: "heading1", text, spans: [], direction: "ltr" }];
}

function rt_paragraph(text) {
  if (!text) return [];
  return [{ type: "paragraph", text, spans: [], direction: "ltr" }];
}

function link(url, text) {
  if (!url) return { link_type: "Any" };
  return { link_type: "Web", url, text: text ?? undefined };
}
