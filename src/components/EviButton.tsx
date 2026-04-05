import { type ComponentPropsWithoutRef, type ElementType } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  type LinkResolverFunction,
  type LinkField,
  isFilled,
} from "@prismicio/client";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "secondary" | "neutral";
type Appearance = "solid" | "outline" | "text";
type Size = "sm" | "md" | "lg";

const iconSizes: Record<Size, number> = {
  sm: 14,
  md: 20,
  lg: 24,
};

// ── Link button (renders <a> via PrismicNextLink) ──

type LinkProps = {
  field: LinkField;
  variant?: Variant;
  appearance?: Appearance;
  size?: Size;
  arrow?: boolean;
  isParentLink?: boolean;
  className?: string;
  children?: React.ReactNode;
  linkResolver: LinkResolverFunction;
};

export function EviButtonLink({
  variant = "primary",
  appearance = "solid",
  size = "md",
  arrow = false,
  isParentLink = false,
  className,
  children,
  field,
  linkResolver,
}: LinkProps) {
  if (!isFilled.link(field)) return null;

  return (
    <PrismicNextLink
      field={field}
      linkResolver={linkResolver}
      className={clsx(
        "btn",
        `btn-${size}`,
        `btn-${variant}-${appearance}`,
        arrow && "btn-arrow",
        isParentLink &&
          "before:absolute before:inset-0 before:z-10 before:content-['']",
        className,
      )}
    >
      {children}
      {arrow && (
        <ArrowRight size={iconSizes[size]} className="btn-arrow-icon" />
      )}
    </PrismicNextLink>
  );
}

// ── Native button (renders <button> or custom element) ──

type ButtonProps<T extends ElementType = "button"> =
  ComponentPropsWithoutRef<T> & {
    as?: T;
    variant?: Variant;
    appearance?: Appearance;
    size?: Size;
    arrow?: boolean;
    className?: string;
  };

export function EviButton<T extends ElementType = "button">({
  as,
  variant = "primary",
  appearance = "solid",
  size = "md",
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Tag = as || "button";
  return (
    <Tag
      className={clsx(
        "btn",
        `btn-${size}`,
        `btn-${variant}-${appearance}`,
        arrow && "btn-arrow",
        className,
      )}
      {...props}
    >
      {children}
      {arrow && (
        <ArrowRight size={iconSizes[size]} className="btn-arrow-icon" />
      )}
    </Tag>
  );
}
