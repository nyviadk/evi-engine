# Evi Engine

**Live demo:** [evi.nyvia.dk](https://evi.nyvia.dk)

A multi-tenant SaaS platform that spins up N client websites from a single Next.js codebase. Each tenant gets their own content, domain, and branding — all served by one Cloudflare Worker at near-zero marginal cost per tenant.

**Stack:** Next.js 15.1 (App Router, RSC) · React 19 · Prismic CMS · Cloudflare Workers (via `@opennextjs/cloudflare`) · R2 · KV · Durable Objects · Tailwind v4 · TypeScript strict.

This README walks through the non-obvious decisions. Every claim links to the file and line that backs it.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack & Why](#tech-stack--why)
3. [Multi-Tenant Routing](#multi-tenant-routing)
4. [Tenant Config System (KV)](#tenant-config-system-kv)
5. [Performance & Caching (OpenNext)](#performance--caching-opennext)
6. [Security & Tenant Isolation](#security--tenant-isolation)
7. [Scalability](#scalability)
8. [Multi-Locale Content Model](#multi-locale-content-model)
9. [SEO Layer](#seo-layer)
10. [Design System & Theming](#design-system--theming)
11. [Component Architecture](#component-architecture)
12. [Slice Architecture](#slice-architecture)
13. [Developer Experience](#developer-experience)
14. [Deployment](#deployment)
15. [Project Status](#project-status)

---

## Architecture Overview

The core mental model: **one Worker, N tenants, three data layers.**

```
  Browser
     │
     ▼
  Cloudflare edge  ──►  Worker (single deployment)
                            │
                            ├─► middleware.ts reads Host header
                            │     └─► KV: get_tenant_config(host)
                            │
                            ├─► Page render (RSC)
                            │     └─► Prismic client scoped to tenant.repo
                            │
                            └─► OpenNext cache layer
                                  ├─ R2 (incremental cache)
                                  ├─ DO queue (revalidation)
                                  └─ DO sharded tag cache
```

### Three data layers

| Layer              | Role                                               | Source of truth                         |
| ------------------ | -------------------------------------------------- | --------------------------------------- |
| **TENANTS KV**     | Tenant catalog: repo, tokens, locale, redirects    | Authoritative for routing               |
| **Prismic CMS**    | Per-tenant content: pages, settings, business info | Authoritative for content               |
| **OpenNext cache** | Derived: R2 bodies + DO tag index                  | Derived; invalidated per-tenant via tag |

**Key design:** tenants are configured via `Host` header at request time — not via build-time config. Onboarding a new customer is one KV entry and one DNS record. Zero redeploy.

Cite: [middleware.ts](middleware.ts) · [src/lib/kv/tenants.ts](src/lib/kv/tenants.ts) · [open-next.config.ts](open-next.config.ts)

---

## Tech Stack & Why

Each choice names the alternative that was rejected and the reason.

### Next.js 15 App Router

RSC for per-request data fetching without round-tripping through the client. Streaming HTML. And — the one that matters most here — `React.cache()` for per-request fetch dedup. `Page()` and `generateMetadata()` both need the tenant config, Prismic settings, and page tree; wrapping the loader in `cache()` means the data is fetched **once per request**, not twice. See [app/[lang]/[[...uid]]/page.tsx:28-42](app/[lang]/[[...uid]]/page.tsx#L28-L42).

### Prismic CMS

Slice Machine gives the customer a real visual page builder — drag-and-drop slices inside a live preview. Alternatives considered: Sanity (more flexible, worse editor DX), Payload (needs a self-hosted DB, fights the edge-first architecture). Prismic's editor experience **is the product differentiator**; the API is just plumbing.

### Cloudflare Workers via `@opennextjs/cloudflare` — not Vercel

Cost trajectory at N tenants is the deciding factor:

- **R2 egress is free** — long-lived page caches cost nothing to serve.
- **Sub-cent KV reads** — hot-path tenant lookups are effectively free.
- **Wildcard domains without Enterprise** — `*.nyvia.dk` staging for every customer, on any plan.
- **Native `IMAGES` binding** — image transforms run outside the Worker's 50ms CPU budget.
- **OpenNext** preserves Next.js App Router semantics on the Workers runtime — RSC, streaming, `revalidateTag`, all work.

### Tailwind v4 `@theme inline`

Brand colors are stored in Prismic, read at request time, and injected as CSS custom properties on `<html>`. Every utility class (`bg-evi-primary`, `text-on-dark`) is a `var(--...)` reference, so the tenant's theme drives every component **without any runtime JS**. See `app/globals.css`.

### TypeScript strict + `moduleResolution: "bundler"`

- Forces explicit CSS-module declarations ([globals.d.ts](globals.d.ts)).
- `wrangler types` regenerates `CloudflareEnv` from bindings in [wrangler.jsonc](wrangler.jsonc) so `env.TENANTS` is typed as `KVNamespace`, `env.IMAGES` as `ImagesBinding`, etc.
- No `any` escape hatches in the hot path.

---

## Multi-Tenant Routing

### Host → tenant resolution

[middleware.ts:42-49](middleware.ts#L42-L49) reads `Host`, passes it to `get_tenant_config(hostname)`, which normalizes the hostname (stripping `www.`) and does a single `KV.get()`. Cold path ~15ms; warm path ~1-5ms via Cloudflare's regional KV cache.

### Danish character handling

[middleware.ts:32-41](middleware.ts#L32-L41) decodes the incoming pathname **at the very top of the middleware**:

```ts
const raw_pathname = request.nextUrl.pathname;
let pathname: string;
try {
  pathname = decodeURIComponent(raw_pathname);
} catch {
  pathname = raw_pathname;
}
```

Prismic stores redirect keys as readable text (`/æblekage`), but browsers send `/%C3%A6blekage`. Without this decode, the redirect map would never match. `try/catch` because `decodeURIComponent` throws on malformed input — a 404 bot probing `%ZZ` would otherwise 500 the middleware.

### Locale rules

Three scenarios in order ([middleware.ts:62-135](middleware.ts#L62-L135)):

1. **Path-level redirect match** — tenant's Prismic-defined vanity URLs take precedence.
2. **Language missing in URL** — negotiate via browser `Accept-Language` using `@formatjs/intl-localematcher` + `negotiator`. If `force_lang_prefix: false`, the content is _rewritten_ (hidden prefix) rather than redirected, so the pretty URL stays.
3. **Language in URL** — canonicalize: strip the default-locale prefix when `force_lang_prefix` is `false` (so `/da-dk/kontakt` → `/kontakt`).

### Home-at-root invariant

`/home` never exists as a reachable URL. [middleware.ts:76-84](middleware.ts#L76-L84) catches `/home` and `/{locale}/home` and 301s to the canonical root in **one hop**. [app/[lang]/[[...uid]]/page.tsx:63-65](app/[lang]/[[...uid]]/page.tsx#L63-L65) enforces the same invariant at render time as a belt-and-braces check. And [src/lib/prismic/paths.ts:40-41](src/lib/prismic/paths.ts#L40-L41) refuses to emit `home` in the path tree even if a content editor mis-sets `parent_page`.

### Domain classes

| Class                    | Example             | Purpose                |
| ------------------------ | ------------------- | ---------------------- |
| Flagship                 | `evi.nyvia.dk`      | Demo tenant / showroom |
| Wildcard staging         | `*.nyvia.dk`        | Per-customer staging   |
| Customer CNAME (planned) | `kundens-domæne.dk` | Cloudflare for SaaS    |

All routed by the **same Worker**. See [wrangler.jsonc:64-73](wrangler.jsonc#L64-L73).

---

## Tenant Config System (KV)

This is the crown jewel of the architecture and gets its own section.

### Two categories of tenant fields

[src/lib/kv/tenants.ts:4-14](src/lib/kv/tenants.ts#L4-L14) splits the `TenantConfig` interface into two groups:

**Bootstrap (manual, one-time):**

- `repo` — which Prismic repo this hostname reads from.
- `prismic_token` — API token for preview/draft reads.
- `prismic_write_api_token` — for automated slice sync.

Set via Cloudflare dashboard at onboarding. Never touched by automation.

**Synced (automatic, via webhook):**

- `locales`, `default_locale`, `force_lang_prefix`, `redirects`.

Denormalized from Prismic and read on the request hot path. A Prismic round-trip here would blow the 5ms middleware budget, so this data _has_ to live in KV.

### Reverse-index via KV metadata

[src/lib/kv/tenants.ts:85-122](src/lib/kv/tenants.ts#L85-L122) does something non-obvious: each tenant is stored with `metadata: { repo }`. When a Prismic webhook fires, `find_hostnames_by_repo()` calls `KV.list()` and reads the `repo` straight out of each key's metadata — **no per-key `KV.get()` required**. One Prismic publish → one `list()` call, not one `get()` per tenant.

The result is cached for 5 minutes in the Cloudflare Cache API so publish bursts don't trigger repeated scans.

### Hash-compare no-op skip

[src/lib/kv/sync.ts:64-68](src/lib/kv/sync.ts#L64-L68) computes `sha1(stable_stringify(synced_fields))` on each sync and skips the KV write if the hash matches the stored `synced_hash`. 9 out of 10 Prismic publishes don't touch tenant-level settings — they're just content edits. The skip saves KV writes and eliminates replication lag for the common case.

### Fetch-side cache busting inside sync

[src/lib/kv/sync.ts:86-92](src/lib/kv/sync.ts#L86-L92) passes `cache: "no-store"` when the sync client fetches Prismic. This fixes a subtle bug: sync runs **before** `revalidateTag`, so if the sync client used the default cache policy it would read R2-cached Prismic responses, see old `settings`, hash-match, and skip — silently preserving stale config. The comment on line 86 documents the reasoning.

### Localhost dev fallback

[src/lib/kv/tenants.ts:35-48](src/lib/kv/tenants.ts#L35-L48) short-circuits to an in-memory mock when `NODE_ENV === "development"`. `getCloudflareContext` is unreliable in `next dev`, so rather than crashing or forcing every dev to run `wrangler dev`, the UI-only workflow just works with `npm run dev`.

---

## Performance & Caching (OpenNext)

The OpenNext cache stack is where the architecture earns its keep. Configuration: [open-next.config.ts](open-next.config.ts).

### R2 Incremental Cache + Regional Cache

[open-next.config.ts:14-17](open-next.config.ts#L14-L17):

```ts
incrementalCache: withRegionalCache(r2IncrementalCache, {
  mode: "long-lived",
  bypassTagCacheOnCacheHit: false,
}),
```

- **`mode: "long-lived"`** — cached bodies live for hours, not minutes. R2 egress is free, so we pay nothing for long TTLs. Publish invalidates via tag, so stale bodies never reach users.
- **`bypassTagCacheOnCacheHit: false`** — deliberate. Was `true` initially, which skipped tag checks on regional-cache hits and left stale pages live for minutes after publish. Flipped to `false` after the bug was traced.

### Durable Object queue

[open-next.config.ts:18-21](open-next.config.ts#L18-L21):

```ts
queue: queueCache(doQueue, {
  regionalCacheTtlSec: 5,
  waitForQueueAck: false,
}),
```

`waitForQueueAck: false` means the revalidation response returns to the user as soon as the fresh cache entry is written — the tag-cache propagation happens async behind the DO queue. First hit after purge is fast.

### Sharded DO tag cache

[open-next.config.ts:22-34](open-next.config.ts#L22-L34):

```ts
tagCache: withFilter({
  tagCache: doShardedTagCache({
    baseShardSize: 12,
    shardReplication: {
      numberOfSoftReplicas: 4,
      numberOfHardReplicas: 2,
      regionalReplication: { defaultRegion: "weur" },
    },
  }),
  filterFn: softTagFilter,
}),
```

The math: a single DO throttles at ~10 writes/sec. With 100 tenants publishing simultaneously, a non-sharded tag cache would be the bottleneck. 12 shards × 4 soft replicas keeps per-DO throughput well under that ceiling.

**`softTagFilter`** drops Next's internal path-tags (`_N_T_/path/foo`) from the cache layer. This project never calls `revalidatePath` — only `revalidateTag("prismic-<repo>")`. Filtering the unused path-tags roughly halves tag-cache load.

### Cache Purge buffer

[open-next.config.ts:36](open-next.config.ts#L36): `cachePurge: purgeCache({ type: "durableObject" })` — dedupes concurrent webhook-triggered purges into a single Cloudflare API call. During customer burst publishes, 100 webhook invocations become ~1-2 CF API calls. Rate-limit 429s are a non-issue.

### Cloudflare IMAGES binding

[wrangler.jsonc:27-31](wrangler.jsonc#L27-L31). Next's built-in image loader runs `sharp`/`squoosh` inside the Worker isolate — a 5MB hero image would blow the 50ms CPU budget. The `IMAGES` binding delegates to Cloudflare's native image pipeline, so transforms happen **outside** Worker CPU accounting. A page with 20 optimized images stays under budget.

### Per-tenant fetch tags

[prismicio.ts:31-34](prismicio.ts#L31-L34) tags every Prismic fetch with `prismic-${tenant.repo}`:

```ts
fetchOptions: process.env.NODE_ENV === "production"
  ? { next: { tags: [`prismic-${tenant.repo}`] }, cache: "force-cache" }
  : { next: { revalidate: 5 } },
```

A single `revalidateTag("prismic-example")` in the webhook ([app/api/revalidate/route.ts:35](app/api/revalidate/route.ts#L35)) invalidates every R2-cached page for that tenant **across all hostnames** — prod and staging stay in sync automatically.

---

## Security & Tenant Isolation

### Type-level isolation

[src/lib/prismic/paths.ts:6-9](src/lib/prismic/paths.ts#L6-L9) defines `PathConfig` as a **structural subset** of `TenantConfig`:

```ts
export type PathConfig = {
  default_locale: string;
  force_lang_prefix: boolean;
};
```

Client-bundled code accepts `PathConfig`, not `TenantConfig`. TypeScript prevents `prismic_token` from accidentally crossing into the browser bundle. Structural typing means `TenantConfig` is still assignable — no runtime adapter needed.

### Per-tenant Prismic clients

[prismicio.ts:24-46](prismicio.ts#L24-L46): each request creates a client scoped to _that_ tenant's repo and token. No shared client state, no global token. One tenant's leaked token never reads another's data — different repo, different API endpoint.

### HSTS everywhere

`src/lib/utils/security.ts` applies `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` on every response via `create_response_with_hsts`. Used consistently in middleware.

### HTTPS canonicalization

`create_secure_url` forces `https:` in production. `request.url` on the Workers runtime can lose protocol context in some edge cases; this helper is the guaranteed-safe way to construct redirect targets.

### Webhook signature verification

[app/api/revalidate/route.ts:17-22](app/api/revalidate/route.ts#L17-L22): Prismic's `secret` field is checked against `PRISMIC_WEBHOOK_SECRET`, stored as a Wrangler secret (never in committed files). The only side-effects of a bogus webhook are a 401 and a log line.

### JSON-LD XSS escaping

`src/lib/seo/safeJsonLdStringify.ts` escapes `<`, `>`, `/`, `U+2028`, and `U+2029` in every inline `<script type="application/ld+json">` block. If a customer pastes hostile content into a Prismic field, `</script>` breakout is prevented.

### Staging isolation

`src/lib/seo/domains.ts` — staging hostnames (`*.nyvia.dk`, excluding the flagship demo) get `robots: { index: false, follow: false }` on every page + `Disallow: /` in `robots.txt`. Staging content can never pollute Google for the customer's live domain.

### Cloudflare Bot Fight Mode caveat

The zone-level Bot Fight Mode must stay **OFF** on `nyvia.dk`. It 403s Prismic's webhook at the edge before the Worker runs — intermittent because Prismic retries sometimes slip through. On a paid Cloudflare plan the proper fix is a WAF Custom Rule scoped to `URI Path eq /api/revalidate` + `Hostname eq evi.nyvia.dk`, skipping bot protection for that one path.

---

## Scalability

How the system handles 100+ tenants without slowing down — one paragraph per bottleneck the architecture anticipates.

**Tenant lookup:** `O(1)` `KV.get()` by hostname, ~1-5ms warm from edge regional cache. Cost scales with _requests_, not with _number of tenants_.

**Content cache:** per-tenant R2 keys, per-tenant tags. One tenant's publish never invalidates another tenant's cache — they share no cache keyspace.

**Publish burst:** 100 simultaneous `/api/revalidate` hits fan out through these dedup layers:

1. `find_hostnames_by_repo` list → 5 min Cache API hit
2. Per-hostname sync → hash-compare skips no-ops
3. `revalidateTag` → DO queue dedups purges
4. Cloudflare Cache Purge API → buffer dedups to ~1-2 calls

Result: 100 webhooks → 1-2 CF API invocations. No rate-limit pressure.

**Image load:** 0% Worker CPU on image transforms (IMAGES binding). Worker CPU spent on the Page render only, not on pixel munging.

**Font weight ceiling:** [src/lib/theme/fonts.ts:13-18](src/lib/theme/fonts.ts#L13-L18) disables `preload` on all 9 Google fonts. Next's preload scanner otherwise silently injects `<link rel="preload">` for _every_ registered font on every cold visit — ~1-2 MB wasted per visitor. With `preload: false`, fonts load on-demand via CSS `@font-face` only when actually used by the active theme.

**Wildcard + custom hostnames:** the same Worker serves `evi.nyvia.dk`, `*.nyvia.dk`, and arbitrary customer CNAMEs via Cloudflare for SaaS Custom Hostnames. Marginal cost per new tenant: **one KV entry and one DNS record**. No code change, no redeploy, no per-tenant dyno or container.

---

## Multi-Locale Content Model

### Path tree from `parent_page` chain

[src/lib/prismic/paths.ts:16-66](src/lib/prismic/paths.ts#L16-L66) builds `Map<doc_id, uid_segments[]>` by resolving each document's `parent_page` chain. A page with parent `vores-historie` whose parent is `om-os` resolves to `["om-os", "vores-historie", "kontakt"]`.

Safeguards:

- **Circular reference protection:** line 37 seeds `cache.set(id, [doc.uid])` **before** recursing, so a cycle resolves to the immediate UID rather than infinite-looping.
- **Home-anchor protection:** lines 40-41 and 50 — `home` is never a parent; if an editor mis-sets `parent_page` to point at Home, the resolver refuses to emit `/home/<child>`.

### URL canonicalization at render time

[app/[lang]/[[...uid]]/page.tsx:67-75](app/[lang]/[[...uid]]/page.tsx#L67-L75) compares the actual URL segments against the expected tree and 301s to canonical on mismatch. Protects against old indexed URLs (e.g. a page moved under a new parent still works — Google gets redirected to the new canonical URL and eventually updates).

### Locale prefix rules

[src/lib/prismic/paths.ts:72-90](src/lib/prismic/paths.ts#L72-L90) — `force_lang_prefix: false` on default locale → no prefix (`/about`). Any other case → prefix included (`/en-gb/about`). The rule is per-tenant, synced from Prismic's `settings` document.

---

## SEO Layer

### Sitemap with hreflang grouping

[app/sitemap.ts:32-50](app/sitemap.ts#L32-L50) groups translations by _default-locale_ document ID so each logical page emits one `<url>` with an `alternates.languages` block. For a tenant with 4 locales, this reduces sitemap size by ~4x and gives search engines the hreflang graph correctly in one place.

### JSON-LD `@graph` emitter

`src/lib/seo/schemaCollector.ts` emits a Schema.org `@graph` containing:

- **Organization / LocalBusiness / Person / Corporation** — picked from `business.schema_mode` in Prismic.
- **BreadcrumbList** — built from URL segments, skipping the locale prefix and the home-segment.
- **`custom_schema_json`** — optional escape hatch for power users who want to hand-craft a schema type not otherwise supported.

Typed with `schema-dts` for compile-time Schema.org validation — typos in `@type` values are caught at build time, not by Google's Rich Results test.

### Smart title generation

[app/[lang]/[[...uid]]/page.tsx:144-164](app/[lang]/[[...uid]]/page.tsx#L144-L164) handles three cases:

- Home without `meta_title` → site name alone (`"Frisør Jensen"`).
- `meta_title` containing `|` → trusted verbatim (the editor is branding manually).
- Otherwise → `"{pageLabel} | {siteName}"`.

Stops the "Untitled | MySite" anti-pattern without overruling editors who want explicit control.

### Per-tenant robots.txt

`app/robots.ts` serves `Disallow: /` for staging and `Allow: /` + sitemap URL for production. The decision is per-request, based on `is_staging_domain(host)`. One route handler, every tenant.

### Preview mode

[app/api/preview/route.ts](app/api/preview/route.ts) uses Prismic SDK's `redirectToPreviewURL` + per-tenant draft token from KV. Editors hit the Prismic UI's "Preview" button and land on the correct hostname's draft view, scoped to that tenant.

---

## Design System & Theming

### WCAG 2.1 contrast math in the theme generator

`src/lib/theme/colors.ts` computes `text-on-{light,dark,primary,secondary}` from relative luminance and contrast-ratio formulas. The customer picks any two brand colors in Prismic; black or white text is auto-chosen so every text/background pair meets AA contrast. **No manual adjustments needed** per customer.

### Button safety variables

16 `--btn-{primary,secondary}-{bg,text,ink}-on-{light,dark,primary,secondary}` CSS variables are computed per tenant. If a button's color pairing fails the 1.5:1 graphical-object threshold against its section background, the button falls back to the section's text color so it remains visible. Never a button that disappears into its section.

### Soft / tint / surface variants

- `theme-*-soft` — `color-mix(oklch, <brand> 10%, light)` for pale brand-tinted surfaces.
- `theme-*-tint` — overlay-opacity variant.
- `theme-surface-neutral` — `color-mix(currentColor 8%, transparent)` so card backgrounds adapt to _any_ theme without a second CSS variable.

All computed in CSS. Zero runtime JS.

### Container queries throughout

[src/components/layout/EviSection.tsx:37](src/components/layout/EviSection.tsx#L37) applies `@container/section` on the section's inner grid div. `EviAutoGrid` breakpoints are measured in **section width, not viewport width**. A 2-column section inside a split layout breaks differently than a full-width section — because it should. Nested grids respond to their slot, not the page.

### CSS subgrid for row alignment

`EviCard rows={N}` uses `grid-rows-subgrid` so card heights stay aligned across sibling cards in an auto-grid, even with varying content length. No manual `min-height` hacks, no JS height measurement.

### `evi-prose` typography

`app/globals.css` — Major Third scale (1.250) with fluid `clamp()` headings and a 24px baseline rhythm. `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.

### Fonts: `preload: false` deliberately

[src/lib/theme/fonts.ts:13-18](src/lib/theme/fonts.ts#L13-L18) — full comment block documents the trade-off. Without `preload: false`, Next's preload scanner silently downloads _every_ registered font on _every_ cold visit — browsers ignore CSS rules when deciding what to preload, so it sees all 9 `next/font/google` imports and fetches all 9. `preload: false` + `display: swap` loads fonts on-demand via CSS.

Live design system playground — driven by [src/components/EviTestBench.tsx](src/components/EviTestBench.tsx). Every theme × component combo, with a live color-picker showing contrast math in real time.

---

## Component Architecture

| Component     | Purpose                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `EviSection`  | 12-col grid, theme, `collapsePadding` / `collapseGapY` props              |
| `EviSplit`    | Subgrid, 5 presets (50-50, 60-40, 40-60, 70-30, 30-70), 4 vertical aligns |
| `EviAutoGrid` | Container-query breakpoints (`sm`, `md`, `lg`)                            |
| `EviCard`     | `grid-rows-subgrid` for cross-card alignment                              |
| `EviStack`    | Vertical flex with 5 gap presets                                          |
| `EviButton`   | variant × appearance × size (3 × 3 × 3), theme-safe color fallbacks       |
| `EviImage`    | `PrismicNextImage` + `<picture>` art direction + CF IMAGES pipeline       |
| `EviRichText` | `PrismicRichText` wrapped in `evi-prose`                                  |

---

## Slice Architecture

The `slices/` directory is **intentionally empty**. Slice Machine is fully wired ([slicemachine.config.json](slicemachine.config.json)), but the base design system comes first — so every future slice inherits the grid, theme, and contrast primitives rather than reinventing them per slice.

### SliceZone context pattern

Pages pass `{ linkResolver, sliceContexts }` into `<SliceZone context={...} />`. Each slice receives pre-computed `{ theme, collapsePadding, isHero }` resolved from the **whole page's** slice order — slices never each recompute adjacency with their neighbors.

### `compute_slice_contexts`

`src/lib/prismic/slices.ts` resolves theme adjacency and hero-flagging once per page render, passed down. A slice with the same theme as its neighbor gets `collapsePadding: true` (visual continuity); the first slice on a page gets `isHero: true` for top-spacing.

---

## Developer Experience

### One dev command

[package.json:7](package.json#L7):

```
npm run dev  # next dev + slice-machine, concurrently, colored prefixes
```

### Generated Cloudflare types

```
npm run cf-typegen
```

Runs `wrangler types --env-interface CloudflareEnv` against [wrangler.jsonc](wrangler.jsonc), writing [cloudflare-env.d.ts](cloudflare-env.d.ts). `env.TENANTS` becomes `KVNamespace`; `env.IMAGES` becomes `ImagesBinding`; etc. Adding a new binding is a two-line change + one typegen run.

### Localhost fallback

The dev-mode mock in [src/lib/kv/tenants.ts:22-33](src/lib/kv/tenants.ts#L22-L33) lets the full app run on `npm run dev` without wrangler — fine for UI-only work, design iteration, and slice development.

### `npm run preview`

```
opennextjs-cloudflare build && opennextjs-cloudflare preview
```

Runs the fully-built Worker with wrangler dev for cache-behavior testing locally. Required when touching anything in the OpenNext cache layer.

---

## Deployment

### Build + deploy

```
npm run deploy
```

Runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy` — Worker + assets uploaded in one step.

### Bindings

Declared in [wrangler.jsonc](wrangler.jsonc):

| Binding                     | Type  | Purpose                                 |
| --------------------------- | ----- | --------------------------------------- |
| `TENANTS`                   | KV    | Tenant config catalog                   |
| `NEXT_INC_CACHE_R2_BUCKET`  | R2    | OpenNext incremental cache bodies       |
| `NEXT_CACHE_DO_QUEUE`       | DO    | OpenNext revalidation queue             |
| `NEXT_TAG_CACHE_DO_SHARDED` | DO    | OpenNext sharded tag cache              |
| `NEXT_CACHE_DO_PURGE`       | DO    | OpenNext cache purge buffer             |
| `IMAGES`                    | img   | Cloudflare IMAGES binding               |
| `WORKER_SELF_REFERENCE`     | svc   | Self-service binding for internal calls |
| `ASSETS`                    | fetch | Static assets from `.open-next/assets`  |

### Secrets

Managed via `wrangler secret put`:

- `PRISMIC_WEBHOOK_SECRET`
- `CACHE_PURGE_API_TOKEN`
- `CACHE_PURGE_ZONE_ID`

Never committed. `.dev.vars` is `.gitignore`d.

### Durable Object migration

[wrangler.jsonc:54-63](wrangler.jsonc#L54-L63) uses `v1` with `new_sqlite_classes` for `DOQueueHandler`, `DOShardedTagCache`, `BucketCachePurge` — the SQLite-backed DO variant for better cost and performance over classic DOs.

### Deployment gotchas

- **Cloudflare Bot Fight Mode** must stay OFF on the zone. Blocks Prismic's webhook with 403 at the edge before the Worker runs. (Free plan has no WAF Custom Rules to carve out an exception.)
- **Debug logs** require `NEXT_PRIVATE_DEBUG_CACHE=true` (not `OPEN_NEXT_DEBUG` — common mistake).
- **DO binding names** are hardcoded in OpenNext source: `NEXT_CACHE_DO_QUEUE`, `NEXT_TAG_CACHE_DO_SHARDED`, `NEXT_CACHE_DO_PURGE`. Don't rename.

---

**Live:** [evi.nyvia.dk](https://evi.nyvia.dk)
