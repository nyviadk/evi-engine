import type { Graph, BreadcrumbList, ListItem, Thing } from "schema-dts";
import { isFilled } from "@prismicio/client";
import type {
  BusinessDocumentData,
  BusinessDocumentDataSocialProfilesItem,
} from "@/prismicio-types";

// ── Input til collectSchemaGraph ──

interface SchemaInput {
  business: BusinessDocumentData | null;
  baseUrl: string;
  pagePath: string;
  pageTitle: string;
  lang: string;
  siteName?: string | null;
}

// ── Schema mode constants (matcher Prismic select-værdier) ──

const MODE_AUTO = "Auto (Virksomhed + Brødkrummer)";
const MODE_BREADCRUMBS = "Kun brødkrummer";

// ── Helpers ──

function buildSameAs(
  profiles: readonly BusinessDocumentDataSocialProfilesItem[],
): string[] {
  const urls: string[] = [];
  for (const p of profiles) {
    if (isFilled.link(p.profile_url) && p.profile_url.url) {
      urls.push(p.profile_url.url);
    }
  }
  return urls;
}

function buildBreadcrumbs(
  baseUrl: string,
  pagePath: string,
  lang: string,
  siteName?: string | null,
): BreadcrumbList {
  const items: ListItem[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: siteName || "Forside",
      item: baseUrl,
    },
  ];

  const cleanPath = pagePath.replace(/^\//, "").replace(/\/$/, "");
  if (cleanPath && cleanPath !== lang) {
    const segments = cleanPath.split("/").filter(Boolean);
    const startIdx = segments[0] === lang ? 1 : 0;
    let currentPath = segments[0] === lang ? `/${lang}` : "";

    for (let i = startIdx; i < segments.length; i++) {
      const segment = segments[i];
      if (segment === "home") continue;

      currentPath += `/${segment}`;
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      items.push({
        "@type": "ListItem",
        position: items.length + 1,
        name: label,
        item: `${baseUrl}${currentPath}`,
      });
    }
  }

  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function buildOrganizationSchema(
  data: BusinessDocumentData,
  baseUrl: string,
): Thing {
  const schemaType = data.schema_type || "Organization";
  const sameAs = buildSameAs(data.social_profiles);

  // Schema-dts's union-typer er for brede til dynamisk @type,
  // så vi bygger et rent JSON-LD objekt og caster til Thing.
  const org: Record<string, unknown> = {
    "@type": schemaType,
    "@id": `${baseUrl}/#organization`,
    url: baseUrl,
  };

  if (isFilled.keyText(data.legal_name)) org.name = data.legal_name;
  if (isFilled.keyText(data.alternate_name))
    org.alternateName = data.alternate_name;
  if (isFilled.keyText(data.description)) org.description = data.description;
  if (isFilled.keyText(data.vat_id)) org.vatID = data.vat_id;
  if (isFilled.keyText(data.contact_email)) org.email = data.contact_email;
  if (isFilled.keyText(data.global_telephone))
    org.telephone = data.global_telephone;

  if (isFilled.image(data.brand_logo)) {
    org.logo = {
      "@type": "ImageObject",
      url: data.brand_logo.url,
    };
    org.image = data.brand_logo.url;
  }

  if (sameAs.length > 0) org.sameAs = sameAs;

  return org as unknown as Thing;
}

// ── Main collector ──

export function collectSchemaGraph(input: SchemaInput): Graph | null {
  const { business, baseUrl, pagePath, lang, siteName } = input;

  const mode = business?.schema_mode || MODE_AUTO;
  const graph: Thing[] = [];

  // 1. Organization/LocalBusiness (kun i Auto-mode)
  if (mode === MODE_AUTO && business) {
    graph.push(buildOrganizationSchema(business, baseUrl));
  }

  // 2. BreadcrumbList (Auto + Kun brødkrummer)
  if (mode === MODE_AUTO || mode === MODE_BREADCRUMBS) {
    graph.push(buildBreadcrumbs(baseUrl, pagePath, lang, siteName));
  }

  // 3. Custom JSON-LD (altid, uanset mode — hvis feltet har indhold)
  if (isFilled.keyText(business?.custom_schema_json)) {
    try {
      const parsed = JSON.parse(business!.custom_schema_json!);
      if (Array.isArray(parsed)) {
        graph.push(...(parsed as Thing[]));
      } else {
        graph.push(parsed as Thing);
      }
    } catch (e) {
      console.warn(
        "[schemaCollector] Ugyldig custom_schema_json — ignoreret:",
        e instanceof Error ? e.message : e,
      );
    }
  }

  if (graph.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  } as unknown as Graph;
}
