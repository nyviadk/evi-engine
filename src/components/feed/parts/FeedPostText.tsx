"use client";

import { useId, useState } from "react";

import { EviStack } from "@/src/components/layout/EviStack";
import { EviButton } from "@/src/components/ui/EviButton";
import { cn } from "@/src/lib/utils/cn";

/**
 * Et langt opslag foldet sammen efter ~7 linjer, med en knap der folder det ud
 * i selve kortet. Hele teksten står i HTML'en hele tiden (også for skærmlæsere);
 * sammenfoldningen er kun visuel. Uden knaptekst vises teksten fuldt.
 */
export function FeedPostText({
  more,
  less,
  children,
}: {
  more: string | null;
  less: string | null;
  children: React.ReactNode;
}): React.ReactNode {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!more) return children;

  return (
    <EviStack gap="xs" align="start">
      <div id={id} className={cn(!open && "max-h-[7lh] overflow-hidden mask-b-from-50%")}>
        {children}
      </div>
      <EviButton
        variant="primary"
        appearance="text"
        size="sm"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (less ?? more) : more}
      </EviButton>
    </EviStack>
  );
}
