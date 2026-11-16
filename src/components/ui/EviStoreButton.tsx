import type { LinkField, LinkResolverFunction } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviButton } from "@/src/components/ui/EviButton";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { is_link_filled } from "@/src/lib/prismic/links";

// App-butikkerne genkendes på linkets domæne. Phosphor-ikonerne er rene stier;
// bi:apple bruger <use href>, som EviIcons SVG-sanering fjerner (blev tomt).
const STORES = [
  { host: "apps.apple.com", name: "App Store", icon: "ph:apple-logo-fill" },
  {
    host: "play.google.com",
    name: "Google Play",
    icon: "ph:google-play-logo-fill",
  },
];

function find_store(link: LinkField): (typeof STORES)[number] | null {
  if (link.link_type !== "Web" || !("url" in link) || !link.url) return null;
  try {
    const host = new URL(link.url).hostname;
    return (
      STORES.find((store) => host === store.host || host.endsWith(`.${store.host}`)) ??
      null
    );
  } catch {
    return null;
  }
}

export type EviStoreButtonProps = {
  /** Link med tekst, fx "Hent i App Store". */
  field: LinkField;
  linkResolver: LinkResolverFunction;
  /** solid = primær knap, outline = neutral kant. @default "solid" */
  appearance?: "solid" | "outline";
};

/**
 * Knap til App Store eller Google Play: butikkens logo og linkteksten på to
 * linjer ("Hent i" over "App Store"), når teksten ender på butikkens navn.
 * Andre links bliver en almindelig knap.
 */
export function EviStoreButton({
  field,
  linkResolver,
  appearance = "solid",
}: EviStoreButtonProps): React.ReactElement | null {
  if (!is_link_filled(field)) return null;

  const variant = appearance === "solid" ? "primary" : "neutral";
  const store = find_store(field);
  const text = field.text ?? "";

  if (!store) {
    return (
      <EviButton asChild variant={variant} appearance={appearance} size="lg">
        <PrismicNextLink field={field} linkResolver={linkResolver} />
      </EviButton>
    );
  }

  const ends_with_name = text.toLowerCase().endsWith(store.name.toLowerCase());
  const lead = ends_with_name ? text.slice(0, -store.name.length).trim() : "";

  return (
    <EviButton
      asChild
      variant={variant}
      appearance={appearance}
      size="sm"
      className="min-h-11 py-1.5"
    >
      <PrismicNextLink field={field} linkResolver={linkResolver} aria-label={text}>
        <EviIcon name={store.icon} className="size-6" />
        <span className="flex flex-col text-left leading-tight">
          {lead && <span className="text-[11px] font-semibold">{lead}</span>}
          <span className="text-base font-bold">
            {ends_with_name ? store.name : text}
          </span>
        </span>
      </PrismicNextLink>
    </EviButton>
  );
}
