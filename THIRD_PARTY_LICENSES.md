# Third-Party Icon Licenses

Evi Engine bruger [Iconify](https://iconify.design) til at rendere ikoner fra
en curated whitelist af pack'e. Alle er commercial-safe med permissive
licenser. Se `src/components/ui/EviIcon.tsx` for whitelist-enforcement.

Denne fil dokumenterer licenserne til de ikon-pack'e vi tillader — som
attribution-hygiejne, ikke fordi det er strengt påkrævet ved slutbruger-
rendering (SVG'er embedded via `<svg>` fritager typisk fra per-icon
notice).

## Whitelisted Icon Packs

### Lucide (`lucide:`)
- **Licens:** ISC (primary) + MIT (for Feather-baserede ikoner)
- **Copyright:** Lucide Icons and Contributors, 2026 · Cole Bemis (Feather), 2013-present
- **Kilde:** https://github.com/lucide-icons/lucide

### Phosphor Icons (`ph:`)
- **Licens:** MIT
- **Copyright:** Phosphor Icons, 2023
- **Kilde:** https://github.com/phosphor-icons/core

### Bootstrap Icons (`bi:`)
- **Licens:** MIT
- **Copyright:** The Bootstrap Authors, 2019-2024
- **Kilde:** https://github.com/twbs/icons

### Heroicons (`heroicons:`)
- **Licens:** MIT
- **Copyright:** Tailwind Labs, Inc.
- **Kilde:** https://github.com/tailwindlabs/heroicons

### Radix Icons (`radix-icons:`)
- **Licens:** MIT
- **Copyright:** WorkOS, 2022
- **Kilde:** https://github.com/radix-ui/icons

### Iconoir (`iconoir:`)
- **Licens:** MIT
- **Copyright:** Luca Burgio, 2021
- **Kilde:** https://github.com/iconoir-icons/iconoir

## Fælles licens-vilkår

Alle ovenstående er permissive open-source licenser (MIT / ISC / Apache 2.0)
der tillader:

- ✅ Commercial use uden begrænsning
- ✅ Modifikation og redistribution
- ✅ Ingen ShareAlike / copyleft-krav på afledte projekter
- ✅ Ingen per-icon attribution på slutbruger-rendered pages

Kravet er at LICENSE-teksten inkluderes i "substantial portions" af den
distribuerede software — hvilket denne fil + `node_modules/@iconify-*/*/LICENSE`
opfylder.
