// HMAC-signeret bearer-token til stats-links. Samme kode bruges af Workeren
// (verify) og operatør-scriptet (sign) — begge har WebCrypto (crypto.subtle).
// Format: "<repo>.<version>.<base64url(HMAC-SHA256(repo.version))>".
// Kun operatøren kan lave et gyldigt token (kræver SERVER_SECRET); rotation =
// bump version i KV, så ældre tokens ikke længere matcher den nuværende version.

function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message) as BufferSource,
  );
  return base64url(new Uint8Array(sig));
}

// Konstant-tid sammenligning → ingen timing-side-channel ved verifikation.
function timing_safe_equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function make_stats_token(
  secret: string,
  repo: string,
  version: number,
): Promise<string> {
  const message = `${repo}.${version}`;
  return `${message}.${await sign(secret, message)}`;
}

export async function verify_stats_token(
  secret: string,
  token: string,
): Promise<{ repo: string; version: number } | null> {
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const sig = parts[parts.length - 1];
  const version_raw = parts[parts.length - 2];
  if (sig === undefined || version_raw === undefined) return null;
  const version = Number(version_raw);
  const repo = parts.slice(0, -2).join(".");
  if (!repo || !Number.isInteger(version)) return null;
  const expected = await sign(secret, `${repo}.${version}`);
  return timing_safe_equal(sig, expected) ? { repo, version } : null;
}
