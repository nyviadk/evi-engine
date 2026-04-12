export type SliceWithPrimary = {
  primary?: Record<string, any>;
};

export interface SliceContext {
  theme: string;
  collapsePadding: boolean;
  isHero: boolean;
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

export function compute_slice_contexts(
  slices: SliceWithPrimary[],
  colors?: EviColors,
): SliceContext[] {
  return slices.map((slice, index) => {
    const theme = slice.primary?.theme || "light";
    const hasImage = !!slice.primary?.backgroundSectionImage?.url;

    if (index === 0) return { theme, collapsePadding: false, isHero: true };

    const prev = slices[index - 1];
    const prevTheme = prev.primary?.theme || "light";
    const prevHasImage = !!prev.primary?.backgroundSectionImage?.url;

    // Only collapse within the same type (solid/soft/tint)
    const sameType = theme_type(theme) === theme_type(prevTheme);

    // Compare by theme name first, then fall back to resolved color
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
