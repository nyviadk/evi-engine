import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PhoneMockupLayout } from "@/src/components/phone-mockup/parts/PhoneMockupLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * PhoneMockup — telefon-mockups som selvstændig sektion. Mockups er et
 * univers for sig selv (adskilt fra "billede + tekst"), så alt samles under
 * denne ene slice; hvert look er en variation = ét `layout` på EviPhoneCarousel.
 * Alle variationer deler samme rendering (kun `layout`-værdien varierer), så
 * dispatcheren delegerer til én part frem for en switch (R4.2-undtagelse).
 */
export default function PhoneMockup({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.PhoneMockupSlice,
  EviPageSliceContext
>): React.ReactElement | null {
  return <PhoneMockupLayout slice={slice} index={index} context={context} />;
}
