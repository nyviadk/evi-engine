import type { LinkResolverFunction } from "@prismicio/client";
import { resolve_section_theme } from "@/src/lib/prismic/section-theme";

export type SliceWithPrimary = {
  primary?: {
    background_theme?: string;
    backgroundSectionImage?: { url?: string | null };
    [key: string]: unknown;
  };
};

export interface SliceContext {
  theme: string;
  collapsePadding: boolean;
  isHero: boolean;
}

/** Delt context-shape som SliceZone på page-niveau sender til alle page-slices.
 *  `sliceContexts` er optional — kun slices der bruger cross-slice info
 *  (collapsePadding fx) læser den. Selvstændige slices ignorerer den. */
export interface EviPageSliceContext {
  linkResolver: LinkResolverFunction;
  sliceContexts?: SliceContext[];
}

export interface EviColors {
  light: string;
  dark: string;
  primary: string;
  secondary: string;
}

function resolve_bg(theme: string, colors: EviColors): string {
  const base = theme.replace("-soft", "").replace("-tint", "");
  return colors[base as keyof EviColors] || colors.light;
}

function theme_type(theme: string): "solid" | "soft" | "tint" {
  if (theme.endsWith("-tint")) return "tint";
  if (theme.endsWith("-soft")) return "soft";
  return "solid";
}

/**
 * Cross-slice info lookup for page-slices. Production: kommer fra
 * compute_slice_contexts (parent). Preview: kommer fra mock.ts's context.
 * Undefined felter bruger EviSection/EviHeadingGroup's egne defaults.
 */
export function resolve_slice_context(
  page_context: EviPageSliceContext,
  index: number,
): Partial<SliceContext> {
  return page_context.sliceContexts?.[index] ?? {};
}

export function compute_slice_contexts(
  slices: SliceWithPrimary[],
  colors?: EviColors,
): SliceContext[] {
  return slices.map((slice, index) => {
    const theme = resolve_section_theme(slice.primary?.background_theme);
    const hasImage = Boolean(slice.primary?.backgroundSectionImage?.url);

    if (index === 0) return { theme, collapsePadding: false, isHero: true };

    const prev = slices[index - 1];
    const prevTheme = resolve_section_theme(prev.primary?.background_theme);
    const prevHasImage = Boolean(prev.primary?.backgroundSectionImage?.url);

    const sameType = theme_type(theme) === theme_type(prevTheme);
    const sameVisual =
      sameType &&
      (theme === prevTheme ||
        (colors != null &&
          resolve_bg(theme, colors) === resolve_bg(prevTheme, colors)));

    return {
      theme,
      collapsePadding: sameVisual && !hasImage && !prevHasImage,
      isHero: false,
    };
  });
}
