import {
  isFilled,
  type ImageField,
  type KeyTextField,
  type LinkField,
  type LinkResolverFunction,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviBrandText } from "@/src/components/typography/EviBrandText";

export type LogoItem = {
  logo: ImageField;
  name: KeyTextField;
  link: LinkField;
};

export type LogoListProps = {
  items: LogoItem[];
  linkResolver: LinkResolverFunction;
  /** Følger overskriftens justering. @default "center" */
  justify?: "start" | "center";
  /** Top-slices loader logoerne eagerly (ctx.eagerImages). */
  eager?: boolean;
};

// Fast visningshøjde (R9.1). Sendes også til PrismicNextImage, så srcset
// beregnes ud fra den — logo-feltet har ingen constraint, og en stor upload
// ville ellers blive hentet i fuld bredde.
const LOGO_HEIGHT_PX = 32;

const MUTED =
  "grayscale opacity-70 transition-[filter,opacity] group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100";

/** Rækker uden både logo og navn droppes (tomme group-rækker fra Prismic). */
export function filled_logos(
  items: LogoItem[] | null | undefined,
): LogoItem[] {
  return (items ?? []).filter(
    (item) => isFilled.image(item.logo) || isFilled.keyText(item.name),
  );
}

// Sidste udvej for linkets tilgængelige navn, når hverken firmanavn eller
// alt-tekst er udfyldt.
function link_host(link: LinkField): string | undefined {
  if (link.link_type !== "Web" || !("url" in link) || !link.url) {
    return undefined;
  }
  try {
    return new URL(link.url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function Logo({
  item,
  linkResolver,
  eager,
}: {
  item: LogoItem;
  linkResolver: LinkResolverFunction;
  eager: boolean;
}): React.ReactElement {
  const label = isFilled.keyText(item.name)
    ? item.name
    : item.logo.alt || null;

  const visual = isFilled.image(item.logo) ? (
    <PrismicNextImage
      field={{ ...item.logo, alt: label }}
      height={LOGO_HEIGHT_PX}
      fallbackAlt=""
      loading={eager ? "eager" : undefined}
      className="h-8 w-auto max-w-40 object-contain"
    />
  ) : (
    // Brand-stilen er site-navnets størrelse; som logo-fallback skal den matche
    // logoernes visuelle vægt.
    <EviBrandText text={item.name ?? ""} translate="no" className="text-base" />
  );

  // Ikke is_link_filled: logo-linket har ingen tekst (intet allowText).
  if (!isFilled.link(item.link)) {
    return <span className={MUTED}>{visual}</span>;
  }

  return (
    <PrismicNextLink
      field={item.link}
      linkResolver={linkResolver}
      aria-label={label ? undefined : link_host(item.link)}
      className="group inline-flex items-center rounded-evi text-current no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className={MUTED}>{visual}</span>
    </PrismicNextLink>
  );
}

/**
 * Række af logoer (`<ul>`) i fast højde og gråtoner, der får farve ved hover/
 * fokus på linkede logoer. Uden billede vises firmanavnet som ordmærke, og
 * navnet bruges som alt-tekst. Domain-part (Tailwind tilladt, R3.3).
 */
export function LogoList({
  items,
  linkResolver,
  justify = "center",
  eager = false,
}: LogoListProps): React.ReactElement {
  return (
    <EviStack
      as="ul"
      direction="row"
      wrap
      align="center"
      justify={justify}
      gap="xl"
      // Tættere lodret afstand, så ombrudte logo-rækker ikke ser spredte ud.
      className="gap-y-4"
      data-slot="logo-list"
    >
      {items.map((item, i) => (
        <li key={i}>
          <Logo item={item} linkResolver={linkResolver} eager={eager} />
        </li>
      ))}
    </EviStack>
  );
}
