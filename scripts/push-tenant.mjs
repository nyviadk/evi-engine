// scripts/push-tenant.mjs
//
// Én kommando: node scripts/push-tenant.mjs
//
// Scriptet håndterer HELE flow'en for at oprette en encrypted tenant i KV:
//   1. Genererer master-key (32 random bytes) hvis den ikke findes i .dev.vars
//   2. Sikrer Cloudflare Secrets Store og master-key-secret findes
//   3. Sætter store_id i wrangler.jsonc
//   4. Krypterer dine Prismic-tokens med master-key
//   5. Bulk-uploader tenant til KV
//
// Kør bare scriptet — det er idempotent (kan køres flere gange).

import { execSync, spawnSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { webcrypto, randomBytes } from "crypto";

// ==========================================
// 1. UDFYLD KUNDENS INFO HER
// ==========================================
const testDomain = "evitest.nyvia.dk"; // Interne test domæne
// KV always stores Punycode (ift. æøå) - use punycoder.com
// Kundens domæne - ALTID UDEN WWW HER! Lad være tom hvis endnu ukendt (fx
// under dev-fase) — scriptet skipper KV-entryen. Re-kør scriptet med værdi
// når live-domænet er kendt.
const customDomain = "evi.nyvia.dk";

const config = {
  repo: "evi-engine",
  locales: ["da-dk"],
  default_locale: "da-dk",
  force_lang_prefix: false,
  redirects: {},
  // PLAINTEXT — bliver encrypted af scriptet før upload til KV
  prismic_token: "prismic_token",
  prismic_write_api_token: "prismic_write_api_token",
  synced_hash: "",
};

// ==========================================
// KONSTANTER — navne scriptet SELV opretter (rør ikke)
// ==========================================
// Scriptet OPRETTER disse ting første gang det køres — du skal ikke lave
// noget manuelt:
//   - Cloudflare Secrets Store med navnet STORE_NAME
//   - Master-key secret inde i store'et med navnet SECRET_NAME
//   - Linje i .dev.vars med navnet DEV_VARS_KEY = <base64-master-key>
const STORE_NAME = "evi-secrets";
const SECRET_NAME = "token-master-key";
const DEV_VARS_KEY = "TOKEN_MASTER_KEY";

// ==========================================
// SCRIPT
// ==========================================

console.log("🔐 Encrypted tenant setup + push\n");

const master_key_b64 = ensure_master_key_local();
const store_id = ensure_cloudflare_secrets_store(master_key_b64);
ensure_wrangler_store_id(store_id);
const encrypted_config = await encrypt_tokens(config, master_key_b64);
push_to_kv(encrypted_config);

console.log("\n✅ Færdig!");

// ==========================================
// HELPERS
// ==========================================

/**
 * Læser master-key fra .dev.vars, eller genererer + gemmer ny hvis den mangler.
 * Returnerer base64-encoded 32-byte key.
 */
function ensure_master_key_local() {
  const dev_vars_path = ".dev.vars";
  let existing = null;

  if (existsSync(dev_vars_path)) {
    const contents = readFileSync(dev_vars_path, "utf8");
    const match = contents.match(
      new RegExp(`^\\s*${DEV_VARS_KEY}\\s*=\\s*"?([^"\\r\\n]+)"?\\s*$`, "m"),
    );
    if (match) existing = match[1];
  }

  if (existing) {
    const raw = Buffer.from(existing, "base64");
    if (raw.length !== 32) {
      throw new Error(
        `${DEV_VARS_KEY} i .dev.vars skal være 32 bytes base64-encoded (var ${raw.length}). Slet linjen og kør igen for at generere en ny.`,
      );
    }
    console.log(`✅ Master-key fundet i .dev.vars`);
    return existing;
  }

  console.log("🔑 Genererer ny master-key...");
  const key = randomBytes(32).toString("base64");
  const line = `${DEV_VARS_KEY}=${key}\n`;
  if (existsSync(dev_vars_path)) {
    const contents = readFileSync(dev_vars_path, "utf8");
    writeFileSync(
      dev_vars_path,
      contents.endsWith("\n") ? contents + line : contents + "\n" + line,
    );
  } else {
    writeFileSync(dev_vars_path, line);
  }
  console.log(`✅ Master-key gemt i .dev.vars som ${DEV_VARS_KEY}`);
  console.log("   (.dev.vars er allerede i .gitignore — commit ikke filen)");
  return key;
}

/**
 * Sikrer at Cloudflare Secrets Store eksisterer og indeholder master-key.
 * Returnerer store_id.
 */
function ensure_cloudflare_secrets_store(master_key_b64) {
  console.log("\n☁️  Tjekker Cloudflare Secrets Store...");

  // 1. Find eksisterende store
  let store_id = null;
  try {
    const output = execSync("npx wrangler secrets-store store list --remote", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const re = new RegExp(`${STORE_NAME}[^\\n]*?\\b([a-f0-9]{20,})`, "i");
    const match = output.match(re);
    if (match) store_id = match[1];
  } catch {
    // list fejler måske hvis der ikke er nogen stores endnu — ignorer
  }

  // 2. Opret store hvis den ikke findes
  if (!store_id) {
    console.log(`   Store "${STORE_NAME}" mangler — opretter...`);
    try {
      const output = execSync(
        `npx wrangler secrets-store store create ${STORE_NAME} --remote`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
      );
      const match = output.match(/([a-f0-9]{20,})/i);
      if (match) store_id = match[1];
    } catch (err) {
      console.error(
        "❌ Kunne ikke oprette Cloudflare Secrets Store. Opret manuelt via CF dashboard eller:",
      );
      console.error(
        `   npx wrangler secrets-store store create ${STORE_NAME} --remote`,
      );
      throw err;
    }
  }

  if (!store_id) {
    throw new Error(
      "Kunne ikke finde/oprette store_id. Tjek CF dashboard eller kør manuelt.",
    );
  }
  console.log(`✅ Store: ${STORE_NAME} (${store_id})`);

  // 3. Upload master-key som secret. Idempotent via delete+create:
  //    - Find eksisterende secret ID (via list)
  //    - Slet hvis findes
  //    - Opret ny med spawnSync stdin (undgår Windows cmd echo-quoting bug)
  console.log("   Uploader master-key til Secrets Store...");

  const existing_id = find_secret_id(store_id, SECRET_NAME);
  if (existing_id) {
    console.log(`   Sletter eksisterende secret først...`);
    spawnSync(
      "npx",
      [
        "wrangler",
        "secrets-store",
        "secret",
        "delete",
        store_id,
        "--secret-id",
        existing_id,
        "--remote",
      ],
      { encoding: "utf8", shell: true },
    );
  }

  const create_result = spawnSync(
    "npx",
    [
      "wrangler",
      "secrets-store",
      "secret",
      "create",
      store_id,
      "--name",
      SECRET_NAME,
      "--scopes",
      "workers",
      "--remote",
    ],
    { input: master_key_b64, encoding: "utf8", shell: true },
  );

  if (create_result.status !== 0) {
    console.error(
      "❌ Kunne ikke uploade master-key. Prøv manuelt via CF dashboard.",
    );
    console.error(create_result.stderr);
    throw new Error("wrangler secret create failed");
  }
  console.log(`✅ Master-key uploaded som "${SECRET_NAME}"`);

  return store_id;
}

/**
 * Finder secret ID for et navn i store'et via text-parsing af list output.
 * Secret IDs er 32-char hex uden bindestreger (samme format som store IDs).
 */
function find_secret_id(store_id, secret_name) {
  const result = spawnSync(
    "npx",
    ["wrangler", "secrets-store", "secret", "list", store_id, "--remote"],
    { encoding: "utf8", shell: true },
  );
  if (result.status !== 0) return null;

  const hex_id_re = /\b([a-f0-9]{32})\b/i;
  for (const line of result.stdout.split("\n")) {
    if (line.includes(secret_name)) {
      const m = line.match(hex_id_re);
      if (m) return m[1];
    }
  }
  return null;
}

/** Skriver store_id ind i wrangler.jsonc (erstatter placeholder). */
function ensure_wrangler_store_id(store_id) {
  const path = "wrangler.jsonc";
  const content = readFileSync(path, "utf8");

  if (content.includes(store_id)) {
    console.log("✅ wrangler.jsonc har allerede korrekt store_id");
    return;
  }

  if (!content.includes("REPLACE_WITH_STORE_ID")) {
    console.warn(
      "⚠️  wrangler.jsonc har ikke REPLACE_WITH_STORE_ID og heller ikke det nuværende store_id — opdater manuelt til:",
    );
    console.warn(`   store_id: "${store_id}"`);
    return;
  }

  writeFileSync(path, content.replace("REPLACE_WITH_STORE_ID", store_id));
  console.log(`✅ wrangler.jsonc opdateret med store_id`);
}

/** Krypterer prismic_token + prismic_write_api_token med AES-GCM. */
async function encrypt_tokens(cfg, master_key_b64) {
  console.log("\n🔒 Krypterer tokens...");
  const raw = Buffer.from(master_key_b64, "base64");
  const key = await webcrypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const encrypt_one = async (plaintext) => {
    if (!plaintext) return "";
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const ct = await webcrypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext),
    );
    return `v1:${Buffer.from(iv).toString("base64")}:${Buffer.from(ct).toString("base64")}`;
  };

  return {
    ...cfg,
    prismic_token: await encrypt_one(cfg.prismic_token),
    prismic_write_api_token: await encrypt_one(cfg.prismic_write_api_token),
  };
}

/** Bulk-uploader tenant til KV med wrangler. */
function push_to_kv(encrypted_config) {
  const bulk = [
    {
      key: testDomain,
      value: JSON.stringify(encrypted_config),
      metadata: { repo: encrypted_config.repo },
    },
  ];
  if (customDomain && customDomain.trim() !== "") {
    bulk.push({
      key: customDomain,
      value: JSON.stringify(encrypted_config),
      metadata: { repo: encrypted_config.repo },
    });
  }
  const tmp = "temp-tenant.json";
  writeFileSync(tmp, JSON.stringify(bulk));

  const domains_msg =
    bulk.length === 2
      ? `${testDomain} + ${customDomain}`
      : `${testDomain} (customDomain skippet — tom)`;
  console.log(`\n📤 Uploader ${domains_msg} til KV...`);
  try {
    execSync(`npx wrangler kv bulk put ${tmp} --binding="TENANTS" --remote`, {
      stdio: "inherit",
    });
    console.log("✅ Encrypted tenants gemt i KV");
  } catch (err) {
    console.error("❌ KV upload fejlede");
    throw err;
  } finally {
    if (existsSync(tmp)) unlinkSync(tmp);
  }
}
