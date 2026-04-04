"use client";

import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { formatTime } from "@/lib/utils";
import { REAL_CODES_COUNT } from "@/lib/constants";
import {
  ScreenShell,
  ScanLines,
  TypeWriter,
} from "@/components/ui";

// =============================================================================
// VictoryScreen - Celebration + personal birthday message
// Shown after all 9 codes are confirmed.
// =============================================================================

type VictoryScreenProps = {
  codesConfirmed: number;
  elapsedSeconds: number;
};

export default function VictoryScreen({
  codesConfirmed,
  elapsedSeconds,
}: VictoryScreenProps) {
  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* Victory title with military stars */}
        <h1
          className={cn(
            "font-condensed text-3xl sm:text-4xl text-terminal uppercase tracking-wider",
            "whitespace-nowrap",
            "border-b-2 border-terminal pb-2 mb-6",
            "text-center",
          )}
        >
          {UI.victoryTitle}
        </h1>

        {/* Stats */}
        <div className="border-2 border-terminal p-4 mb-6 space-y-2">
          <div className="flex justify-between font-mono text-sm">
            <span className="text-text-dead uppercase">
              {UI.victoryStatus}
            </span>
          </div>

          <div className="flex justify-between font-mono text-sm">
            <span className="text-text-dead uppercase">{UI.victoryCodes}</span>
            <span className="font-stencil text-xl text-terminal">
              {codesConfirmed}/{REAL_CODES_COUNT}
            </span>
          </div>

          <div className="flex justify-between font-mono text-sm">
            <span className="text-text-dead uppercase">{UI.victoryTime}</span>
            <span className="font-stencil text-xl text-text-primary">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Personal birthday message */}
        <div className="border-l-2 border-warning pl-3 mb-6">
          <TypeWriter
            lines={[UI.victoryMessage]}
            charDelay={40}
            lineDelay={300}
            className="text-warning text-sm"
          />
        </div>

        {/* Sender signature */}
        <div className="text-right">
          <p className="font-condensed text-2xl text-text-primary">
            {UI.victoryHappyBirthday}
          </p>
          <p className="font-condensed text-lg text-text-dim mt-1">
            — {UI.victorySender}
          </p>
        </div>
      </div>
    </ScreenShell>
  );
}
