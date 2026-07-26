import { getIconData, iconToSVG } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/types";

import { cn } from "@/src/lib/utils/cn";
import { sanitize_svg_body } from "@/src/lib/utils/security";

// Dynamic imports — pack parses først når den bruges (cold-start speedup).
const PACK_LOADERS: Record<string, () => Promise<IconifyJSON>> = {
  lucide: () => import("@iconify-json/lucide").then((m) => m.icons),
  ph: () => import("@iconify-json/ph").then((m) => m.icons),
  bi: () => import("@iconify-json/bi").then((m) => m.icons),
  heroicons: () => import("@iconify-json/heroicons").then((m) => m.icons),
  "radix-icons": () =>
    import("@iconify-json/radix-icons").then((m) => m.icons),
  iconoir: () => import("@iconify-json/iconoir").then((m) => m.icons),
};

const DEFAULT_PREFIX = "lucide";

export type EviIconProps = {
  /** Iconify-navn. Enten med prefix ("ph:home") eller uden ("home" → lucide). */
  name: string;
  /** Tailwind-klasse. Størrelse via fx `size-6` / `size-8`. */
  className?: string;
  /** aria-label, hvis ikonet er meningsbærende (ikke bare dekorativt). */
  "aria-label"?: string;
};

export async function EviIcon({
  name,
  className,
  "aria-label": aria_label,
}: EviIconProps): Promise<React.ReactElement | null> {
  if (!name) return null;

  const normalized = name.trim();
  const has_prefix = normalized.includes(":");
  const [prefix, icon_name] = has_prefix
    ? (normalized.split(":") as [string, string])
    : [DEFAULT_PREFIX, normalized];

  const loader = PACK_LOADERS[prefix];
  if (!loader) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[EviIcon] Prefix "${prefix}" er ikke bundlet. Tilladte: ${Object.keys(PACK_LOADERS).join(", ")}`,
      );
    }
    return null;
  }

  const pack = await loader();
  const icon_data = getIconData(pack, icon_name);
  if (!icon_data) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[EviIcon] Ikon "${prefix}:${icon_name}" findes ikke i pack`,
      );
    }
    return null;
  }

  const rendered = iconToSVG(icon_data, { height: "1em" });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={rendered.attributes.viewBox}
      className={cn("size-6 shrink-0", className)}
      aria-label={aria_label}
      aria-hidden={aria_label ? undefined : true}
      role={aria_label ? "img" : undefined}
      dangerouslySetInnerHTML={{ __html: sanitize_svg_body(rendered.body) }}
    />
  );
}
