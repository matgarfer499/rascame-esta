"use client";

import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { ScreenShell, ScanLines } from "@/components/ui";

// =============================================================================
// AccessDeniedScreen - Shown when the URL secret is invalid
// =============================================================================

export default function AccessDeniedScreen() {
  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="text-center">
        <h1
          className={cn(
            "font-condensed text-5xl text-alert uppercase tracking-wider",
            "mb-4",
            "animate-[pulse-alert_1s_step-end_infinite]",
          )}
        >
          {UI.accessDenied}
        </h1>

        <p className="font-mono text-sm text-text-dim">
          {UI.accessDeniedMessage}
        </p>
      </div>
    </ScreenShell>
  );
}
