"use client";

import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { CHALLENGES, SHAME_TIMER_SECONDS } from "@/lib/constants";
import type { ChallengeId } from "@/lib/types";
import { IndustrialButton, ScreenShell, ScanLines } from "@/components/ui";

// =============================================================================
// ChallengeIntroScreen - Briefing screen shown before starting a challenge
// =============================================================================

type ChallengeIntroScreenProps = {
  challengeId: ChallengeId;
  onAccept: () => void;
  onDecline: () => void;
};

export default function ChallengeIntroScreen({
  challengeId,
  onAccept,
  onDecline,
}: ChallengeIntroScreenProps) {
  const config = CHALLENGES[challengeId];
  // Use the i18n keys from the config to look up translated strings
  const name = UI[config.nameKey as keyof typeof UI] as string;
  const description = UI[config.descriptionKey as keyof typeof UI] as string;

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* Alert header */}
        <div
          className={cn(
            "text-center mb-6",
            "animate-[pulse-alert_1s_step-end_infinite]",
          )}
        >
          <p className="font-condensed text-lg text-warning uppercase tracking-widest">
            {UI.challengeAvailable}
          </p>
        </div>

        {/* Challenge info box */}
        <div className="border-2 border-warning p-4 mb-6">
          <p className="text-text-dead text-xs font-mono uppercase mb-1">
            {UI.challengePrefix} {challengeId} {UI.challengeOf} 4
          </p>
          <h2 className="font-condensed text-3xl text-text-primary uppercase tracking-wider mb-2">
            {name}
          </h2>
          <p className="font-mono text-sm text-text-dim leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stakes info */}
        <div className="border border-bunker-700 p-3 mb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-terminal text-xs">▶</span>
            <p className="font-mono text-xs text-text-dim">
              <span className="text-terminal font-bold">
                {config.fakesToEliminate}
              </span>{" "}
              {UI.challengeEliminate} {UI.challengeFakeCards}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-alert text-xs">▶</span>
            <p className="font-mono text-xs text-text-dim">
              {UI.challengeFailWarning}{" "}
              <span className="text-alert font-bold">
                {SHAME_TIMER_SECONDS}
              </span>{" "}
              {UI.challengeFailSeconds}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <IndustrialButton variant="terminal" fullWidth onClick={onAccept}>
            {UI.challengeAccept}
          </IndustrialButton>

          <IndustrialButton variant="ghost" fullWidth onClick={onDecline}>
            {UI.challengeBackCoward}
          </IndustrialButton>
        </div>
      </div>
    </ScreenShell>
  );
}
