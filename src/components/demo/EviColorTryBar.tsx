"use client";

import { useEffect, useState } from "react";

import { compute_theme_vars } from "@/src/lib/theme/colors";

export type EviColors = {
  light: string;
  dark: string;
  primary: string;
  secondary: string;
};

const ORDER: (keyof EviColors)[] = ["primary", "secondary", "light", "dark"];

// Kun da/en (sitet er da-først, alt andet falder til en). Udvid ved behov.
const T = {
  da: {
    title: "Vælg egne farver",
    color: "farve",
    primary: "Primær",
    secondary: "Sekundær",
    light: "Lys",
    dark: "Mørk",
  },
  en: {
    title: "Choose own colors",
    color: "color",
    primary: "Primary",
    secondary: "Secondary",
    light: "Light",
    dark: "Dark",
  },
} as const;

/**
 * "Se med dine farver"-bjælke til demo-sider (evi.nyvia.dk + demoer): lader
 * besøgende prøve sitet med deres egne brandfarver live. Sætter de beregnede
 * tema-vars på `<body>`, som overstyrer `<html>`'s tenant-farver for ALT
 * indhold. Kun demo-chrome — host-gated i layout.tsx, aldrig på kunde-domæner.
 *
 * `initial` = sitets faktiske farver (server-props, IKKE DOM-læsning) → korrekt
 * baseline uden hydration-mismatch. `lang` styrer labels (da/en).
 */
export function EviColorTryBar({
  initial,
  lang,
}: {
  initial: EviColors;
  lang: string;
}): React.ReactElement {
  const [colors, setColors] = useState<EviColors>(initial);
  const t = lang.toLowerCase().startsWith("da") ? T.da : T.en;

  useEffect(() => {
    const vars = compute_theme_vars({
      color_light: colors.light,
      color_dark: colors.dark,
      color_primary: colors.primary,
      color_secondary: colors.secondary,
    });
    for (const [key, value] of Object.entries(vars)) {
      document.body.style.setProperty(key, String(value));
    }
  }, [colors]);

  return (
    <div
      data-slot="evi-color-try-bar"
      className="theme-dark sticky inset-x-0 top-0 z-50 border-b border-current/10"
    >
      <div className="mx-auto flex max-w-evi flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-sm">
        <span className="font-medium">{t.title}</span>
        <div className="flex flex-wrap items-center gap-4">
          {ORDER.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2"
            >
              <span className="opacity-80">{t[key]}</span>
              <input
                type="color"
                value={colors[key]}
                onChange={(e) =>
                  setColors((c) => ({ ...c, [key]: e.target.value }))
                }
                className="size-6 cursor-pointer rounded bg-transparent p-0"
                aria-label={`${t[key]} ${t.color}`}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
