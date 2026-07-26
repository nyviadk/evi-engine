import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * Hero — tynd dispatcher (R4.1). Hver variation lazy-importeres via
 * `await import()`, så kun den brugte variations kode indgår i server-bundlen
 * pr. render (virker på Cloudflare Workers). Layouts i src/components/hero/parts/.
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
