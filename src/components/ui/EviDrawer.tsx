"use client";

import {
  createContext,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils/cn";

/**
 * EviDrawer — modal slide-in-panel bygget på det native <dialog>.
 *
 * Native <dialog> + showModal() giver GRATIS: focus-trap, Escape-luk, inert
 * baggrund, top-layer (ingen z-index-krige) og ::backdrop. Vi tilføjer kun
 * open-state + slide-animation (CSS i globals, section H). Scroll-lock er ren
 * CSS: `html:has(dialog.evi-drawer[open]) { overflow: hidden }`.
 *
 * Følger vercel-composition-patterns som [[EviDisclosure]]: state i Provider,
 * subkomponenter læser interface'et via context (React 19 `use()`), ingen
 * forwardRef. Panelet ejer sin egen dialog-ref (ref rejser ALDRIG gennem
 * context — det bryder React 19's refs-under-render-regel).
 *
 * ```tsx
 * <EviDrawer.Provider>
 *   <EviDrawer.Trigger>Menu</EviDrawer.Trigger>
 *   <EviDrawer.Panel aria-label="Menu">
 *     <EviDrawer.Close>Luk</EviDrawer.Close>
 *     …indhold…
 *   </EviDrawer.Panel>
 * </EviDrawer.Provider>
 * ```
 */

type DrawerState = { open: boolean };
type DrawerActions = { open: () => void; close: () => void };
type DrawerMeta = { panelId: string };

type EviDrawerContextValue = {
  state: DrawerState;
  actions: DrawerActions;
  meta: DrawerMeta;
};

const EviDrawerContext = createContext<EviDrawerContextValue | null>(
  null,
);

function useEviDrawer(): EviDrawerContextValue {
  const ctx = use(EviDrawerContext);
  if (!ctx) {
    throw new Error(
      "EviDrawer.Trigger/.Panel/.Close skal være indeni <EviDrawer.Provider>.",
    );
  }
  return ctx;
}

// ── Provider ──

type EviDrawerProviderProps = {
  children: ReactNode;
  panelId?: string;
};

function Provider({
  children,
  panelId: panelIdProp,
}: EviDrawerProviderProps): React.ReactElement {
  const [isOpen, setOpen] = useState(false);
  const generatedId = useId();
  const panelId = panelIdProp ?? `evi-drawer-${generatedId}`;

  // Luk ved rute-skift: et nav-link soft-navigerer uden at kalde close() →
  // draweren ville ellers hænge åben. Render-tids-nulstilling (Reacts mønster for
  // "juster state når en værdi ændrer sig") frem for en effect.
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const value: EviDrawerContextValue = {
    state: { open: isOpen },
    actions: { open: () => setOpen(true), close: () => setOpen(false) },
    meta: { panelId },
  };

  return <EviDrawerContext value={value}>{children}</EviDrawerContext>;
}

// ── Trigger ──

function Trigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">): React.ReactElement {
  const { state, actions, meta } = useEviDrawer();

  function handleClick(e: MouseEvent<HTMLButtonElement>): void {
    actions.open();
    onClick?.(e);
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={state.open}
      aria-controls={meta.panelId}
      data-slot="evi-drawer-trigger"
      data-state={state.open ? "open" : "closed"}
      onClick={handleClick}
      className={className}
      {...props}
    />
  );
}

// ── Panel (det native <dialog>, ejer sin egen ref) ──

function Panel({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"dialog">): React.ReactElement {
  const { state, actions, meta } = useEviDrawer();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Separat visuel state driver slide-transitionen via [data-state], uafhængigt af
  // native [open] → animér IND på næste frame og UD FØR close(), uden
  // @starting-style/allow-discrete (som CSS-optimizeren kan droppe).
  const [visualOpen, setVisualOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (state.open) {
      // showModal() (ikke show()) → modal: focus-trap + inert baggrund.
      if (!dialog.open) dialog.showModal();
      // Næste frame (efter display→block): flip til [data-state=open] → slider ind.
      const raf = requestAnimationFrame(() => setVisualOpen(true));
      return () => cancelAnimationFrame(raf);
    }
    // Luk: animér ud (næste frame), luk så dialogen når transitionen er færdig.
    const raf = requestAnimationFrame(() => setVisualOpen(false));
    const timer = dialog.open
      ? setTimeout(() => {
          if (dialog.open) dialog.close();
        }, 300)
      : undefined;
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [state.open]);

  // Backdrop-klik: ::backdrop-klik rammer selve <dialog> (target === dialog);
  // klik på indholdet rammer .evi-drawer-inner (et barn) → lukker ikke.
  function handleClick(e: MouseEvent<HTMLDialogElement>): void {
    if (e.target === e.currentTarget) actions.close();
    onClick?.(e);
  }

  return (
    // Backdrop-klik lukker draweren; tastatur-lukning er nativ (<dialog> Escape
    // → cancel-event), så onClick behøver ingen separat key-handler.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      id={meta.panelId}
      data-slot="evi-drawer-panel"
      data-state={visualOpen ? "open" : "closed"}
      // Escape (cancel) + programmatisk close() → synk state tilbage til lukket.
      onCancel={() => actions.close()}
      onClose={() => actions.close()}
      onClick={handleClick}
      className={cn("evi-drawer", className)}
      {...props}
    >
      <div className="evi-drawer-inner">{children}</div>
    </dialog>
  );
}

// ── Close ──

function Close({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">): React.ReactElement {
  const { actions } = useEviDrawer();

  function handleClick(e: MouseEvent<HTMLButtonElement>): void {
    actions.close();
    onClick?.(e);
  }

  return (
    <button
      type="button"
      data-slot="evi-drawer-close"
      onClick={handleClick}
      className={className}
      {...props}
    />
  );
}

export const EviDrawer = { Provider, Trigger, Panel, Close };
