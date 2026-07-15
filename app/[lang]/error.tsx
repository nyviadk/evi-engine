"use client";

import { useEffect, useState } from "react";

import { EviButton } from "@/src/components/ui/EviButton";
import { system_copy } from "@/src/lib/i18n/system-pages";

/**
 * Error boundary for tenant-sider. Ligger i [lang]-segmentet → renderer inde i
 * [lang]/layout (header + footer bevares; kun sidens indhold erstattes). Client
 * component (Next-krav for error boundaries), så vi kan ikke få params/locale
 * server-side — vi læser i stedet <html lang> (sat af RootLayout til tenantens
 * sprog) efter mount. Teksten er engine-UI, ikke Prismic (Prismic kan være det
 * der fejler) → rå tekst i .evi-prose, samme dokumenterede undtagelse som før.
 */
export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.ReactElement {
  // Start på et default; opdatér til det faktiske sprog efter mount for at
  // undgå hydration-mismatch (server kender ikke locale i en client boundary).
  const [locale, setLocale] = useState("da-dk");
  useEffect(() => {
    // Læs tenantens sprog fra <html lang> (sat server-side) én gang efter mount
    // — bevidst setState-i-effect: vi synker med DOM (ekstern kilde), ikke
    // React-state, og starter på default for at undgå hydration-mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocale(document.documentElement.lang || "da-dk");
  }, []);
  const t = system_copy(locale);

  return (
    <section className="theme-light py-16 md:py-24">
      <div className="mx-auto max-w-evi px-4">
        <div className="evi-prose mx-auto max-w-md text-center">
          <h1>{t.errorTitle}</h1>
          <p>{t.errorBody}</p>
        </div>
        <div className="mt-8 flex justify-center">
          <EviButton
            onClick={reset}
            variant="primary"
            appearance="solid"
            size="lg"
          >
            {t.retry}
          </EviButton>
        </div>
      </div>
    </section>
  );
}
