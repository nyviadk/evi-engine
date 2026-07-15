import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@prismicio/next";
import { SliceZone } from "@prismicio/react";

import { components } from "../../slices";
import {
  compute_slice_contexts,
  type SliceWithPrimary,
} from "@/src/lib/prismic/slices";
import { get_evi_context } from "@/src/lib/prismic/context";
import { DEFAULTS_COLORS } from "@/src/lib/theme/colors";

export default async function SliceSimulatorPage({
  searchParams,
}: SliceSimulatorParams) {
  const { state } = await searchParams;
  const slices = getSlices(state);

  // Hent SAMME tenant-context som layout.tsx bruger til at injicere brand-
  // farverne på <html> — så simulatorens tema, collapse-padding og links
  // matcher det der faktisk vises (ikke default-brand). Falder tilbage til
  // defaults hvis hosten ikke resolver en tenant.
  const ctx = await get_evi_context();
  const settings = ctx?.settings;
  const colors = {
    light: settings?.data?.color_light || DEFAULTS_COLORS.color_light,
    dark: settings?.data?.color_dark || DEFAULTS_COLORS.color_dark,
    primary: settings?.data?.color_primary || DEFAULTS_COLORS.color_primary,
    secondary:
      settings?.data?.color_secondary || DEFAULTS_COLORS.color_secondary,
  };
  const sliceContexts = compute_slice_contexts(
    slices as SliceWithPrimary[],
    colors,
  );

  return (
    <SliceSimulator>
      <SliceZone
        slices={slices}
        components={components}
        context={{
          linkResolver: ctx?.link_resolver ?? (() => "/"),
          sliceContexts,
        }}
      />
    </SliceSimulator>
  );
}
