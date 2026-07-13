// Genererer en lille base64 blurDataURL fra et Prismic-billede (imgix), så
// next/image kan vise et blurret preview af DET FAKTISKE billede med det samme
// (ingen tom-ramme-flash), og skifte til skarpt når det fulde billede loader.
//
// Kaldes server-side (RSC). To-lags cache (#2):
//   L1 — modul-Map (LRU) pr. warm worker-isolate. Hurtigst, ingen async.
//   L2 — Cloudflare Cache API (caches.default): delt på tværs af ALLE isolates
//        i samme PoP og overlever isolate-genstart → et billede hentes/encodes
//        typisk kun én gang pr. PoP i stedet for én gang pr. isolate.
//
// L2 findes kun på Cloudflare Workers; i `next dev` (Node) er caches.default
// undefined → vi falder pænt tilbage til L1 + generering.
//
// Opgraderingssti til #3 (webhook → KV, nul render-fetch): kun dette modul
// ændres; genererings-API'et (get_blur_data_url) forbliver det samme.
//
// Hvorfor 16px: next/image forstørrer + blurrer selv, så et bittesmå billede
// (≤16px) anbefales — holder base64 lille (~1kb) og HTML let.

// ── L1: in-isolate LRU ──────────────────────────────────────────────────
const memory = new Map<string, string>();
const MAX_MEMORY = 256;

function remember(url: string, dataUrl: string): void {
  if (memory.has(url)) {
    memory.delete(url); // re-insert → flyt til enden (mest-nyligt-brugt)
  } else if (memory.size >= MAX_MEMORY) {
    const oldest = memory.keys().next().value; // LRU-evict ældste
    if (oldest !== undefined) memory.delete(oldest);
  }
  memory.set(url, dataUrl);
}

// ── L2: Cloudflare edge-cache (per-PoP) ─────────────────────────────────
type EdgeCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

function edge_cache(): EdgeCache | undefined {
  const c = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return c?.default;
}

function cache_key(url: string): Request {
  // Syntetisk nøgle-URL (skal ikke være fetchbar — den er bare cache-nøglen).
  return new Request(`https://phone-blur.internal/${encodeURIComponent(url)}`);
}

async function generate(url: string): Promise<string | undefined> {
  const sep = url.includes("?") ? "&" : "?";
  const res = await fetch(`${url}${sep}w=16&q=30&fit=max`);
  if (!res.ok) return undefined;

  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);

  const type = res.headers.get("content-type") ?? "image/jpeg";
  return `data:${type};base64,${base64}`;
}

export async function get_blur_data_url(
  url: string | null | undefined,
): Promise<string | undefined> {
  if (!url) return undefined;

  // L1
  const mem = memory.get(url);
  if (mem !== undefined) {
    remember(url, mem); // touch → LRU
    return mem;
  }

  const edge = edge_cache();

  // L2
  if (edge) {
    try {
      const hit = await edge.match(cache_key(url));
      if (hit) {
        const dataUrl = await hit.text();
        remember(url, dataUrl);
        return dataUrl;
      }
    } catch {
      // ignore — edge-cache er best-effort
    }
  }

  // Miss → generér (fejler stille → undefined → placeholder="empty")
  let dataUrl: string | undefined;
  try {
    dataUrl = await generate(url);
  } catch {
    return undefined;
  }
  if (dataUrl === undefined) return undefined;

  remember(url, dataUrl);

  if (edge) {
    try {
      await edge.put(
        cache_key(url),
        new Response(dataUrl, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            // Immutable: Prismic-URL'en har content-hash → skifter når billedet skifter.
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        }),
      );
    } catch {
      // ignore — put kan fejle, ikke kritisk
    }
  }

  return dataUrl;
}
