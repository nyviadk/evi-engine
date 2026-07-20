import { isFilled, type Content, type LinkResolverFunction } from "@prismicio/client";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSplit } from "@/src/components/layout/EviSplit";
import { evi_box_class } from "@/src/components/ui/EviBox";
import { EviCard } from "@/src/components/ui/EviCard";
import { EviIcon } from "@/src/components/ui/EviIcon";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviSectionHeader } from "@/src/components/typography/EviSectionHeader";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";
import { has_rich_text } from "@/src/lib/prismic/fields";
import {
  evi_card_title_class,
  evi_card_body_class,
} from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";

export type FeaturesIconBentoLayoutProps = {
  slice: Content.FeaturesSliceIconBento;
  index: number;
  context: EviPageSliceContext;
};

// Uniform gap på ALLE celle-mellemrum (kolonner + de to rækker) → ét
// sammenhængende gitter frem for to splits med hver sin rytme. Overrider både
// EviRow-grid'ets arvede gap og EviSplit's eget gap-y.
const BENTO_GAP = "gap-4 md:gap-6";

const BOX_TITLE = cn("evi-prose mt-4", evi_card_title_class("lg"));
const BOX_BODY = cn("evi-prose mt-2", evi_card_body_class());

// Faste farve-roller pr. position (som bento-variationen): de STORE kasser (1 og
// 4) holdes rolige som neutral tint, de SMÅ (2 og 3) er farve-pops diagonalt
// placeret — primær solid øverst-højre, sekundær blød nederst-venstre. Roller er
// faste; de faktiske farver kommer fra tenantens brand via theme-klasserne.
// Opake theme-klasser sætter selv tekstfarven → currentColor-ikonet forbliver
// læsbart.
const BOX_TONES = [
  "theme-surface-neutral",
  "theme-primary",
  "theme-secondary-soft",
  "theme-surface-neutral",
] as const;

type BoxFields = {
  icon: string | null;
  title: Content.FeaturesSliceIconBentoPrimary["box_1_title"];
  body: Content.FeaturesSliceIconBentoPrimary["box_1_body"];
};

function box_has_content(box: BoxFields): boolean {
  return isFilled.keyText(box.icon) || has_rich_text(box.title, box.body);
}

// EviCard (3 rækker: ikon / titel / tekst) frem for EviBox: ligger i en
// række-alignet EviSplit, så de tre rækker deler spor på tværs af parret — titel
// og tekst flugter selv når den brede kasses titel wrapper til to linjer. Faste
// 3 slots → tomme wrappes i <div /> (subgrid-optælling, jf. bento).
//
// Ikonet er currentColor → arver kassens tekstfarve (theme-klassen sætter den),
// så det er læsbart uanset kasse-tone og sektions-tema.
function IconBox({
  box,
  tone,
  linkResolver,
}: {
  box: BoxFields;
  tone: string;
  linkResolver: LinkResolverFunction;
}): React.ReactElement | null {
  if (!box_has_content(box)) return null;

  return (
    <EviCard rows={3} className={cn(tone, evi_box_class())}>
      {isFilled.keyText(box.icon) ? (
        <EviIcon name={box.icon} className="size-8" />
      ) : (
        <div />
      )}
      {isFilled.richText(box.title) ? (
        <EviRichText field={box.title} linkResolver={linkResolver} className={BOX_TITLE} />
      ) : (
        <div />
      )}
      {isFilled.richText(box.body) ? (
        <EviRichText field={box.body} linkResolver={linkResolver} className={BOX_BODY} />
      ) : (
        <div />
      )}
    </EviCard>
  );
}

/**
 * Features-variation "icon-bento": centreret overskrift + brødtekst, derefter et
 * asymmetrisk bento-gitter i to rækker — 67/33 øverst, 40/60 nederst. Hver kasse
 * er ikon (uden baggrund) + titel + tekst stablet lodret.
 *
 * Rækkerne bor i en EviRow med sit EGET 12-kol-grid, så de to EviSplits kan
 * subgride på den OG dele bento-gap'et lodret (sektionens gap-y er større og
 * ville brække gitteret op i to bånd). EviSplit `rows={3}` række-aligner kortene
 * i hvert par (ikon/titel/tekst flugter på tværs af de to forskellige bredder).
 * Domain-part (Tailwind tilladt, R3.3).
 */
export function FeaturesIconBentoLayout({
  slice,
  index,
  context,
}: FeaturesIconBentoLayoutProps): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );
  const p = slice.primary;

  const [box1, box2, box3, box4]: [BoxFields, BoxFields, BoxFields, BoxFields] = [
    { icon: p.box_1_icon, title: p.box_1_title, body: p.box_1_body },
    { icon: p.box_2_icon, title: p.box_2_title, body: p.box_2_body },
    { icon: p.box_3_icon, title: p.box_3_title, body: p.box_3_body },
    { icon: p.box_4_icon, title: p.box_4_title, body: p.box_4_body },
  ];

  const topRowHas = box_has_content(box1) || box_has_content(box2);
  const bottomRowHas = box_has_content(box3) || box_has_content(box4);

  if (!has_rich_text(p.heading, p.body) && !topRowHas && !bottomRowHas) {
    return null;
  }

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="features-icon-bento"
    >
      <EviSectionHeader
        title={p.heading}
        description={p.body}
        linkResolver={linkResolver}
        isHero={isHero}
      />
      {(topRowHas || bottomRowHas) && (
        <EviRow className={cn("grid grid-cols-12", BENTO_GAP)}>
          {topRowHas && (
            <EviSplit preset="67-33" rows={3} className={BENTO_GAP}>
              <IconBox
                box={box1}
                tone={BOX_TONES[0]}
                linkResolver={linkResolver}
              />
              <IconBox
                box={box2}
                tone={BOX_TONES[1]}
                linkResolver={linkResolver}
              />
            </EviSplit>
          )}
          {bottomRowHas && (
            <EviSplit preset="40-60" rows={3} className={BENTO_GAP}>
              <IconBox
                box={box3}
                tone={BOX_TONES[2]}
                linkResolver={linkResolver}
              />
              <IconBox
                box={box4}
                tone={BOX_TONES[3]}
                linkResolver={linkResolver}
              />
            </EviSplit>
          )}
        </EviRow>
      )}
    </EviSection>
  );
}
