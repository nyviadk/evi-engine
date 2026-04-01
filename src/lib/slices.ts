interface SliceWithPrimary {
  primary?: {
    theme?: string;
    backgroundSectionImage?: { url?: string } | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SliceContext {
  theme: string;
  collapsePadding: boolean;
}

export function compute_slice_contexts(slices: SliceWithPrimary[]): SliceContext[] {
  return slices.map((slice, index) => {
    const theme = slice.primary?.theme || "light";
    const hasImage = !!slice.primary?.backgroundSectionImage?.url;

    if (index === 0) return { theme, collapsePadding: false };

    const prev = slices[index - 1];
    const prevTheme = prev.primary?.theme || "light";
    const prevHasImage = !!prev.primary?.backgroundSectionImage?.url;

    return {
      theme,
      collapsePadding: theme === prevTheme && !hasImage && !prevHasImage,
    };
  });
}
