import { cn } from "@/src/lib/utils/cn";

type MasonryColumns = 1 | 2 | 3 | 4;
type MasonryBasis = "prose" | "cluster";

// column-count = MAKSIMUM når column-width også er sat (CSS multicol): browseren
// fylder så mange spalter der er plads til (basis-bredden), cappet her.
const maxColumnClass: Record<MasonryColumns, string> = {
  1: "[column-count:1]",
  2: "[column-count:2]",
  3: "[column-count:3]",
  4: "[column-count:4]",
};

// Spalte-basis = mindste spalte-bredde (driver hvor mange der er plads til).
// "prose" (19rem) til fuld-bredde avis-spalter; "cluster" (15rem) til billed-
// klynger i en smal split-pane, hvor 19rem ville falde til 1 spalte men 15rem
// giver 2 (og stadig 1 på mobil-bredde).
const basisClass: Record<MasonryBasis, string> = {
  prose: "[column-width:19rem]",
  cluster: "[column-width:15rem]",
};

// Få spalter må ikke strække sig over hele sektionsbredden (2 kolonner i fuld
// bredde = for brede kort). Cap bredden + centrér ved 1-2 spalter; 3-4 fylder ud.
const widthClass: Record<MasonryColumns, string> = {
  1: "mx-auto max-w-lg",
  2: "mx-auto max-w-3xl",
  3: "",
  4: "",
};

export type EviMasonryProps = React.ComponentProps<"div"> & {
  /** Øvre grænse for spalter. Faktisk antal = min(dette, hvad bredden tillader). @default 3 */
  maxColumns?: MasonryColumns;
  /** Spalte-basis: "prose" (bred, fuld-bredde) el. "cluster" (smal, til split-panes). @default "prose" */
  basis?: MasonryBasis;
};

/**
 * EviMasonry — kolonne-baseret masonry (avis-spalter): børnene hælder ned i hver
 * spalte og stables direkte under hinanden, så varierende højder giver et
 * forskudt look UDEN fælles række-linje. Ren CSS multi-column → nul JS, ingen
 * CLS, og spalte-antallet er bredde-drevet (column-width), ikke hardcodet.
 * Et barn må ikke knække over to spalter → break-inside-avoid.
 */
export function EviMasonry({
  maxColumns = 3,
  basis = "prose",
  className,
  children,
  ...props
}: EviMasonryProps): React.ReactElement {
  return (
    <div
      data-slot="evi-masonry"
      className={cn(
        "col-span-12 gap-x-6 md:gap-x-8",
        basisClass[basis],
        "*:mb-6 md:*:mb-8 *:break-inside-avoid",
        maxColumnClass[maxColumns],
        widthClass[maxColumns],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
