"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  CONFESSION_VOLUME_THRESHOLD,
  CONFESSION_DURATION_SECONDS,
  CONFESSION_TICK_MS,
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
// Players must shout R-heavy phrases out loud. The microphone measures volume
// synchronously (via getVolume()) on every tick — bypassing the React state
// pipeline to avoid stale reads on mobile.
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

  const TICKS_PER_SECOND = 1000 / CONFESSION_TICK_MS;
  const TARGET_TICKS = CONFESSION_DURATION_SECONDS * TICKS_PER_SECOND;

  const { volume, hasError, start, stop, getVolume } = useMicrophone();

  // Stabilize callbacks with refs so effect deps don't change on every parent render
  const onCompleteRef = useRef(onComplete);
  const onFailRef = useRef(onFail);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onFailRef.current = onFail; }, [onFail]);

  const loudTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dareTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentDare = CONFESSION_DARES[dareIndex] ?? CONFESSION_DARES[0];

  /** Kick off listening — called directly from the button onClick (user gesture).
   *  Phase transition happens here, not in an effect, to avoid cascading renders. */
  const handleStart = useCallback(async () => {
    await start();
    setPhase("listening");
  }, [start]);

  /** Graceful degradation: auto-complete 3s after a mic error */
  useEffect(() => {
    if (!hasError) return;
    const id = setTimeout(() => {
      setPhase("success");
      onCompleteRef.current();
    }, 3000);
    return () => clearTimeout(id);
  }, [hasError]);

  /** Track accumulated loud ticks while listening.
   *
   * getVolume() reads the AnalyserNode synchronously on every tick — no React
   * state pipeline, no stale closure. Progress only ever goes up.
   */
  useEffect(() => {
    if (phase !== "listening") return;

    let loudTicks = 0;

    loudTimerRef.current = setInterval(() => {
      const currentVolume = getVolume();

      if (currentVolume >= CONFESSION_VOLUME_THRESHOLD) {
        loudTicks = Math.min(loudTicks + 1, TARGET_TICKS);
        setLoudSeconds(loudTicks / TICKS_PER_SECOND);
      }

      if (loudTicks >= TARGET_TICKS) {
        clearInterval(loudTimerRef.current!);
        loudTimerRef.current = null;
        stop();
        setPhase("success");
        onCompleteRef.current();
      }
    }, CONFESSION_TICK_MS);

    return () => {
      if (loudTimerRef.current) {
        clearInterval(loudTimerRef.current);
        loudTimerRef.current = null;
      }
    };
  }, [phase, stop, getVolume, TARGET_TICKS, TICKS_PER_SECOND]);

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
    onFailRef.current();
  }, [stop]);

  // Taunting message based on live volume from rAF (UI only)
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
                onClick={handleStart}
              >
                EMPEZAR
              </IndustrialButton>
            )}
          </>
        )}

        {phase === "listening" && (
          <>
            {/* Volume meter */}
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
                variant={volume >= CONFESSION_VOLUME_THRESHOLD ? "terminal" : "alert"}
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
                {Math.floor(loudSeconds)}/{CONFESSION_DURATION_SECONDS}s a volumen alto
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
