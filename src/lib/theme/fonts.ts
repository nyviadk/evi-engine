import {
  Comfortaa,
  Abel,
  Poppins,
  Montserrat,
  Inter,
  Rethink_Sans,
  Roboto,
  Open_Sans,
} from "next/font/google";

// preload: false bruges da vi ellers risikerer at Next js sender alle fonte med alligevel
// Next.js er bygget til at være for aggressiv. Når vi definerer 8 fonte i vores kode, tænker Next.js under byggeprocessen:
// "Åh, han bruger 8 fonte! Dem må jeg hellere sætte til at preloade (downloade på forhånd), så de er klar med det samme!"
// Resultatet? Next.js ville i stilhed have skudt 8 usynlige <link rel="preload"> tags ind i toppen af din hjemmeside for alle kunder.
// Browserens Preload Scanner ignorerer CSS-regler fuldstændig – den ser bare et preload-link og begynder at downloade som en gal.
// --> Vores forsøg på at spare data ville have resulteret i, at alle kunders telefoner downloadede 8 ubrugte fonte i baggrunden!

// Variable fonte (Henter automatisk alle vægte i én fil)
export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
export const fontMontserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});
export const fontRethink = Rethink_Sans({
  subsets: ["latin"],
  variable: "--font-rethink",
  display: "swap",
  preload: false,
});
export const fontComfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
  preload: false,
});

// Statiske fonte (Vi angiver de mest brugte vægte, men sætter STADIG preload: false)
export const fontPoppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});
export const fontAbel = Abel({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-abel",
  display: "swap",
  preload: false,
});
export const fontRoboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  preload: false,
});
export const fontOpenSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-opensans",
  display: "swap",
  preload: false,
});

// Vores lookup-map, som vi bruger i layout.tsx
export const localFontMap: Record<string, { class: string; name: string }> = {
  Inter: { class: fontInter.variable, name: "var(--font-inter)" },
  Montserrat: {
    class: fontMontserrat.variable,
    name: "var(--font-montserrat)",
  },
  "Rethink Sans": { class: fontRethink.variable, name: "var(--font-rethink)" },
  Comfortaa: { class: fontComfortaa.variable, name: "var(--font-comfortaa)" },
  Poppins: { class: fontPoppins.variable, name: "var(--font-poppins)" },
  Abel: { class: fontAbel.variable, name: "var(--font-abel)" },
  Roboto: { class: fontRoboto.variable, name: "var(--font-roboto)" },
  "Open Sans": { class: fontOpenSans.variable, name: "var(--font-opensans)" },
};
