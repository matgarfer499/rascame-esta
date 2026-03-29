"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { padNumber } from "@/lib/utils";
import { CODE_FADE_TIMER_SECONDS } from "@/lib/constants";
import {
  IndustrialButton,
  ProgressBar,
  ScreenShell,
  Timer,
} from "@/components/ui";
import ScratchCanvas from "./scratch-canvas";
import CodeReveal from "./code-reveal";

// =============================================================================
// ScratchScreen - Full scratch experience for a single card
// Phases: scratching → code revealed (with fade timer) → confirm/back
// =============================================================================

type ScratchScreenProps = {
  cardId: number;
  /** Called when scratch coverage threshold is reached (triggers server action) */
  onScratchComplete: (cardId: number) => void;
  /** The revealed code (set after server responds) */
  revealedCode: string | null;
  /** Called when player confirms the code worked */
  onConfirm: (cardId: number) => void;
  /** Called when player says the code didn't work */
  onReject: (cardId: number) => void;
  /** Called to go back to the wall */
  onBack: () => void;
};

type Phase = "scratching" | "revealed" | "faded";

export default function ScratchScreen({
  cardId,
  onScratchComplete,
  revealedCode,
  onConfirm,
  onReject,
  onBack,
}: ScratchScreenProps) {
  const [phase, setPhase] = useState<Phase>(
    revealedCode ? "revealed" : "scratching",
  );
  const [coverage, setCoverage] = useState(0);
  const [codeOpacity, setCodeOpacity] = useState(1);
  const hasNotifiedRef = useRef(false);

  /** Coverage threshold reached — notify parent to fetch code */
  const handleThresholdReached = useCallback(() => {
    if (hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;
    onScratchComplete(cardId);
  }, [cardId, onScratchComplete]);

  /** When code arrives from server, transition to revealed phase */
  useEffect(() => {
    if (revealedCode && phase === "scratching") {
      setPhase("revealed");
    }
  }, [revealedCode, phase]);

  /** Fade timer expired */
  const handleFadeComplete = useCallback(() => {
    setCodeOpacity(0);
    setPhase("faded");
  }, []);

  // Canvas dimensions (responsive to viewport)
  const canvasWidth = Math.min(320, typeof window !== "undefined" ? window.innerWidth - 48 : 280);
  const canvasHeight = Math.round(canvasWidth * 0.6);

  return (
    <ScreenShell withHUD centered>
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        {/* Card ID header */}
        <h2
          className={cn(
            "font-condensed text-3xl text-text-primary uppercase tracking-wider",
            "self-start",
          )}
        >
          {UI.scratchTitle} Nº{padNumber(cardId)}
        </h2>

        {/* Scratch area */}
        {phase === "scratching" && (
          <>
            <div className="relative">
              {/* Code canvas underneath (hidden until scratched) */}
              {revealedCode && (
                <div className="absolute inset-0">
                  <CodeReveal
                    code={revealedCode}
                    width={canvasWidth}
                    height={canvasHeight}
                  />
                </div>
              )}

              {/* Scratch overlay on top */}
              <ScratchCanvas
                width={canvasWidth}
                height={canvasHeight}
                onThresholdReached={handleThresholdReached}
                onCoverageUpdate={setCoverage}
              />
            </div>

            {/* Progress indicator */}
            <div className="w-full">
              <div className="flex justify-between text-[10px] font-mono text-text-dead uppercase mb-1">
                <span>{UI.scratchProgress}</span>
                <span>{Math.round(coverage * 100)}%</span>
              </div>
              <ProgressBar
                value={coverage}
                variant={coverage >= 0.85 ? "terminal" : "warning"}
              />
            </div>

            <p className="text-text-dead text-[10px] font-mono text-center">
              {UI.scratchInstruction}
            </p>
          </>
        )}

        {/* Revealed code with fade timer */}
        {phase === "revealed" && revealedCode && (
          <>
            <div className="text-center">
              <p className="font-condensed text-lg text-terminal uppercase mb-2">
                {UI.codeRevealed}
              </p>

              <CodeReveal
                code={revealedCode}
                width={canvasWidth}
                height={Math.round(canvasHeight * 0.7)}
                opacity={codeOpacity}
              />

              {/* Fade countdown */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-text-dead text-xs font-mono">
                  {UI.codeFadeWarning}
                </span>
                <Timer
                  initialSeconds={CODE_FADE_TIMER_SECONDS}
                  mode="countdown"
                  variant="alert"
                  onComplete={handleFadeComplete}
                />
              </div>
            </div>

            <p className="text-text-dim text-[10px] font-mono text-center px-2">
              {UI.codeInstruction}
            </p>

            {/* Confirm / reject buttons */}
            <div className="flex gap-2 w-full">
              <IndustrialButton
                variant="terminal"
                fullWidth
                onClick={() => onConfirm(cardId)}
              >
                {UI.codeWorked}
              </IndustrialButton>
              <IndustrialButton
                variant="ghost"
                fullWidth
                onClick={() => onReject(cardId)}
              >
                {UI.codeDidNotWork}
              </IndustrialButton>
            </div>
          </>
        )}

        {/* Faded — code gone, must re-scratch or go back */}
        {phase === "faded" && (
          <div className="text-center">
            <p className="font-condensed text-xl text-alert uppercase mb-4">
              {UI.codeRevealed}
            </p>
            <p className="text-text-dead text-xs font-mono mb-6">
              El código se ha desvanecido. Vuelve al muro para rascar de nuevo.
            </p>
          </div>
        )}

        {/* Back button (shown only when not revealed) */}
        {phase !== "revealed" && (
          <IndustrialButton variant="ghost" compact onClick={onBack}>
            {UI.codeBackToWall}
          </IndustrialButton>
        )}
      </div>
    </ScreenShell>
  );
}
