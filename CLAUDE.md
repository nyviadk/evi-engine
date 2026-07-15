@AGENTS.md

# Hard Rules — læs HVER session, følg uden undtagelse

Vi har mange memories/skills/regler. Antag ALDRIG at du ved hvordan — vi har lavet det før. Læs dem, ellers spilder vi tid på at genopdage ting der allerede virker.

## Før ENHVER opgave
- **Load `project_rulebook` memory** ved al kode/model/slice-arbejde.
- **Check first**: grep/read/fetch FØR du skriver. Genbrug eksisterende Evi-komponenter (`feedback_check_first_reuse_always`).
- **Verificér live state** før du påstår noget (`feedback_verify_state_before_asserting`). **Konkludér aldrig en root cause før den er testet** (`feedback_dont_conclude_prematurely`).
- **Next.js er IKKE training-data Next** — læs `node_modules/next/dist/docs/` før du skriver Next-kode.

## Ny slice — DETTE flow (hand-roll ALDRIG)
1. Læs prismic-memory (`project_prismic_type_builder`) + `project_rulebook`.
2. Læs skills: **building-components** + **vercel-composition-patterns**.
3. **Lav modellen via CLI** (aldrig hand-lav model.json — det bryder registry'et):
   - `npx prismic slice create <PascalName> --id <slice_id>` ← det ENESTE der registrerer slicen i `slices/index.ts`.
   - `npx prismic field add <type> <id> --to-slice <slice_id> [flags]` pr. felt (link har `--allow web|document|media`, `--allow-text`, `--repeatable`; kun image-`constraint` mangler flag → hand-edit-escape-hatch).
   - `npx prismic slice connect <slice_id> --to page`.
4. `npm run evi:model` (push → pull → gen types).
5. `npm run evi:new-slice <PascalName>` (scaffolder index.tsx + mock.ts — overskriver).
6. Byg indholdet (kun Evi-komponenter, `isFilled`-guards, ingen hardcodede tekst-tags).
7. `npm run evi:preview-slices`.
8. **Sig til brugeren at tjekke.** Brugeren kører selv `evi:sync-slices` + build.
- **KØR ALDRIG `prismic gen setup`** (laver Pages-Router-strays i `src/pages/` + bumper `@prismicio/next`).

## Skill-triggers — load FØR arbejdet, hver gang
| Trigger | Skill |
|---|---|
| Ny UI-komponent | **building-components** |
| Komponent-arkitektur (booleans/compound/state) | **vercel-composition-patterns** |
| async / bundle / server-perf | **vercel-react-best-practices** |
| Next.js-kode | **next-best-practices** |
| Next 16 `use cache` / PPR / cacheLife | **next-cache-components** |
| Major Next-bump | **next-upgrade** |
| Cloudflare / Workers / OpenNext | **cloudflare** |
| UI/a11y-review | **web-design-guidelines** (fetch friske regler fra remote) |
| Core Web Vitals (LCP/INP/CLS) | **web-perf** |

## Always-on konventioner
- Korte kommentarer — kun ikke-åbenlyst WHY/gotcha (`feedback_short_comments`).
- `isFilled` på ALLE Prismic-værdier (`feedback_prismic_isfilled`).
- Ingen hardcodede `<h1>`–`<h6>`/`<p>` — tekst via Rich Text + EviRichText (`feedback_no_hardcoded_text_tags`).
- Ingen barrel/index re-exports (`feedback_no_barrel_exports`).
- Ingen default Tailwind-shadows — brug `.shadow-evi`/`.shadow-evi-lg` (`feedback_no_default_shadows`).
- Fast antal = N navngivne felter, aldrig repeatable (`feedback_no_repeatable_for_fixed_count`).
- Next 16-billeder: `loading="eager"` (ikke `priority`), altid `sizes` på fill (`project_next16_image_eager_loading`).

## ALDRIG (bruger-only / destruktivt)
- Deploy (`deploy:clean` / opennext deploy) eller `evi:sync-slices` — **brugeren kører dem**.
- Læse `.env`/`.dev.vars`/secrets; `wrangler kv key get` på tenant-hosts.
- Git-branches; ændre `push-tenant.mjs`; hand-edit `customtypes/`/`slices/` (undtagen dokumenterede escape-hatches).
- Middleware-runtime skal være `experimental-edge`; build beholder `--webpack`.
