"use client";

import {
  createContext,
  use,
  useId,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { cn } from "@/src/lib/utils/cn";

/**
 * EviDisclosure — kompositions-primitiv for open/closed UI.
 *
 * Bruges som fundament for:
 *  - mobile hamburger ↔ panel (EviNavigationDisclosure)
 *  - desktop flyout/dropdown menus (kommende)
 *  - accordion-rows, expandable cards, etc.
 *
 * Mønstret følger vercel-composition-patterns: state lift'es ind i en
 * Provider, Trigger/Panel læser interface'et via context. Subkomponenter
 * uden for Panel kan bruge `EviDisclosureContext` direkte til fx en
 * close-knap eller backdrop placeret andre steder i layoutet.
 *
 * Setup pattern:
 * ```tsx
 * <EviDisclosure.Provider>
 *   <EviDisclosure.Trigger>Menu</EviDisclosure.Trigger>
 *   <EviDisclosure.Panel>Indhold</EviDisclosure.Panel>
 * </EviDisclosure.Provider>
 * ```
 */

// ── Context interface ──

type DisclosureState = { open: boolean };
type DisclosureActions = {
  toggle: () => void;
  open: () => void;
  close: () => void;
};
type DisclosureMeta = { panelId: string };

export type EviDisclosureContextValue = {
  state: DisclosureState;
  actions: DisclosureActions;
  meta: DisclosureMeta;
};

export const EviDisclosureContext =
  createContext<EviDisclosureContextValue | null>(null);

function useEviDisclosure(): EviDisclosureContextValue {
  const ctx = use(EviDisclosureContext);
  if (!ctx) {
    throw new Error(
      "EviDisclosure.Trigger og .Panel skal være indeni <EviDisclosure.Provider>.",
    );
  }
  return ctx;
}

// ── Provider ──

export type EviDisclosureProviderProps = {
  children: ReactNode;
  /** Start-state for ukontrolleret brug. @default false */
  defaultOpen?: boolean;
  /** Eksplicit panel-id (ellers auto-genereret via useId). */
  panelId?: string;
};

function Provider({
  children,
  defaultOpen = false,
  panelId: panelIdProp,
}: EviDisclosureProviderProps): React.ReactElement {
  const [isOpen, setOpen] = useState(defaultOpen);
  const generatedId = useId();
  const panelId = panelIdProp ?? `evi-disclosure-${generatedId}`;

  const value: EviDisclosureContextValue = {
    state: { open: isOpen },
    actions: {
      toggle: () => setOpen((o) => !o),
      open: () => setOpen(true),
      close: () => setOpen(false),
    },
    meta: { panelId },
  };

  return (
    <EviDisclosureContext value={value}>{children}</EviDisclosureContext>
  );
}

// ── Trigger ──

export type EviDisclosureTriggerProps = React.ComponentProps<"button">;

function Trigger({
  className,
  onClick,
  ...props
}: EviDisclosureTriggerProps): React.ReactElement {
  const { state, actions, meta } = useEviDisclosure();
  const stateStr = state.open ? "open" : "closed";

  function handleClick(e: MouseEvent<HTMLButtonElement>): void {
    actions.toggle();
    onClick?.(e);
  }

  return (
    <button
      type="button"
      aria-expanded={state.open}
      aria-controls={meta.panelId}
      data-slot="evi-disclosure-trigger"
      data-state={stateStr}
      onClick={handleClick}
      className={className}
      {...props}
    />
  );
}

// ── Panel ──

export type EviDisclosurePanelProps = React.ComponentProps<"div">;

function Panel({
  className,
  ...props
}: EviDisclosurePanelProps): React.ReactElement {
  const { state, meta } = useEviDisclosure();
  const stateStr = state.open ? "open" : "closed";

  return (
    <div
      id={meta.panelId}
      data-slot="evi-disclosure-panel"
      data-state={stateStr}
      className={cn(className)}
      {...props}
    />
  );
}

// ── Compound export ──

export const EviDisclosure = {
  Provider,
  Trigger,
  Panel,
};
