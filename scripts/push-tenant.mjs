import { execSync } from "child_process";
import fs from "fs";

// ==========================================
// 1. UDFYLD KUNDENS INFO HER
// ==========================================
const testDomain = "evitest.nyvia.dk"; // Interne test domæne
const customDomain = "evi.nyvia.dk"; // Kundens domæne - ALTID UDEN WWW HER!

const config = {
  repo: "evi-engine",
  locales: ["da-dk"],
  default_locale: "da-dk",
  force_lang_prefix: false,
  redirects: {},
  prismic_token: "dit_hemmelige_prismic_token_her",
  prismic_write_api_token: "dit_hemmelige_prismic_write_token_her",
  synced_hash: "",
};

// ---- script ----
// node scripts/push-tenant.mjs

// ==========================================

// 2. Vi bygger Cloudflares "Bulk"-format
const bulkData = [
  {
    key: testDomain,
    value: JSON.stringify(config),
    metadata: { repo: config.repo },
  },
  {
    key: customDomain,
    value: JSON.stringify(config),
    metadata: { repo: config.repo },
  },
];

// 3. Gem til en midlertidig fil
const tempFile = "temp-tenant.json";
fs.writeFileSync(tempFile, JSON.stringify(bulkData));

console.log(
  `🚀 Uploader ${testDomain}, ${customDomain} og www.${customDomain} til KV...`,
);

// 4. Send den til Cloudflare og slet den midlertidige fil bagefter
try {
  execSync(
    `npx wrangler kv bulk put ${tempFile} --binding="TENANTS" --remote`,
    { stdio: "inherit" },
  );
  console.log("✅ Succes! Alle 3 domæne-varianter er nu live.");
} catch (error) {
  console.error("❌ Der skete en fejl under upload.");
} finally {
  fs.unlinkSync(tempFile);
}
