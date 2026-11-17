import { cn } from "@/src/lib/utils/cn";

/**
 * Appens indstillinger som lyst kort; to kolonner, når flisen er bred. Rå grid
 * frem for EviAutoGrid: kolonnerne skal have luft, men rækkerne deles af
 * streger uden mellemrum, og EviAutoGrids gap er ens på begge akser.
 */
function Root({ className, ...props }: React.ComponentProps<"ul">): React.ReactElement {
  return (
    <ul
      data-slot="planio-settings-card"
      className={cn(
        "theme-light grid grid-cols-1 gap-x-12 rounded-evi px-4 py-1 @2xl/frame:grid-cols-2 @2xl/frame:px-6 @2xl/frame:py-2",
        className,
      )}
      {...props}
    />
  );
}

export type PlanioSettingsRowProps = {
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Farve på en lille ring foran værdien, fx den røde cirkel om i dag. */
  swatch?: string | null;
  /** Vis en tændt kontakt i stedet for en værdi. */
  toggle?: boolean;
};

/** En indstilling. Er der ikke plads, lægger værdien sig under navnet. */
function Row({ label, value, swatch, toggle = false }: PlanioSettingsRowProps): React.ReactElement {
  return (
    <li className="flex min-h-13 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-current/12 py-2 text-sm font-bold first:border-t-0 @2xl/frame:nth-2:border-t-0">
      <span className="min-w-0 text-pretty">{label}</span>
      {toggle ? (
        <span className="relative ml-auto h-5 w-9 shrink-0 rounded-full bg-evi-primary after:absolute after:top-0.5 after:right-0.5 after:size-4 after:rounded-full after:bg-evi-light" />
      ) : (
        value && (
          <span className="ml-auto inline-flex min-w-0 items-center gap-2 text-right font-medium">
            {swatch && (
              <span
                className="size-3.5 shrink-0 rounded-full border-2"
                style={{ borderColor: swatch }}
              />
            )}
            {value}
          </span>
        )
      )}
    </li>
  );
}

export const PlanioSettingsCard = Object.assign(Root, { Row });
