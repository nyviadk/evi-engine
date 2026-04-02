import { type ComponentPropsWithoutRef, type ElementType } from "react";
import { PrismicNextLink, type PrismicNextLinkProps } from "@prismicio/next";
import type { LinkResolverFunction } from "@prismicio/client";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type Variant = "solid" | "outline" | "ghost";

// Shared visual styles — no layout opinions
const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-evi)] transition-all duration-200 ease-out cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:pointer-events-none disabled:opacity-40";

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
} as const;

const variants: Record<Variant, string> = {
  solid: [
    "bg-[var(--theme-text)] text-[var(--theme-bg)]",
    "hover:brightness-110 hover:scale-[1.02]",
    "active:scale-[0.98] active:brightness-95",
  ].join(" "),
  outline: [
    "bg-transparent text-current",
    "border-2 border-current",
    "hover:bg-[color-mix(in_oklch,currentColor_8%,transparent)] hover:scale-[1.02]",
    "active:scale-[0.98] active:bg-[color-mix(in_oklch,currentColor_12%,transparent)]",
  ].join(" "),
  ghost: [
    "bg-transparent text-current",
    "hover:bg-[color-mix(in_oklch,currentColor_8%,transparent)]",
    "active:bg-[color-mix(in_oklch,currentColor_12%,transparent)]",
  ].join(" "),
};

// ── Link button (renders <a> via PrismicNextLink) ──

type LinkProps = PrismicNextLinkProps & {
  variant?: Variant;
  size?: keyof typeof sizes;
  linkResolver: LinkResolverFunction;
};

export function EviButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: LinkProps) {
  return (
    <PrismicNextLink
      className={twMerge(clsx(base, sizes[size], variants[variant]), className)}
      {...props}
    />
  );
}

// ── Native button (renders <button> or custom element) ──

type ButtonProps<T extends ElementType = "button"> =
  ComponentPropsWithoutRef<T> & {
    as?: T;
    variant?: Variant;
    size?: keyof typeof sizes;
    className?: string;
  };

export function EviButton<T extends ElementType = "button">({
  as,
  variant = "solid",
  size = "md",
  className,
  ...props
}: ButtonProps<T>) {
  const Tag = as || "button";
  return (
    <Tag
      className={twMerge(clsx(base, sizes[size], variants[variant]), className)}
      {...props}
    />
  );
}
