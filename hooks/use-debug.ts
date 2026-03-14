"use client";

// =============================================================================
// useDebug - Debug mode utilities for desktop testing
// Enabled when NEXT_PUBLIC_DEBUG=true
// =============================================================================

import { useCallback, useMemo } from "react";

const IS_DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";

export function useDebug() {
  const isDebug = useMemo(() => IS_DEBUG, []);

  /** Log to console only in debug mode */
  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (!isDebug) return;
      console.log("[DEBUG]", ...args);
    },
    [isDebug],
  );

  /** Show a debug alert */
  const debugAlert = useCallback(
    (message: string) => {
      if (!isDebug) return;
      console.warn("[DEBUG ALERT]", message);
    },
    [isDebug],
  );

  return {
    isDebug,
    debugLog,
    debugAlert,
  };
}
