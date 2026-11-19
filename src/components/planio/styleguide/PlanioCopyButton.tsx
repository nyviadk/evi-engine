"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { EviButton } from "@/src/components/ui/EviButton";
import { cn } from "@/src/lib/utils/cn";

export type PlanioCopyButtonProps = {
  /** Teksten, der kopieres. */
  value?: string;
  /** Hent teksten herfra ved klik, fx en SVG-fil. */
  fromUrl?: string;
  /** Synlig tekst på knappen. */
  label: string;
  /** Hvad der kopieres, kun for skærmlæsere, så ens knapper kan skelnes. */
  context?: string;
};

type Status = "idle" | "copied" | "failed";

let last_message = "";

async function fetch_text(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kunne ikke hente ${url}`);
  return new Blob([await res.text()], { type: "text/plain" });
}

/**
 * Kopiér-knap med en status-boble ved siden af, som både vises og læses op.
 * Ved en URL gives ClipboardItem et promise, så Safari stadig regner kopieringen
 * for en del af klikket, selvom teksten først skal hentes.
 */
export function PlanioCopyButton({
  value,
  fromUrl,
  label,
  context,
}: PlanioCopyButtonProps): React.ReactElement {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function report(ok: boolean) {
    clearTimeout(timer.current);
    let next = ok ? "Kopieret" : "Kunne ikke kopiere";
    // VoiceOver springer en besked over, der er magen til den forrige.
    if (next === last_message) next += " ";
    last_message = next;
    setStatus(ok ? "copied" : "failed");
    setMessage(next);
    timer.current = setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 2000);
  }

  async function copy() {
    try {
      if (fromUrl) {
        if (typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([
            new ClipboardItem({ "text/plain": fetch_text(fromUrl) }),
          ]);
        } else {
          await navigator.clipboard.writeText(await (await fetch_text(fromUrl)).text());
        }
      } else {
        await navigator.clipboard.writeText(value ?? "");
      }
      report(true);
    } catch {
      report(false);
    }
  }

  const Icon = status === "copied" ? Check : Copy;

  return (
    <span className="relative inline-flex items-center">
      <EviButton
        type="button"
        variant="neutral"
        appearance="outline"
        size="sm"
        onClick={copy}
        data-status={status}
      >
        {/* inline: EviButton lægger teksten i en blok-span, og et blok-ikon får sin egen linje. */}
        <Icon aria-hidden="true" className="me-1.5 inline size-3.5" />
        {label}
        {context && <span className="sr-only"> {context}</span>}
      </EviButton>
      <span
        role="status"
        className={cn(
          // Ligger oven på indholdet nedenunder i de to sekunder, som et tooltip.
          "pointer-events-none absolute top-full left-0 z-10 mt-1 rounded-evi bg-evi-dark px-2 py-0.5 text-xs whitespace-nowrap text-evi-text-on-dark shadow-evi transition-opacity motion-reduce:transition-none",
          message ? "opacity-100" : "opacity-0",
        )}
      >
        {message}
      </span>
    </span>
  );
}
