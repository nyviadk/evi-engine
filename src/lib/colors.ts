export const DEFAULTS_COLORS = {
  color_light: "#FAFAFA",
  color_dark: "#302031",
  color_primary: "#0C6170",
  color_secondary: "#4d3b4d",
};

function hex_to_rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function srgb_to_linear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgb_to_linear(r) +
    0.7152 * srgb_to_linear(g) +
    0.0722 * srgb_to_linear(b)
  );
}

function contrast_ratio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrast_color(
  surface_hex: string,
  color_a: string,
  color_b: string,
): string {
  const surface_l = luminance(...hex_to_rgb(surface_hex));
  const a_ratio = contrast_ratio(surface_l, luminance(...hex_to_rgb(color_a)));
  const b_ratio = contrast_ratio(surface_l, luminance(...hex_to_rgb(color_b)));
  return a_ratio >= b_ratio ? color_a : color_b;
}

function mix_rgb(
  base: [number, number, number],
  overlay: [number, number, number],
  amount: number,
): [number, number, number] {
  return [
    Math.round(base[0] * (1 - amount) + overlay[0] * amount),
    Math.round(base[1] * (1 - amount) + overlay[1] * amount),
    Math.round(base[2] * (1 - amount) + overlay[2] * amount),
  ];
}

function rgb_to_hex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function compute_theme_vars(colors: {
  color_light?: string | null;
  color_dark?: string | null;
  color_primary?: string | null;
  color_secondary?: string | null;
}): React.CSSProperties {
  const light = colors.color_light || DEFAULTS_COLORS.color_light;
  const dark = colors.color_dark || DEFAULTS_COLORS.color_dark;
  const primary = colors.color_primary || DEFAULTS_COLORS.color_primary;
  const secondary = colors.color_secondary || DEFAULTS_COLORS.color_secondary;

  // Solid contrast
  const text_on_light = contrast_color(light, dark, light);
  const text_on_dark = contrast_color(dark, dark, light);
  const text_on_primary = contrast_color(primary, dark, light);
  const text_on_secondary = contrast_color(secondary, dark, light);

  // Soft contrast — simulate 10% of color mixed into the light background
  const light_rgb = hex_to_rgb(light);

  const soft_light = rgb_to_hex(...mix_rgb(light_rgb, hex_to_rgb(light), 0.1));
  const soft_dark = rgb_to_hex(...mix_rgb(light_rgb, hex_to_rgb(dark), 0.1));
  const soft_primary = rgb_to_hex(
    ...mix_rgb(light_rgb, hex_to_rgb(primary), 0.1),
  );
  const soft_secondary = rgb_to_hex(
    ...mix_rgb(light_rgb, hex_to_rgb(secondary), 0.1),
  );

  const text_on_light_soft = contrast_color(soft_light, dark, light);
  const text_on_dark_soft = contrast_color(soft_dark, dark, light);
  const text_on_primary_soft = contrast_color(soft_primary, dark, light);
  const text_on_secondary_soft = contrast_color(soft_secondary, dark, light);

  return {
    "--color-light": light,
    "--color-dark": dark,
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--text-on-light": text_on_light,
    "--text-on-dark": text_on_dark,
    "--text-on-primary": text_on_primary,
    "--text-on-secondary": text_on_secondary,
    "--text-on-light-soft": text_on_light_soft,
    "--text-on-dark-soft": text_on_dark_soft,
    "--text-on-primary-soft": text_on_primary_soft,
    "--text-on-secondary-soft": text_on_secondary_soft,
  } as React.CSSProperties;
}
