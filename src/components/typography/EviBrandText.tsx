import { cn } from "@/src/lib/utils/cn";

export type EviBrandTextProps = {
  /** The brand text to render (typically settings.site_name). */
  text: string;
  /** When "no", disables browser translators for the brand string. */
  translate?: "no";
  className?: string;
};

/**
 * Brand text (site name / tenant mark) via the `.evi-brand` class in globals.css.
 * Dedicated component so brand-mark styling lives in ONE place.
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
