import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Hero — core-kategori-slice (R4.1). TYND DISPATCHER: hver variation lazy-
 * importeres via `await import()`, så kun den brugte variations kode loades
 * (mindre server-bundle pr. render — samme mekanik som EviIcons dynamiske
 * import, virker på Cloudflare Workers). `switch` narrower samtidig
 * slice-typen til den konkrete variation. Layouts i src/components/hero/parts/.
 */
export default async function Hero({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.HeroSlice,
  EviPageSliceContext
>): Promise<React.ReactElement | null> {
  switch (slice.variation) {
    case "centered": {
      const { HeroCenteredLayout } = await import(
        "@/src/components/hero/parts/HeroCenteredLayout"
      );
      return (
        <HeroCenteredLayout slice={slice} index={index} context={context} />
      );
    }
    case "split": {
      const { HeroSplitLayout } = await import(
        "@/src/components/hero/parts/HeroSplitLayout"
      );
      return <HeroSplitLayout slice={slice} index={index} context={context} />;
    }
    case "about": {
      const { HeroAboutLayout } = await import(
        "@/src/components/hero/parts/HeroAboutLayout"
      );
      return <HeroAboutLayout slice={slice} index={index} context={context} />;
    }
    default:
      return null;
  }
}
