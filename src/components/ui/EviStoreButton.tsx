import type { LinkField, LinkResolverFunction } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviQrCode } from "@/src/components/ui/EviQrCode";
import { has_link, is_link_filled } from "@/src/lib/prismic/links";

// Butikkernes officielle badges (Apple: toolbox.marketingtools.apple.com,
// Google: play.google.com/intl/…/badges, beskåret til den synlige badge).
// Begge kræver deres egen grafik uændret; App Store skal stå først, og
// Google-badgen må ikke være mindre end de andre.
const STORES = [
  {
    host: "apps.apple.com",
    badge: { da: "/badges/app-store-da.svg", en: "/badges/app-store-en.svg" },
    ratio: { da: 119.66407 / 40, en: 119.66407 / 40 },
    label: { da: "Hent i App Store", en: "Download on the App Store" },
  },
  {
    host: "play.google.com",
    badge: { da: "/badges/google-play-da.png", en: "/badges/google-play-en.png" },
    ratio: { da: 646 / 192, en: 564 / 168 },
    label: { da: "Hent den på Google Play", en: "Get it on Google Play" },
  },
] as const;

// Apples minimum på skærm er 40px; begge vises i samme højde.
const BADGE_HEIGHT = 48;

type Store = (typeof STORES)[number];

function find_store(link: LinkField): Store | null {
  if (link.link_type !== "Web" || !("url" in link) || !link.url) return null;
  try {
    const host = new URL(link.url).hostname;
    return STORES.find((s) => host === s.host || host.endsWith(`.${s.host}`)) ?? null;
  } catch {
    return null;
  }
}

function badge_lang(lang?: string): "da" | "en" {
  return !lang || lang.startsWith("da") ? "da" : "en";
}

export type EviStoreButtonProps = {
  field: LinkField;
  linkResolver: LinkResolverFunction;
  /** Sidens locale; vælger dansk eller engelsk badge. @default dansk */
  lang?: string;
  /** Vis en QR-kode til linket under badgen fra md (til at scanne fra computeren). */
  qr?: boolean;
  /** Kun for links, der ikke er en app-butik. @default "solid" */
  appearance?: "solid" | "outline";
};

/**
 * Butikkens officielle badge, når linket går til App Store eller Google Play.
 * Andre links bliver en almindelig knap med linkets tekst.
 */
export function EviStoreButton({
  field,
  linkResolver,
  lang,
  qr = false,
  appearance = "solid",
}: EviStoreButtonProps): React.ReactElement | null {
  if (!is_link_filled(field)) return null;

  const store = find_store(field);
  if (!store) {
    return (
      <EviButton
        asChild
        variant={appearance === "solid" ? "primary" : "neutral"}
        appearance={appearance}
        size="lg"
      >
        <PrismicNextLink field={field} linkResolver={linkResolver} />
      </EviButton>
    );
  }

  const l = badge_lang(lang);
  const width = Math.round(BADGE_HEIGHT * store.ratio[l]);
  const url = "url" in field && field.url ? field.url : null;

  return (
    <EviStack gap="md" align="center">
      <PrismicNextLink field={field} linkResolver={linkResolver} className="rounded-evi">
        {/* eslint-disable-next-line @next/next/no-img-element -- officiel badge-grafik fra public/; next/image ville omkode Googles PNG */}
        <img
          src={store.badge[l]}
          alt={store.label[l]}
          width={width}
          height={BADGE_HEIGHT}
          className="block"
        />
      </PrismicNextLink>
      {qr && url && <EviQrCode value={url} className="hidden size-28 md:block" />}
    </EviStack>
  );
}

export type EviStoreButtonsProps = {
  primary: LinkField;
  secondary: LinkField;
  linkResolver: LinkResolverFunction;
  lang?: string;
  qr?: boolean;
};

/**
 * To butiks-badges side om side (under hinanden, når der ikke er plads), med
 * App Store først uanset feltrækkefølgen. Intet, når begge links er tomme.
 */
export function EviStoreButtons({
  primary,
  secondary,
  linkResolver,
  lang,
  qr,
}: EviStoreButtonsProps): React.ReactElement | null {
  if (!has_link(primary, secondary)) return null;

  const app_store_first = find_store(secondary)?.host === "apps.apple.com";
  const [first, second] = app_store_first ? [secondary, primary] : [primary, secondary];

  // gap="md" (16px) ≥ butikkernes krav om fri luft på ¼ af badgens højde.
  return (
    <EviStack direction="row" wrap justify="center" align="start" gap="md">
      <EviStoreButton field={first} linkResolver={linkResolver} lang={lang} qr={qr} />
      <EviStoreButton
        field={second}
        linkResolver={linkResolver}
        lang={lang}
        qr={qr}
        appearance="outline"
      />
    </EviStack>
  );
}
