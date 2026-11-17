import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { BrandLink } from "@/src/components/header/parts/BrandLink";
import { HeaderClassicLayout } from "@/src/components/header/parts/HeaderClassicLayout";
import type { EviHeaderSliceContext } from "@/src/components/header/types";

/**
 * Classic header: BrandLink (logo eller sitenavn) i HeaderClassicLayout.
 * Always solid, never sticky — variant-specifikke valg er hardcodet i
 * kompositionen, ikke eksponeret som slice-felter.
 */
export default function HeaderClassic({
  slice,
  context,
}: SliceComponentProps<
  Content.HeaderClassicSlice,
  EviHeaderSliceContext
>): React.ReactElement {
  const { settings } = context;

  return (
    <HeaderClassicLayout
      brand={
        <BrandLink
          logo={slice.primary.logo}
          siteName={settings?.data?.site_name}
          hostname={context.hostname}
          homeHref={context.homeHref}
          allowTranslation={settings?.data?.translate_brand === true}
          imageHeightClass="h-10 md:h-15"
        />
      }
      primary={slice.primary}
      context={context}
    />
  );
}
