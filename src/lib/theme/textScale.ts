// Mapping Dictionaries: Oversætter Prismic Selects til rene CSS-værdier

// Pr. tekstskala-valg: `scale` ganges på html font-size (skalerer alt rem-baseret);
// `headingDamp` ganges oveni PÅ store overskrifter (h1-h3) — 1 = fuld skalering,
// <1 dæmper så display-type ikke skriger ved den største tekst.
export const TEXT_SCALE_MAP: Record<
  string,
  { scale: string; headingDamp: string }
> = {
  "Standard (16px)": { scale: "1", headingDamp: "1" },
  "Stor (18px)": { scale: "1.125", headingDamp: "1" },
  // Ekstra stor: brødtekst +25%, men store overskrifter kun +12,5% (= samme
  // størrelse som "Stor", der ser godt ud): 1.25 × 0.9 = 1.125.
  "Ekstra stor (20px)": { scale: "1.25", headingDamp: "0.9" },
};
