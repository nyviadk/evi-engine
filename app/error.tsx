"use client";

import type { ReactElement } from "react";
import { EviButton } from "@/src/components/ui/EviButton";

/**
 * Error boundary UI. Documented exception to R2 (Prismic Rich Text everywhere):
 * error pages must render without external dependencies — Prismic could BE
 * what's broken. Text lives in raw JSX with .evi-prose wrapper so it still
 * uses typography tokens. Button uses EviButton so it inherits .btn styling
 * (including cursor-pointer, transitions, focus states).
 */
export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}): ReactElement {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{
        backgroundColor: "var(--color-light)",
        color: "var(--text-on-light)",
      }}
    >
      <div className="evi-prose max-w-md">
        <h1>Noget gik galt</h1>
        <p>Der opstod en uventet fejl. Prøv igen om lidt.</p>
      </div>
      <EviButton
        onClick={reset}
        variant="primary"
        appearance="solid"
        size="lg"
        className="mt-8"
      >
        Prøv igen
      </EviButton>
    </div>
  );
}
