"use client";

// =============================================================================
// WarCryAction - Both twins must shout above volume threshold
// Uses the microphone to detect sustained loud volume.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { BOSS_VOLUME_THRESHOLD } from "@/lib/constants";
import { ProgressBar } from "@/components/ui";
import useMicrophone from "@/hooks/use-microphone";
import type { BossActionComponentProps } from "./index";

export default function WarCryAction({
  duration,
  onSuccess,
  onFailure,
}: BossActionComponentProps) {
  const { volume, isListening, hasError, start, stop } = useMicrophone();
  const [loudSeconds, setLoudSeconds] = useState(0);
  const [active, setActive] = useState(true);

  const loudTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveRef = useRef(0);

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
  }, [start]);

  // If mic fails, auto-succeed (graceful degradation)
  useEffect(() => {
    if (hasError) {
      setTimeout(() => handleResult(true), 2000);
    }
  }, [hasError, handleResult]);

  // Track consecutive loud seconds
  useEffect(() => {
    if (!isListening) return;

    loudTimerRef.current = setInterval(() => {
      // Read volume directly from the DOM update cycle via ref approach
      // We check volume threshold in a separate effect below
    }, 1000);

    // Overall timeout for the action
    failTimerRef.current = setTimeout(
      () => handleResult(false),
      (duration + 2) * 1000, // Extra 2s grace period
    );

    return () => {
      if (loudTimerRef.current) clearInterval(loudTimerRef.current);
      if (failTimerRef.current) clearTimeout(failTimerRef.current);
    };
  }, [isListening, duration, handleResult]);

  // Monitor volume every second for consecutive loud tracking
  useEffect(() => {
    if (!isListening || !active) return;

    const timer = setInterval(() => {
      if (volume >= BOSS_VOLUME_THRESHOLD) {
        consecutiveRef.current++;
        setLoudSeconds(consecutiveRef.current);
        if (consecutiveRef.current >= duration) {
          handleResult(true);
        }
      } else {
        consecutiveRef.current = Math.max(0, consecutiveRef.current - 1);
        setLoudSeconds(consecutiveRef.current);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isListening, active, volume, duration, handleResult]);

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
          {loudSeconds}/{duration}s
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
