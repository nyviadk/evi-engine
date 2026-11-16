/** Farvetone 0–360, mætning og lysstyrke 0–1. */
export type Hsv = { h: number; s: number; v: number };

/** "#abc", "aabbcc" eller "#AABBCC" → "#AABBCC". Ugyldig → null. */
export function parse_hex(value: string): string | null {
  const raw = value.trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return /^[0-9a-f]{6}$/i.test(full) ? `#${full.toUpperCase()}` : null;
}

/**
 * "#RRGGBB" → HSV. Grå har ingen farvetone; så bruges `fallback_hue`, så
 * farvetone-skyderen ikke springer, når man trækker mod hvid eller sort.
 */
export function hex_to_hsv(hex: string, fallback_hue = 0): Hsv {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = fallback_hue;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export function hsv_to_hex({ h, s, v }: Hsv): string {
  const channel = (n: number): number => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return `#${[channel(5), channel(3), channel(1)]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}
