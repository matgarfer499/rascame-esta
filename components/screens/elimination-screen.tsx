"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { ELIMINATION_STAGGER_MS } from "@/lib/constants";
import { delay } from "@/lib/utils";
import { ScreenShell, ScanLines } from "@/components/ui";
import { useSound } from "@/hooks";

// =============================================================================
// EliminationScreen - Animated display of fake cards being eliminated
// Shown after a challenge is completed.
// =============================================================================

type EliminationScreenProps = {
  eliminatedIds: number[];
  onComplete: () => void;
};

export default function EliminationScreen({
  eliminatedIds,
  onComplete,
}: EliminationScreenProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const { play } = useSound();

  // Keep callback ref fresh without re-triggering the animation effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Play elimination sound on mount — separate from the animation loop so it
  // fires immediately and isn't affected by eliminatedIds reference changes.
  useEffect(() => {
    play("elimination");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate cards being crossed out, show continue button at midpoint
  useEffect(() => {
    let cancelled = false;

    async function animateElimination() {
      // Show the continue button halfway through the animation so players
      // don't have to wait for every card to be crossed out before continuing.
      const midpoint = Math.ceil(eliminatedIds.length / 2);

      for (let i = 0; i < eliminatedIds.length; i++) {
        if (cancelled) break;
        await delay(ELIMINATION_STAGGER_MS);
        setRevealedCount(i + 1);

        if (i + 1 === midpoint && !cancelled) {
          setShowContinue(true);
        }
      }
    }

    animateElimination();
    return () => {
      cancelled = true;
    };
  }, [eliminatedIds]);

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm text-center">
        <h2
          className={cn(
            "font-condensed text-2xl text-alert uppercase tracking-wider mb-6",
            "animate-[pulse-alert_500ms_step-end_infinite]",
          )}
        >
          {UI.eliminationTitle}
        </h2>

        {/* Counter */}
        <div className="font-stencil text-6xl text-alert tabular-nums mb-4">
          {revealedCount}/{eliminatedIds.length}
        </div>

        {/* Visual representation — small grid of boxes getting crossed out */}
        <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto mb-8">
          {eliminatedIds.map((id, idx) => (
            <div
              key={id}
              className={cn(
                "w-5 h-5 border border-bunker-700 rounded-[1px]",
                "flex items-center justify-center",
                "font-mono text-[8px]",
                idx < revealedCount
                  ? "bg-alert-deep text-text-primary line-through"
                  : "bg-bunker-900 text-text-dead",
              )}
            >
              {String(id).padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Continue button — appears at animation midpoint */}
        {showContinue && (
          <button
            onClick={() => onCompleteRef.current()}
            className={cn(
              "w-full border border-military-green text-military-green",
              "font-condensed text-xl uppercase tracking-widest",
              "py-3 px-6",
              "hover:bg-military-green hover:text-bunker-950",
              "active:scale-95 transition-colors",
            )}
          >
            {UI.eliminationContinue}
          </button>
        )}
      </div>
    </ScreenShell>
  );
}
