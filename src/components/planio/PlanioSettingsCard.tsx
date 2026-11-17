import { EviAutoGrid, type EviAutoGridProps } from "@/src/components/layout/EviAutoGrid";
import { EviStack } from "@/src/components/layout/EviStack";
import { evi_box_class } from "@/src/components/ui/EviBox";
import { cn } from "@/src/lib/utils/cn";

/**
 * Appens indstillinger som lyst kort: EviAutoGrid duo (to kolonner, når der er
 * plads). Rækkerne deles af streger, så række-afstanden er 0 (som Bentos gap).
 */
function Root({
  className,
  ...props
}: Omit<EviAutoGridProps, "as" | "size">): React.ReactElement {
  return (
    <EviAutoGrid
      as="ul"
      size="duo"
      data-slot="planio-settings-card"
      className={cn("theme-light gap-y-0 md:gap-y-0", evi_box_class("compact"), className)}
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
    <EviStack
      as="li"
      direction="row"
      wrap
      align="center"
      justify="between"
      gap="sm"
      // Ved to kolonner (EviAutoGrid duo's breakpoint) står række 2 også øverst.
      className="min-h-13 border-t border-current/10 py-2 text-sm font-bold first:border-t-0 @[532px]/grid:nth-2:border-t-0"
    >
      <span className="min-w-0 text-pretty">{label}</span>
      {toggle ? (
        <span className="relative ml-auto h-5 w-9 shrink-0 rounded-full bg-evi-primary after:absolute after:top-0.5 after:right-0.5 after:size-4 after:rounded-full after:bg-evi-light" />
      ) : (
        value && (
          <EviStack
            as="span"
            direction="row"
            align="center"
            gap="sm"
            className="ml-auto min-w-0 text-right font-medium"
          >
            {swatch && (
              <span
                className="size-3.5 shrink-0 rounded-full border-2"
                style={{ borderColor: swatch }}
              />
            )}
            {value}
          </EviStack>
        )
      )}
    </EviStack>
  );
}

export const PlanioSettingsCard = Object.assign(Root, { Row });
