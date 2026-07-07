import { cn } from "@/src/lib/utils/cn";

export type EviHeaderShellProps = Omit<
  React.ComponentProps<"header">,
  "children"
> & {
  /** Theme class (design-token). @default "light" */
  theme?: string;
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
  className,
  children,
  ...props
}: EviHeaderShellProps): React.ReactElement {
  return (
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
  );
}
