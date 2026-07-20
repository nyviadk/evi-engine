// AES-GCM encryption for per-tenant Prismic tokens gemt i KV.
// Master-key ligger i Cloudflare Secrets Store, importeres én gang per
// Worker-instans og caches i modul-scope.
//
// Format i KV: "v1:base64(iv):base64(ciphertext_and_tag)"
//   - v1: version-prefix så vi kan tilføje v2 senere uden at bryde læsning
//   - iv: 12 random bytes (AES-GCM standard), aldrig genbrugt
//   - ciphertext_and_tag: AES-GCM output, som inkluderer authentication tag

const VERSION = "v1";
const IV_LENGTH = 12;
const KEY_LENGTH_BYTES = 32; // 256-bit AES key

let cached_key: CryptoKey | null = null;

/**
 * Importerer master-key fra base64-encoded raw bytes til en CryptoKey.
 * Caches i modul-scope så vi kun betaler import-cost én gang per Worker
 * instance (efter cold start).
 */
export async function import_master_key(raw_b64: string): Promise<CryptoKey> {
  if (cached_key) return cached_key;

  // Strip alt der ikke er base64 (whitespace, quotes fra Windows cmd echo,
  // BOM osv.). Defensive ved boundary — Secrets Store værdier kan være
  // kontamineret afhængigt af hvordan de blev uploaded.
  const cleaned = raw_b64.replace(/[^A-Za-z0-9+/=]/g, "");
  const raw = base64_to_bytes(cleaned);
  if (raw.length !== KEY_LENGTH_BYTES) {
    throw new Error(
      `Master key must be ${KEY_LENGTH_BYTES} bytes (got ${raw.length})`,
    );
  }

  cached_key = await crypto.subtle.importKey(
    "raw",
    raw as BufferSource,
    { name: "AES-GCM" },
    false, // ikke extractable — kan ikke exportes ud af Worker igen
    ["encrypt", "decrypt"],
  );
  return cached_key;
}

export async function encrypt_token(
  plaintext: string,
  key: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder().encode(plaintext);
  // as BufferSource: Uint8Array<ArrayBufferLike> vs BufferSource-mismatch i
  // TS strict-mode DOM-types. I Workers-runtime er buffer altid ArrayBuffer.
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc as BufferSource,
  );
  return `${VERSION}:${bytes_to_base64(iv)}:${bytes_to_base64(new Uint8Array(ct))}`;
}

export async function decrypt_token(
  encoded: string,
  key: CryptoKey,
): Promise<string> {
  const [version, iv_b64, ct_b64] = encoded.split(":");
  if (!iv_b64 || !ct_b64 || version !== VERSION) {
    throw new Error(
      `Unexpected token format (expected "${VERSION}:iv:ct", got "${version ?? ""}:…")`,
    );
  }
  const iv = base64_to_bytes(iv_b64);
  const ct = base64_to_bytes(ct_b64);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ct as BufferSource,
  );
  return new TextDecoder().decode(pt);
}

// ── Base64 helpers ─────────────────────────────────────────────────────
// atob/btoa er tilgængelige i Workers runtime.

function bytes_to_base64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function base64_to_bytes(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
