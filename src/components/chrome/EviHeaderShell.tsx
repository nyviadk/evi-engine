import { cn } from "@/src/lib/utils/cn";

export type EviHeaderShellProps = Omit<
  React.ComponentProps<"header">,
  "children"
> & {
  /** Theme class (design-token). @default "light" */
  theme?: string;
  /**
   * Container-bredde hvor nav'en folder fra hamburger → inline række (fx
   * "48rem"). CSS tillader IKKE variabler i query-betingelser
   * (`@container (min-width: var(--x))` er ugyldigt), så vi injicerer den
   * konkrete værdi server-side i én container-query. @default "48rem"
   */
  navBreakpoint?: string;
  children: React.ReactNode;
};

/**
 * Top-level `<header>` shell for header slice variants. Provides:
 *  - semantic `<header>` element
 *  - theme class (design tokens for brand colors + typography)
 *  - `@container/nav` context for container-query breakpoints in children
 *  - subtle border-b divider between chrome and page content
 *
 * All header slices (HeaderClassic, HeaderCentered, HeaderSplit, ...) start
 * from EviHeaderShell → EviHeaderInner → content. Slice files should never
 * render `<header>` directly with its own class list.
 */
export function EviHeaderShell({
  theme = "light",
  navBreakpoint = "48rem",
  className,
  children,
  ...props
}: EviHeaderShellProps): React.ReactElement {
  // Kundens breakpoint baked ind i én container-query. Unlayered → vinder over
  // base-reglerne (@layer components) når containeren er bred nok. Under
  // breakpointet matcher den ikke → base'en (desktop skjult, mobil vist) gælder.
  const breakpointCss = `@container nav (min-width:${navBreakpoint}){.evi-nav-desktop{display:flex}.evi-nav-mobile{display:none}}`;

  return (
    <>
      <style>{breakpointCss}</style>
      <header
        data-slot="evi-header-shell"
        data-theme={theme}
        className={cn(
          `theme-${theme}`,
          "evi-nav @container/nav relative border-b border-current/10",
          className,
        )}
        {...props}
      >
        {children}
      </header>
    </>
  );
}
