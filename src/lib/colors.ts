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

function compute_btn_on_section(
  btn_color: string,
  btn_text: string,
  section_bg: string,
  section_text: string,
): { bg: string; text: string } {
  const ratio = contrast_ratio(
    luminance(...hex_to_rgb(btn_color)),
    luminance(...hex_to_rgb(section_bg)),
  );
  // Threshold for graphical objects
  // Boundaries
  // This success criterion does not require that controls have a visual boundary indicating the hit area,
  // but if the visual indicator of the control is the only way to identify the control,
  // then that indicator must have sufficient contrast. If text (or an icon)
  // within a button or placeholder text inside a text input is visible and there is no visual
  // indication of the hit area then the success criterion is passed. If a button with text also has a colored border,
  // since the border does not provide the only indication there is no contrast requirement beyond the text contrast (1.4.3 Contrast (Minimum)).
  // Note that for people with cognitive disabilities it is recommended to delineate the boundary of controls
  // to aid in the recognition of controls and therefore the completion of activities.
  // https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
  if (ratio >= 1.5) return { bg: btn_color, text: btn_text };
  // Fallback: section's own contrast pair (guaranteed readable)
  return { bg: section_text, text: section_bg };
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
  } as React.CSSProperties;
}
