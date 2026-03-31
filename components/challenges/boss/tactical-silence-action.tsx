"use client";

// =============================================================================
// TacticalSilenceAction - Players must stay completely silent
// Microphone monitors volume; must stay BELOW threshold while distractions play.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { BOSS_SILENCE_THRESHOLD, BOSS_DISTRACTION_INTERVAL_MS } from "@/lib/constants";
import { DISTRACTION_CONTENT } from "@/lib/content";
import { shuffle } from "@/lib/utils";
import { ProgressBar } from "@/components/ui";
import useMicrophone from "@/hooks/use-microphone";
import type { BossActionComponentProps } from "./index";

/** How many consecutive loud samples (at ~60fps) before failure */
const LOUD_FRAME_THRESHOLD = 30; // ~0.5s at 60fps

export default function TacticalSilenceAction({
  duration,
  onSuccess,
  onFailure,
}: BossActionComponentProps) {
  const { volume, isListening, hasError, start, stop } = useMicrophone();
  const [silentSeconds, setSilentSeconds] = useState(0);
  const [distraction, setDistraction] = useState("");
  const [active, setActive] = useState(true);

  const loudFramesRef = useRef(0);
  const silentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const distractionsRef = useRef(shuffle([...DISTRACTION_CONTENT]));
  const distractionIndexRef = useRef(0);

  const handleResult = useCallback(
    (success: boolean) => {
      if (!active) return;
      setActive(false);
      stop();
      if (silentTimerRef.current) clearInterval(silentTimerRef.current);
      if (success) onSuccess();
      else onFailure();
    },
    [active, stop, onSuccess, onFailure],
  );

  // Start mic on mount
  useEffect(() => {
    start();
  }, [start]);

  // Graceful degradation
  useEffect(() => {
    if (hasError) setTimeout(() => handleResult(true), 2000);
  }, [hasError, handleResult]);

  // Track silent seconds
  useEffect(() => {
    if (!isListening || !active) return;

    let seconds = 0;
    silentTimerRef.current = setInterval(() => {
      seconds++;
      setSilentSeconds(seconds);
      if (seconds >= duration) handleResult(true);
    }, 1000);

    return () => {
      if (silentTimerRef.current) clearInterval(silentTimerRef.current);
    };
  }, [isListening, active, duration, handleResult]);

  // Monitor for loud noise (failure detection)
  useEffect(() => {
    if (!isListening || !active) return;

    if (volume > BOSS_SILENCE_THRESHOLD) {
      loudFramesRef.current++;
      if (loudFramesRef.current >= LOUD_FRAME_THRESHOLD) {
        handleResult(false);
      }
    } else {
      loudFramesRef.current = Math.max(0, loudFramesRef.current - 2);
    }
  }, [volume, isListening, active, handleResult]);

  // Rotate distractions to provoke laughter
  useEffect(() => {
    if (!isListening) return;

    // Show first immediately
    setDistraction(distractionsRef.current[0]?.content ?? "");
    distractionIndexRef.current = 1;

    const timer = setInterval(() => {
      const idx = distractionIndexRef.current % distractionsRef.current.length;
      setDistraction(distractionsRef.current[idx]?.content ?? "");
      distractionIndexRef.current++;
    }, BOSS_DISTRACTION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isListening]);

  const noiseLevel = Math.min(volume / 0.15, 1);
  const isTooLoud = volume > BOSS_SILENCE_THRESHOLD;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Silence meter (inverted: green = quiet, red = loud) */}
      <div className="w-full">
        <div className="flex justify-between text-[10px] font-mono mb-1">
          <span className="text-text-dead">RUIDO DETECTADO</span>
          <span className={cn(isTooLoud ? "text-alert" : "text-terminal")}>
            {Math.round(noiseLevel * 100)}%
          </span>
        </div>
        <ProgressBar
          value={noiseLevel}
          variant={isTooLoud ? "alert" : "terminal"}
          height="h-4"
        />
      </div>

      {/* Silent seconds progress */}
      <div className="w-full">
        <ProgressBar
          value={silentSeconds / duration}
          variant="terminal"
          showLabel
          height="h-3"
        />
      </div>

      {/* Distraction content — designed to make them laugh */}
      {distraction && (
        <div className="border-2 border-warning p-4 mt-2 w-full">
          <p className="font-mono text-sm text-warning text-center leading-relaxed">
            {distraction}
          </p>
        </div>
      )}

      {/* Warning */}
      <p
        className={cn(
          "font-mono text-xs text-center",
          isTooLoud
            ? "text-alert animate-[pulse-alert_300ms_step-end_infinite]"
            : "text-text-dead",
        )}
      >
        {isTooLoud ? "¡OS HAN DETECTADO!" : UI.bossTacticalSilenceHint}
      </p>
    </div>
  );
}
