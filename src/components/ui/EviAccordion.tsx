import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";
import { EviAccordionSummary } from "@/src/components/ui/EviAccordionSummary";

/**
 * EviAccordion — liste af native `<details>`-disclosures (tastatur + skærmlæser
 * gratis, samme filosofi som EviDrawer's native `<dialog>`). Åben/luk animeres via
 * `::details-content` i globals.css (progressivt: browsere uden support åbner/lukker
 * øjeblikkeligt — stadig fuldt funktionelt), og den globale `prefers-reduced-motion`-
 * reset slår animationen fra. Toggle er 100% native/ingen JS; kun `<summary>` bærer
 * en lille klient-handler ([[EviAccordionSummary]]) der undgår dobbeltklik-markering.
 *
 * @example
 * <EviAccordion>
 *   <EviAccordionItem summary={<EviRichText field={q} .../>}>
 *     <EviRichText field={a} .../>
 *   </EviAccordionItem>
 * </EviAccordion>
 */
export function EviAccordion({
  className,
  children,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="evi-accordion"
      className={cn("border-t border-current/10", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type EviAccordionItemProps = Omit<
  React.ComponentProps<"details">,
  "title"
> & {
  /** Klikbar overskrift (spørgsmålet). MÅ IKKE indeholde interaktivt indhold (a11y). */
  summary: React.ReactNode;
};

export function EviAccordionItem({
  summary,
  className,
  children,
  ...props
}: EviAccordionItemProps): React.ReactElement {
  return (
    <details
      data-slot="evi-accordion-item"
      className={cn("border-b border-current/10", className)}
      {...props}
    >
      <EviAccordionSummary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">{summary}</div>
        <ChevronDown
          className="evi-accordion-chevron size-5 shrink-0"
          aria-hidden
        />
      </EviAccordionSummary>
      <div className="pb-5">{children}</div>
    </details>
  );
}
