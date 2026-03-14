"use client";

import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { formatTime } from "@/lib/utils";
import { REAL_CODES_COUNT } from "@/lib/constants";
import {
  IndustrialButton,
  ScreenShell,
  ScanLines,
} from "@/components/ui";

// =============================================================================
// ResumeScreen - Shown when a player revisits with an active session
// =============================================================================

type ResumeScreenProps = {
  codesConfirmed: number;
  cardsRemaining: number;
  challengesCompleted: number;
  onResume: () => void;
  onRestart: () => void;
};

export default function ResumeScreen({
  codesConfirmed,
  cardsRemaining,
  challengesCompleted,
  onResume,
  onRestart,
}: ResumeScreenProps) {
  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* Title */}
        <h1
          className={cn(
            "font-condensed text-3xl text-warning uppercase tracking-wider",
            "border-b-2 border-bunker-700 pb-2 mb-6",
          )}
        >
          {UI.resumeTitle}
        </h1>

        {/* Transmission-style status */}
        <div className="font-mono text-sm space-y-2 mb-8">
          <p className="text-text-dim">{UI.resumeDetected}</p>
          <p className="text-text-dim">{UI.resumeStatus}</p>

          <div className="border border-bunker-700 p-3 space-y-2 mt-3">
            <div className="flex justify-between">
              <span className="text-text-dead uppercase text-xs">
                {UI.resumeCodesConfirmed}
              </span>
              <span
                className={cn(
                  "font-stencil text-lg",
                  codesConfirmed > 0 ? "text-terminal" : "text-text-primary",
                )}
              >
                {codesConfirmed}/{REAL_CODES_COUNT}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-dead uppercase text-xs">
                {UI.resumeCardsRemaining}
              </span>
              <span className="font-stencil text-lg text-warning">
                {cardsRemaining}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-dead uppercase text-xs">
                {UI.resumeChallengesCompleted}
              </span>
              <span className="font-stencil text-lg text-text-primary">
                {challengesCompleted}/4
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <IndustrialButton variant="terminal" fullWidth onClick={onResume}>
            {UI.resumeButton}
          </IndustrialButton>

          <IndustrialButton variant="ghost" fullWidth onClick={onRestart}>
            {UI.resumeRestart}
          </IndustrialButton>
        </div>
      </div>
    </ScreenShell>
  );
}
