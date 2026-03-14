"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// =============================================================================
// ScreenShell - Layout wrapper for all game screens
// Handles consistent padding, HUD offset, and full-height layout.
// =============================================================================

type ScreenShellProps = {
  children: ReactNode;
  /** Whether the HUD is visible (adds top padding) */
  withHUD?: boolean;
  /** Center content vertically */
  centered?: boolean;
  className?: string;
};

export default function ScreenShell({
  children,
  withHUD = false,
  centered = false,
  className,
}: ScreenShellProps) {
  return (
    <main
      className={cn(
        "min-h-dvh w-full px-4 pb-4",
        withHUD ? "pt-14" : "pt-4",
        centered && "flex flex-col items-center justify-center",
        className,
      )}
    >
      {children}
    </main>
  );
}
