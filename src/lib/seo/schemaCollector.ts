import type {
  Graph,
  BreadcrumbList,
  ListItem,
  Thing,
  OrganizationLeaf,
  LocalBusinessLeaf,
  PersonLeaf,
  CorporationLeaf,
  WebSiteLeaf,
  FAQPage,
} from "schema-dts";
import { isFilled } from "@prismicio/client";
import type {
  BusinessDocumentData,
  BusinessDocumentDataSocialProfilesItem,
} from "@/prismicio-types";

// ── Input til collectSchemaGraph ──

interface SchemaInput {
  business: BusinessDocumentData | null;
  baseUrl: string;
  /** Nuværende sides canonical URL — binder FAQPage-noden til den rigtige (under)side. */
  pageUrl: string;
  /** Breadcrumb-sti med RIGTIGE titler + opløste URLs (rod→blad, ekskl. home). */
  breadcrumbs: readonly { name: string; url: string }[];
  siteName?: string | null;
  /** Udtrukne FAQ Q&A fra sidens faq-slices (question=ren tekst, answer=HTML). */
  faqItems?: readonly { question: string; answer: string }[];
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
    if (isFilled.keyText(p.profile_url) && p.profile_url) {
      urls.push(p.profile_url);
    }
  }
  return urls;
}

function buildBreadcrumbs(
  baseUrl: string,
  crumbs: readonly { name: string; url: string }[],
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

  for (const crumb of crumbs) {
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: crumb.name,
      item: crumb.url,
    });
  }

  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

// Fælles felter der deles på tværs af alle 4 schema-typer
function sharedFields(data: BusinessDocumentData, baseUrl: string) {
  return {
    "@id": `${baseUrl}/#organization`,
    url: baseUrl,
    ...(isFilled.keyText(data.legal_name) && { name: data.legal_name }),
    ...(isFilled.keyText(data.alternate_name) && {
      alternateName: data.alternate_name,
    }),
    ...(isFilled.keyText(data.description) && {
      description: data.description,
    }),
    ...(isFilled.keyText(data.vat_id) && { vatID: data.vat_id }),
    ...(isFilled.keyText(data.contact_email) && {
      email: data.contact_email,
    }),
    ...(isFilled.keyText(data.global_telephone) && {
      telephone: data.global_telephone,
    }),
    ...(isFilled.image(data.brand_logo) && {
      logo: { "@type": "ImageObject" as const, url: data.brand_logo.url },
      image: data.brand_logo.url,
    }),
    ...(data.social_profiles.length > 0 && {
      sameAs: buildSameAs(data.social_profiles),
    }),
  };
}

function buildOrganizationSchema(
  data: BusinessDocumentData,
  baseUrl: string,
): OrganizationLeaf | LocalBusinessLeaf | PersonLeaf | CorporationLeaf {
  const shared = sharedFields(data, baseUrl);
  const type = data.schema_type || "Organization";

  switch (type) {
    case "LocalBusiness":
      return { "@type": "LocalBusiness", ...shared };
    case "Person":
      return { "@type": "Person", ...shared };
    case "Corporation":
      return { "@type": "Corporation", ...shared };
    default:
      return { "@type": "Organization", ...shared };
  }
}

// WebSite node — fodrer Googles brand knowledge panels.
// Ingen SearchAction (der er ingen on-site søgning i motoren).
function buildWebSiteSchema(
  baseUrl: string,
  business: BusinessDocumentData | null,
  siteName?: string | null,
): WebSiteLeaf {
  const name =
    (business && isFilled.keyText(business.legal_name)
      ? business.legal_name
      : null) ||
    siteName ||
    baseUrl;
  const alternateName =
    business && isFilled.keyText(business.alternate_name)
      ? business.alternate_name
      : null;
  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name,
    ...(alternateName && { alternateName }),
    ...(business && {
      publisher: { "@id": `${baseUrl}/#organization` },
    }),
  };
}

// FAQPage — side-indholds-drevet (ikke business). Er en WebPage-subtype, så den
// bærer sidens egen `url`/`@id` (ellers ville den i grafen hænge tvetydigt på
// baseUrl/forsiden) og `isPartOf` binder den til WebSite-noden. Googles FAQ-rich-
// result udgik maj 2026 → dette er primært for Bing/AI-svarmaskiner + ren graf.
function buildFaqPageSchema(
  faqItems: readonly { question: string; answer: string }[],
  pageUrl: string,
  baseUrl: string,
): FAQPage {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faqpage`,
    url: pageUrl,
    isPartOf: { "@id": `${baseUrl}/#website` },
    mainEntity: faqItems.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };
}

// ── Main collector ──

export function collectSchemaGraph(input: SchemaInput): Graph | null {
  const { business, baseUrl, pageUrl, breadcrumbs, siteName, faqItems } = input;

  const mode = business?.schema_mode || MODE_AUTO;
  const graph: Thing[] = [];

  // 1. Organization/LocalBusiness (kun i Auto-mode)
  if (mode === MODE_AUTO && business) {
    graph.push(buildOrganizationSchema(business, baseUrl));
  }

  // 2. WebSite (Auto-mode) — altid hvis vi overhovedet emitter graf
  if (mode === MODE_AUTO) {
    graph.push(buildWebSiteSchema(baseUrl, business, siteName));
  }

  // 3. BreadcrumbList (Auto + Kun brødkrummer)
  if (mode === MODE_AUTO || mode === MODE_BREADCRUMBS) {
    graph.push(buildBreadcrumbs(baseUrl, breadcrumbs, siteName));
  }

  // 4. Custom JSON-LD (altid, uanset mode — hvis feltet har indhold)
  const custom_schema_json = business?.custom_schema_json;
  if (isFilled.keyText(custom_schema_json)) {
    try {
      const parsed: unknown = JSON.parse(custom_schema_json);
      // Custom JSON er power-user input — vi stoler på strukturen
      if (Array.isArray(parsed)) {
        for (const item of parsed) graph.push(item as Thing);
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

  // 5. FAQPage — opt-out via business.faq_schema="Nej" (default Ja, også når der
  //    ikke er nogen business-doc). Uafhængig af schema_mode; kun hvis siden har
  //    mindst ét udfyldt spørgsmål/svar.
  if (business?.faq_schema !== "Nej" && faqItems && faqItems.length > 0) {
    graph.push(buildFaqPageSchema(faqItems, pageUrl, baseUrl));
  }

  if (graph.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
