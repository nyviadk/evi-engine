import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import { BrandLink, brand_text } from "@/src/components/header/parts/BrandLink";
import { EviBrandText } from "@/src/components/typography/EviBrandText";
import {
  PlanioLogo,
  type PlanioLogoPart,
} from "@/src/components/planio/PlanioLogo";
import { PlanioMorphDriver } from "@/src/components/planio/PlanioMorphDriver";

type MorphStyle = React.CSSProperties & { [property: `--${string}`]: string };

/** Et trins fremdrift i vinduet [start, start + length] af --morph, blødt i begge ender. */
function stage(start: number, length: number): MorphStyle {
  return {
    "--r": `clamp(0, (var(--morph) - ${start}) / ${length}, 1)`,
    "--t": "calc(var(--r) * var(--r) * (3 - 2 * var(--r)))",
  };
}

// Brat skift, så ikonet og logoets krop aldrig ses samtidig.
const HANDOFF = "clamp(0, (var(--morph) - .549) * 1000, 1)";

// Trinene og målene er prototypens (PlanioLive/design/forside.html). Navnet
// glider ind i ikonet (.05–.3), før ordmærket kommer ud af logoet (.35–.6), så
// to tekster aldrig står oven i hinanden. Ikonet strækker sig til plannerens
// krop (.1–.55) og beholder stjernehimlen, til navnet er væk (.35–.55).
const TEXT: MorphStyle = {
  ...stage(0.05, 0.25),
  opacity: "calc(1 - var(--t))",
  transform: "translateX(calc(-.75rem * var(--t)))",
};
const ICON: MorphStyle = {
  ...stage(0.1, 0.45),
  opacity: `calc(1 - ${HANDOFF})`,
  transform:
    "translate(calc(.74125rem * var(--t)), calc(.13375rem * var(--t))) scale(calc(1 - .4037 * var(--t)), calc(1 - .1262 * var(--t)))",
};
const SKY: React.CSSProperties = {
  opacity: "calc(1 - clamp(0, (var(--morph) - .35) / .2, 1))",
};
const FLAT: React.CSSProperties = {
  opacity: "clamp(0, (var(--morph) - .35) / .2, 1)",
};
const LOGO: Partial<Record<PlanioLogoPart, MorphStyle>> = {
  body: { opacity: HANDOFF },
  screen: {
    ...stage(0.5, 0.2),
    opacity: "var(--t)",
    transform: "scale(calc(.4 + .6 * var(--t)))",
  },
  word: {
    ...stage(0.35, 0.25),
    opacity: "var(--t)",
    transform: "translateX(calc(-12px * (1 - var(--t))))",
  },
  line: {
    "--r": "clamp(0, (var(--morph) - .6) / .25, 1)",
    strokeDasharray: 1,
    strokeDashoffset: "calc(1 - var(--r))",
  },
  shape: { ...stage(0.8, 0.2), transform: "scale(var(--t))" },
};

// Appikonets hjørner; runde, ikke squircle, så de møder plannerens krop i logoet.
const ICON_CORNERS = "rounded-[22.4%] [corner-shape:round]";

export type PlanioBrandMorphProps = {
  /** App-ikonet, som logoet vokser ud af. */
  icon: ImageField;
  siteName: string | null | undefined;
  hostname: string;
  homeHref: string;
  allowTranslation: boolean;
};

/**
 * My Planios brand i headeren: app-ikonet og navnet, der bliver til det fulde
 * logo, mens man scroller (PlanioMorphDriver sætter --morph på headeren).
 */
export function PlanioBrandMorph({
  icon,
  siteName,
  hostname,
  homeHref,
  allowTranslation,
}: PlanioBrandMorphProps): React.ReactElement {
  return (
    <BrandLink
      siteName={siteName}
      hostname={hostname}
      homeHref={homeHref}
      allowTranslation={allowTranslation}
      className="relative h-11"
    >
      <span
        aria-hidden
        className="absolute top-1.25 left-0 size-8.5 origin-top-left"
        style={ICON}
      >
        {isFilled.image(icon) && (
          <PrismicNextImage
            field={icon}
            alt=""
            width={34}
            height={34}
            loading="eager"
            className={`size-full ${ICON_CORNERS}`}
            style={SKY}
          />
        )}
        <span
          className={`absolute inset-0 bg-evi-primary ${ICON_CORNERS}`}
          style={FLAT}
        />
      </span>
      <span aria-hidden className="ml-11 whitespace-nowrap" style={TEXT}>
        <EviBrandText
          text={brand_text(siteName, hostname)}
          translate={allowTranslation ? undefined : "no"}
        />
      </span>
      <PlanioLogo
        aria-hidden
        partStyle={LOGO}
        className="pointer-events-none absolute top-0 left-0 h-11"
      />
      <PlanioMorphDriver />
    </BrandLink>
  );
}
