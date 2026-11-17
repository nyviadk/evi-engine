import type { Content } from "@prismicio/client";

import { HeaderClassicLayout } from "@/src/components/header/parts/HeaderClassicLayout";
import type { EviHeaderSliceContext } from "@/src/components/header/types";
import { PlanioBrandMorph } from "@/src/components/planio/PlanioBrandMorph";

export type PlanioHeaderLayoutProps = {
  slice: Content.PlanioHeaderSliceDefault;
  context: EviHeaderSliceContext;
};

/**
 * planio_header "default": Evis classic header, mørk og sticky, hvor logoet
 * vokser ud af app-ikonet, mens man scroller forbi sidens første sektion.
 * Sticky, ellers scroller forvandlingen væk med headeren. Kanten toner ind med
 * --morph, så headeren flyder sammen med en mørk hero øverst.
 */
export function PlanioHeaderLayout({
  slice,
  context,
}: PlanioHeaderLayoutProps): React.ReactElement {
  const { settings } = context;

  return (
    <HeaderClassicLayout
      brand={
        <PlanioBrandMorph
          icon={slice.primary.icon}
          siteName={settings?.data?.site_name}
          hostname={context.hostname}
          homeHref={context.homeHref}
          allowTranslation={settings?.data?.translate_brand === true}
        />
      }
      primary={slice.primary}
      context={context}
      theme="dark"
      className="sticky top-0 z-20 border-[color:color-mix(in_oklab,currentColor_calc(var(--morph)*10%),transparent)] [--morph:0]"
    />
  );
}
