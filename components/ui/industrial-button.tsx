"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

// =============================================================================
// IndustrialButton - Primary action button with bunker aesthetic
// =============================================================================

type ButtonVariant = "primary" | "danger" | "ghost" | "terminal";

type IndustrialButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Full width of container */
  fullWidth?: boolean;
  /** Compact padding for tight layouts */
  compact?: boolean;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: [
    "bg-bunker-700 text-text-primary",
    "border-bunker-500",
    "hover:bg-bunker-500 active:bg-bunker-400",
    "shadow-[2px_2px_0px_#0A0A0A]",
  ].join(" "),
  danger: [
    "bg-alert-deep text-text-primary",
    "border-alert",
    "hover:bg-alert active:bg-alert",
    "shadow-[2px_2px_0px_#0A0A0A]",
  ].join(" "),
  ghost: [
    "bg-transparent text-text-dim",
    "border-bunker-700",
    "hover:text-text-primary hover:border-bunker-500",
  ].join(" "),
  terminal: [
    "bg-bunker-950 text-terminal",
    "border-terminal",
    "hover:bg-military active:bg-military",
    "shadow-[2px_2px_0px_#0A0A0A]",
  ].join(" "),
};

export default function IndustrialButton({
  variant = "primary",
  fullWidth = false,
  compact = false,
  className,
  disabled,
  children,
  ...props
}: IndustrialButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "font-condensed text-lg uppercase tracking-wider",
        "border-2 rounded-[1px]",
        "transition-colors duration-[100ms] ease-linear",
        "cursor-pointer select-none",
        // Sizing
        compact ? "px-3 py-1.5" : "px-6 py-3",
        fullWidth && "w-full",
        // Variant
        VARIANT_STYLES[variant],
        // Disabled state
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
