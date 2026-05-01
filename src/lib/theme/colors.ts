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

// Compute safe button colors for a given section background.
// Returns three values from one contrast check:
//   bg/text  — for solid buttons (1.5 graphical-object threshold)
//   ink      — for outline/text buttons (4.5 WCAG text threshold)
// https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
function compute_btn_on_section(
  btn_color: string,
  btn_text: string,
  section_bg: string,
  section_text: string,
): { bg: string; text: string; ink: string } {
  const ratio = contrast_ratio(
    luminance(...hex_to_rgb(btn_color)),
    luminance(...hex_to_rgb(section_bg)),
  );
  return {
    bg: ratio >= 1.5 ? btn_color : section_text,
    text: ratio >= 1.5 ? btn_text : section_bg,
    ink: ratio >= 4.5 ? btn_color : section_text,
  };
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

  // Link/ink contrast — 4.5:1 threshold: vælg primary hvis den passer,
  // ellers fald tilbage til sektionens egen text-farve.
  const link_on_light =
    contrast_ratio(luminance(...hex_to_rgb(primary)), luminance(...hex_to_rgb(light))) >= 4.5
      ? primary
      : text_on_light;
  const link_on_dark =
    contrast_ratio(luminance(...hex_to_rgb(primary)), luminance(...hex_to_rgb(dark))) >= 4.5
      ? primary
      : text_on_dark;

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

  // Button safety vars — {primary, secondary} × {light, dark, primary, secondary}
  const pri_on_light = compute_btn_on_section(
    primary,
    text_on_primary,
    light,
    text_on_light,
  );
  const pri_on_dark = compute_btn_on_section(
    primary,
    text_on_primary,
    dark,
    text_on_dark,
  );
  const pri_on_primary = compute_btn_on_section(
    primary,
    text_on_primary,
    primary,
    text_on_primary,
  );
  const pri_on_secondary = compute_btn_on_section(
    primary,
    text_on_primary,
    secondary,
    text_on_secondary,
  );

  const sec_on_light = compute_btn_on_section(
    secondary,
    text_on_secondary,
    light,
    text_on_light,
  );
  const sec_on_dark = compute_btn_on_section(
    secondary,
    text_on_secondary,
    dark,
    text_on_dark,
  );
  const sec_on_primary = compute_btn_on_section(
    secondary,
    text_on_secondary,
    primary,
    text_on_primary,
  );
  const sec_on_secondary = compute_btn_on_section(
    secondary,
    text_on_secondary,
    secondary,
    text_on_secondary,
  );

  return {
    "--color-light": light,
    "--color-dark": dark,
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--text-on-light": text_on_light,
    "--text-on-dark": text_on_dark,
    "--text-on-primary": text_on_primary,
    "--text-on-secondary": text_on_secondary,
    // Link/focus-ink vars — 4.5:1 kontrast
    "--theme-link-on-light": link_on_light,
    "--theme-link-on-dark": link_on_dark,
    "--text-on-light-soft": text_on_light_soft,
    "--text-on-dark-soft": text_on_dark_soft,
    "--text-on-primary-soft": text_on_primary_soft,
    "--text-on-secondary-soft": text_on_secondary_soft,
    // Button safety: primary on each section
    "--btn-primary-bg-on-light": pri_on_light.bg,
    "--btn-primary-text-on-light": pri_on_light.text,
    "--btn-primary-bg-on-dark": pri_on_dark.bg,
    "--btn-primary-text-on-dark": pri_on_dark.text,
    "--btn-primary-bg-on-primary": pri_on_primary.bg,
    "--btn-primary-text-on-primary": pri_on_primary.text,
    "--btn-primary-bg-on-secondary": pri_on_secondary.bg,
    "--btn-primary-text-on-secondary": pri_on_secondary.text,
    // Button safety: secondary on each section
    "--btn-secondary-bg-on-light": sec_on_light.bg,
    "--btn-secondary-text-on-light": sec_on_light.text,
    "--btn-secondary-bg-on-dark": sec_on_dark.bg,
    "--btn-secondary-text-on-dark": sec_on_dark.text,
    "--btn-secondary-bg-on-primary": sec_on_primary.bg,
    "--btn-secondary-text-on-primary": sec_on_primary.text,
    "--btn-secondary-bg-on-secondary": sec_on_secondary.bg,
    "--btn-secondary-text-on-secondary": sec_on_secondary.text,
    // Ink vars for outline / text buttons (4.5:1 text contrast)
    "--btn-primary-ink-on-light": pri_on_light.ink,
    "--btn-primary-ink-on-dark": pri_on_dark.ink,
    "--btn-primary-ink-on-primary": pri_on_primary.ink,
    "--btn-primary-ink-on-secondary": pri_on_secondary.ink,
    "--btn-secondary-ink-on-light": sec_on_light.ink,
    "--btn-secondary-ink-on-dark": sec_on_dark.ink,
    "--btn-secondary-ink-on-primary": sec_on_primary.ink,
    "--btn-secondary-ink-on-secondary": sec_on_secondary.ink,
  } as React.CSSProperties;
}
