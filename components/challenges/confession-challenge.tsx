"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  CONFESSION_VOLUME_THRESHOLD,
  CONFESSION_DURATION_SECONDS,
} from "@/lib/constants";
import { CONFESSION_DARES } from "@/lib/content";
import {
  IndustrialButton,
  ScreenShell,
  ScanLines,
  ProgressBar,
} from "@/components/ui";
import useMicrophone from "@/hooks/use-microphone";

// =============================================================================
// ConfessionChallenge - Microphone-based dare challenge
// Players must perform an embarrassing dare out loud. The microphone
// measures volume. They must sustain above the threshold for N seconds.
// =============================================================================

type ConfessionChallengeProps = {
  onComplete: () => void;
  onFail: () => void;
};

export default function ConfessionChallenge({
  onComplete,
  onFail,
}: ConfessionChallengeProps) {
  const [dareIndex, setDareIndex] = useState(0);
  const [phase, setPhase] = useState<"ready" | "listening" | "success" | "failed">("ready");
  const [loudSeconds, setLoudSeconds] = useState(0);

  const { volume, isListening, hasError, start, stop } = useMicrophone();

  // Keep a ref in sync with the latest volume so the setInterval callback
  // can read it without stale closure issues.
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const loudTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dareTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentDare = CONFESSION_DARES[dareIndex] ?? CONFESSION_DARES[0];

  /** Transition to listening phase once the hook confirms the mic is active */
  useEffect(() => {
    if (isListening) setPhase("listening");
  }, [isListening]);

  /** Graceful degradation: auto-complete 3s after a mic error */
  useEffect(() => {
    if (!hasError) return;
    const id = setTimeout(() => {
      setPhase("success");
      onComplete();
    }, 3000);
    return () => clearTimeout(id);
  }, [hasError, onComplete]);

  /** Track consecutive loud seconds while listening */
  useEffect(() => {
    if (phase !== "listening") return;

    let consecutiveLoud = 0;

    loudTimerRef.current = setInterval(() => {
      if (volumeRef.current >= CONFESSION_VOLUME_THRESHOLD) {
        consecutiveLoud++;
        setLoudSeconds(consecutiveLoud);

        if (consecutiveLoud >= CONFESSION_DURATION_SECONDS) {
          setPhase("success");
          stop();
          onComplete();
        }
      } else {
        // Decay gradually rather than hard-reset to feel forgiving
        consecutiveLoud = Math.max(0, consecutiveLoud - 1);
        setLoudSeconds(consecutiveLoud);
      }
    }, 1000);

    return () => {
      if (loudTimerRef.current) {
        clearInterval(loudTimerRef.current);
        loudTimerRef.current = null;
      }
    };
  }, [phase, stop, onComplete]);

  /** Cycle through dares while listening — loops infinitely via modulo */
  useEffect(() => {
    if (phase !== "listening") return;
    dareTimerRef.current = setInterval(() => {
      setDareIndex((i) => (i + 1) % CONFESSION_DARES.length);
    }, 6000);
    return () => {
      if (dareTimerRef.current) {
        clearInterval(dareTimerRef.current);
        dareTimerRef.current = null;
      }
    };
  }, [phase]);

  /** Give up / fail */
  const handleGiveUp = useCallback(() => {
    stop();
    setPhase("failed");
    onFail();
  }, [stop, onFail]);

  // Taunting message based on volume
  const tauntMessage =
    volume < 0.03
      ? UI.confessionLouder
      : volume < CONFESSION_VOLUME_THRESHOLD
        ? UI.confessionIsAllYouGot
        : UI.confessionGrandmaLouder;

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        <h2 className="font-condensed text-2xl text-warning uppercase tracking-wider mb-4">
          {UI.confessionTitle}
        </h2>

        {/* Dare text */}
        <div className="border-2 border-alert p-4 mb-6">
          <p className="font-mono text-[10px] text-text-dead uppercase tracking-widest mb-2">
            REPETID ESTO A GRITOS:
          </p>
          <p className="font-mono text-sm text-text-primary leading-relaxed">
            &quot;{currentDare}&quot;
          </p>
        </div>

        {phase === "ready" && (
          <>
            {hasError ? (
              <p className="text-alert text-xs font-mono mb-4">
                Error de micrófono. Completando automáticamente...
              </p>
            ) : (
              <IndustrialButton
                variant="danger"
                fullWidth
                onClick={start}
              >
                EMPEZAR
              </IndustrialButton>
            )}
          </>
        )}

        {phase === "listening" && (
          <>
            {/* Volume meter — scale display so the bar fills meaningfully */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-dead">{UI.confessionVolumeLabel}</span>
                <span
                  className={cn(
                    volume >= CONFESSION_VOLUME_THRESHOLD
                      ? "text-terminal"
                      : "text-alert",
                  )}
                >
                  {Math.round(Math.min(volume / 0.25, 1) * 100)}%
                </span>
              </div>
              <ProgressBar
                value={volume / 0.25}
                variant={
                  volume >= CONFESSION_VOLUME_THRESHOLD ? "terminal" : "alert"
                }
                height="h-6"
              />
            </div>

            {/* Loud seconds progress */}
            <div className="mb-4">
              <ProgressBar
                value={loudSeconds / CONFESSION_DURATION_SECONDS}
                variant="terminal"
                showLabel
                height="h-4"
              />
              <p className="text-text-dead text-[10px] font-mono text-center mt-1">
                {loudSeconds}/{CONFESSION_DURATION_SECONDS}s a volumen alto
              </p>
            </div>

            {/* Taunt */}
            <p
              className={cn(
                "font-mono text-xs text-center mb-4",
                volume >= CONFESSION_VOLUME_THRESHOLD
                  ? "text-terminal"
                  : "text-alert animate-[pulse-alert_500ms_step-end_infinite]",
              )}
            >
              {tauntMessage}
            </p>

            <IndustrialButton variant="ghost" compact fullWidth onClick={handleGiveUp}>
              Me rindo
            </IndustrialButton>
          </>
        )}
      </div>
    </ScreenShell>
  );
}
