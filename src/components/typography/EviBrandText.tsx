import { cn } from "@/src/lib/utils/cn";

export type EviBrandTextProps = {
  /** The brand text to render (typically settings.site_name). */
  text: string;
  /** When "no", disables browser translators for the brand string. */
  translate?: "no";
  className?: string;
};

/**
 * Renders brand text (site name / tenant mark) with design-system typography
 * tokens via the `.evi-brand` CSS class in globals.css. Dedicated component
 * so brand-mark styling lives in ONE place — change `.evi-brand` and every
 * header/footer/metadata brand instance updates in sync.
 *
 * Uses the same evi-prose token philosophy: `--evi-heading-font` for family,
 * clamp()-based size for fluid scaling. Weights/spacing are tuned for a
 * short brand mark, not body copy.
 *
 * Rule of thumb: never write `<span className="font-heading text-lg ..."/>`
 * for a site name — use EviBrandText.
 */
export function EviBrandText({
  text,
  translate,
  className,
}: EviBrandTextProps): React.ReactElement {
  return (
    <span
      data-slot="evi-brand-text"
      translate={translate}
      className={cn("evi-brand", className)}
    >
      {text}
    </span>
  );
}
