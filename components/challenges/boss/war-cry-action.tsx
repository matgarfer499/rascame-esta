"use client";

// =============================================================================
// WarCryAction - Both twins must shout above volume threshold
// Uses the microphone to detect sustained loud volume.
//
// Volume is sampled synchronously via getVolume() on every tick to avoid the
// stale-closure bug where including `volume` state in the interval effect deps
// would restart the interval on every rAF frame before it could ever fire.
// Same pattern as ConfessionChallenge.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { BOSS_VOLUME_THRESHOLD } from "@/lib/constants";
import { ProgressBar } from "@/components/ui";
import useMicrophone from "@/hooks/use-microphone";
import type { BossActionComponentProps } from "./index";

const TICK_MS = 200; // sampling interval in ms
const TICKS_PER_SECOND = 1000 / TICK_MS;

export default function WarCryAction({
  duration,
  onSuccess,
  onFailure,
}: BossActionComponentProps) {
  const { volume, isListening, hasError, start, stop, getVolume } = useMicrophone();
  const [loudSeconds, setLoudSeconds] = useState(0);
  const [active, setActive] = useState(true);

  const loudTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleResult = useCallback(
    (success: boolean) => {
      if (!active) return;
      setActive(false);
      stop();
      if (loudTimerRef.current) clearInterval(loudTimerRef.current);
      if (failTimerRef.current) clearTimeout(failTimerRef.current);
      if (success) onSuccess();
      else onFailure();
    },
    [active, stop, onSuccess, onFailure],
  );

  // Start microphone on mount
  useEffect(() => {
    start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If mic fails, auto-succeed (graceful degradation)
  useEffect(() => {
    if (hasError) {
      setTimeout(() => handleResult(true), 2000);
    }
  }, [hasError, handleResult]);

  // Track accumulated loud ticks while listening.
  // getVolume() reads the AnalyserNode synchronously on every tick — no React
  // state pipeline, no stale closure. Same pattern as ConfessionChallenge.
  useEffect(() => {
    if (!isListening || !active) return;

    const targetTicks = duration * TICKS_PER_SECOND;
    let loudTicks = 0;

    loudTimerRef.current = setInterval(() => {
      const currentVolume = getVolume();

      if (currentVolume >= BOSS_VOLUME_THRESHOLD) {
        loudTicks = Math.min(loudTicks + 1, targetTicks);
      } else {
        loudTicks = Math.max(0, loudTicks - 1);
      }

      setLoudSeconds(loudTicks / TICKS_PER_SECOND);

      if (loudTicks >= targetTicks) {
        clearInterval(loudTimerRef.current!);
        loudTimerRef.current = null;
        handleResult(true);
      }
    }, TICK_MS);

    // Overall timeout — extra 2s grace period beyond the target duration
    failTimerRef.current = setTimeout(
      () => handleResult(false),
      (duration + 2) * 1000,
    );

    return () => {
      if (loudTimerRef.current) clearInterval(loudTimerRef.current);
      if (failTimerRef.current) clearTimeout(failTimerRef.current);
    };
  // Only re-run when isListening or active change — getVolume is stable (useCallback [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, active]);

  const volumePercent = Math.min(volume / 0.25, 1);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Volume meter */}
      <div className="w-full">
        <div className="flex justify-between text-[10px] font-mono mb-1">
          <span className="text-text-dead">{UI.confessionVolumeLabel}</span>
          <span
            className={cn(
              volume >= BOSS_VOLUME_THRESHOLD ? "text-terminal" : "text-alert",
            )}
          >
            {Math.round(volumePercent * 100)}%
          </span>
        </div>
        <ProgressBar
          value={volumePercent}
          variant={volume >= BOSS_VOLUME_THRESHOLD ? "terminal" : "alert"}
          height="h-6"
        />
      </div>

      {/* Loud seconds progress */}
      <div className="w-full">
        <ProgressBar
          value={loudSeconds / duration}
          variant="terminal"
          showLabel
          height="h-4"
        />
        <p className="text-text-dead text-[10px] font-mono text-center mt-1">
          {Math.floor(loudSeconds)}/{duration}s
        </p>
      </div>

      {/* Taunt */}
      <p
        className={cn(
          "font-mono text-xs text-center",
          volume >= BOSS_VOLUME_THRESHOLD
            ? "text-terminal"
            : "text-alert animate-[pulse-alert_500ms_step-end_infinite]",
        )}
      >
        {volume < 0.03
          ? UI.confessionLouder
          : volume < BOSS_VOLUME_THRESHOLD
            ? UI.confessionIsAllYouGot
            : UI.confessionGrandmaLouder}
      </p>
    </div>
  );
}
