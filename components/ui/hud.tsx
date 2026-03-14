"use client";

import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { REAL_CODES_COUNT } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

// =============================================================================
// HUD - Heads-Up Display bar fixed at the top of the game screen
// Shows: codes confirmed / total, cards remaining, elapsed time
// =============================================================================

type HUDProps = {
  codesConfirmed: number;
  cardsRemaining: number;
  elapsedSeconds: number;
  className?: string;
};

export default function HUD({
  codesConfirmed,
  cardsRemaining,
  elapsedSeconds,
  className,
}: HUDProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex items-center justify-between",
        "h-10 px-3",
        "bg-bunker-950 border-b-2 border-bunker-700",
        "font-mono text-xs uppercase tracking-wider",
        className,
      )}
    >
      {/* Codes confirmed */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-dead">{UI.hudCodes}</span>
        <span
          className={cn(
            "font-stencil text-base tabular-nums",
            codesConfirmed > 0 ? "text-terminal" : "text-text-primary",
          )}
        >
          {codesConfirmed}/{REAL_CODES_COUNT}
        </span>
      </div>

      {/* Cards remaining */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-dead">{UI.hudRemaining}</span>
        <span className="font-stencil text-base tabular-nums text-warning">
          {cardsRemaining}
        </span>
      </div>

      {/* Elapsed time */}
      <div className="font-stencil text-base tabular-nums text-text-dim">
        {formatTime(elapsedSeconds)}
      </div>
    </header>
  );
}
