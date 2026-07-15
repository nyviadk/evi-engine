import { headers } from "next/headers";
import Link from "next/link";

import { EviButton } from "@/src/components/ui/EviButton";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviStack } from "@/src/components/layout/EviStack";
import { system_copy } from "@/src/lib/i18n/system-pages";

/**
 * 404 for tenant-sider. Ligger i [lang]-segmentet, så den renderer INDE i
 * [lang]/layout → får tenantens header + footer + tema automatisk (i modsætning
 * til root app/not-found.tsx som er uden layout). Sproget kommer fra
 * x-evi-locale (sat af middleware). Teksten er engine-UI (system_copy), ikke
 * Prismic — derfor rå tekst i .evi-prose (samme undtagelse som error-siden).
 */
export default async function NotFound(): Promise<React.ReactElement> {
  const h = await headers();
  const t = system_copy(h.get("x-evi-locale"));

  return (
    <EviSection theme="light" hero data-slot="not-found">
      <EviRow>
        <EviStack gap="lg" align="center" className="text-center">
          <div className="evi-prose">
            <h1>{t.notFoundTitle}</h1>
            <p>{t.notFoundBody}</p>
          </div>
          {/* href="/" — middleware sender til den korrekte, lokaliserede forside. */}
          <EviButton asChild variant="primary" appearance="solid" size="lg">
            <Link href="/">{t.home}</Link>
          </EviButton>
        </EviStack>
      </EviRow>
    </EviSection>
  );
}
