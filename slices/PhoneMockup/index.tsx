import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { PhoneMockupLayout } from "@/src/components/phone-mockup/parts/PhoneMockupLayout";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

/**
 * PhoneMockup — mockups samles under én slice; hvert look er en variation =
 * ét `layout` på EviPhoneCarousel. Alle variationer deler samme rendering, så
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
