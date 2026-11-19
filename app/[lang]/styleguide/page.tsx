import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";

import { get_evi_context } from "@/src/lib/prismic/context";
import {
  is_planio_tenant,
  planio_brand,
  planio_partner_logos,
} from "@/src/components/planio/styleguide/brand";
import { PlanioStyleguide } from "@/src/components/planio/styleguide/PlanioStyleguide";

type Params = Promise<{ lang: string }>;

// Kun My Planio og kun på dansk. Siden er ikke en Prismic-side, så den kommer
// heller ikke i sitemappet.
async function styleguide_context(lang: string) {
  const ctx = await get_evi_context();
  if (!ctx || !is_planio_tenant(ctx.tenant)) return null;
  if (lang !== ctx.tenant.default_locale) return null;
  return ctx;
}

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { lang } = await props.params;
  const ctx = await styleguide_context(lang);
  if (!ctx) return {};
  const brand = planio_brand(ctx);
  return {
    title: `Designguide – ${brand.siteName}`,
    description: `Logoer, app-ikon, farver, typografi og afstande til ${brand.siteName}.`,
    // Må gerne deles med et link, men skal ikke findes i søgemaskiner.
    robots: { index: false, follow: false },
  };
}

export default async function StyleguidePage(props: { params: Params }): Promise<ReactElement> {
  const { lang } = await props.params;
  const ctx = await styleguide_context(lang);
  if (!ctx) return notFound();
  const partners = await planio_partner_logos(ctx);
  return <PlanioStyleguide ctx={ctx} brand={planio_brand(ctx)} partners={partners} />;
}
