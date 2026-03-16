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
  const [volume, setVolume] = useState(0);
  const [loudSeconds, setLoudSeconds] = useState(0);
  const [micError, setMicError] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const loudTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dareTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentDare = CONFESSION_DARES[dareIndex] ?? CONFESSION_DARES[0];

  /** Start listening */
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setPhase("listening");

      // Shared helper: compute RMS volume from time-domain data (0-1 range)
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function computeRms(): number {
        if (!analyserRef.current) return 0;
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        return Math.sqrt(sumSquares / dataArray.length);
      }

      // Volume monitoring loop (visual meter)
      function updateVolume() {
        const rms = computeRms();
        setVolume(rms);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      }
      updateVolume();

      // Track consecutive loud seconds
      let consecutiveLoud = 0;
      loudTimerRef.current = setInterval(() => {
        const currentVol = computeRms();

        if (currentVol >= CONFESSION_VOLUME_THRESHOLD) {
          consecutiveLoud++;
          setLoudSeconds(consecutiveLoud);

          if (consecutiveLoud >= CONFESSION_DURATION_SECONDS) {
            // Success!
            setPhase("success");
            cleanup();
            onComplete();
          }
        } else {
          // Reset if they go quiet
          consecutiveLoud = Math.max(0, consecutiveLoud - 1);
          setLoudSeconds(consecutiveLoud);
        }
      }, 1000);
    } catch {
      setMicError(true);
      // If mic fails, auto-complete after a few seconds (graceful degradation)
      setTimeout(() => {
        setPhase("success");
        onComplete();
      }, 3000);
    }
  }, [onComplete]);

  /** Cleanup audio resources — idempotent: nulls refs so double-calls are safe */
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    if (loudTimerRef.current) {
      clearInterval(loudTimerRef.current);
      loudTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  // Cycle through dares while listening — loops infinitely via modulo
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
    cleanup();
    setPhase("failed");
    onFail();
  }, [cleanup, onFail]);

  // Taunting message based on volume
  const tauntMessage =
    volume < 0.08
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
            {micError ? (
              <p className="text-alert text-xs font-mono mb-4">
                Error de micrófono. Completando automáticamente...
              </p>
            ) : (
              <IndustrialButton
                variant="danger"
                fullWidth
                onClick={startListening}
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
                  {Math.round(Math.min(volume / 0.5, 1) * 100)}%
                </span>
              </div>
              <ProgressBar
                value={volume / 0.5}
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
