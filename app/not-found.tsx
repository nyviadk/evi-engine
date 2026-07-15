import { headers } from "next/headers";
import Link from "next/link";

import { EviButton } from "@/src/components/ui/EviButton";
import { system_copy } from "@/src/lib/i18n/system-pages";

/**
 * Root 404 — fallback for stier UDEN for [lang]-segmentet (ingen tenant-layout,
 * derfor ingen header/footer her). Tenant-sider rammer app/[lang]/not-found.tsx
 * som HAR header + footer. Oversat via x-evi-locale (sat af middleware).
 */
export default async function NotFound(): Promise<React.ReactElement> {
  const h = await headers();
  const t = system_copy(h.get("x-evi-locale"));

  return (
    <div className="theme-light flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="evi-prose max-w-md">
        <h1>{t.notFoundTitle}</h1>
        <p>{t.notFoundBody}</p>
      </div>
      <EviButton
        asChild
        variant="primary"
        appearance="solid"
        size="lg"
        className="mt-8"
      >
        <Link href="/">{t.home}</Link>
      </EviButton>
    </div>
  );
}
