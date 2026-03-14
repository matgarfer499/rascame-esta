"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  BOSS_HOLD_DURATION_SECONDS,
  BOSS_STABILITY_THRESHOLD,
  BOSS_DISTRACTION_INTERVAL_MS,
} from "@/lib/constants";
import { shuffle } from "@/lib/utils";
import { DISTRACTION_CONTENT } from "@/lib/content";
import type { DistractionItem } from "@/lib/types";
import {
  ScreenShell,
  ScanLines,
  ProgressBar,
} from "@/components/ui";

// =============================================================================
// BossChallenge (Aguante Dual) - Both twins hold fingers on screen
// Phone must stay still (accelerometer). Distracting content is shown.
// Must hold for BOSS_HOLD_DURATION_SECONDS without releasing or moving.
// =============================================================================

type BossChallengeProps = {
  onComplete: () => void;
  onFail: () => void;
};

type Phase = "ready" | "holding" | "success" | "failed";

export default function BossChallenge({
  onComplete,
  onFail,
}: BossChallengeProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [holdProgress, setHoldProgress] = useState(0);
  const [stability, setStability] = useState(1);
  const [currentDistraction, setCurrentDistraction] =
    useState<DistractionItem | null>(null);
  const [finger1Down, setFinger1Down] = useState(false);
  const [finger2Down, setFinger2Down] = useState(false);

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const distractionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accelListenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const startTimeRef = useRef(0);

  const finger1Ref = useRef<HTMLDivElement>(null);
  const finger2Ref = useRef<HTMLDivElement>(null);

  const distractions = useRef(shuffle([...DISTRACTION_CONTENT]));
  const distractionIndexRef = useRef(0);

  /** Start the hold challenge */
  const startHold = useCallback(() => {
    setPhase("holding");
    startTimeRef.current = Date.now();

    // Hold progress timer
    holdTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / BOSS_HOLD_DURATION_SECONDS, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        // Success!
        setPhase("success");
        cleanup();
        onComplete();
      }
    }, 100);

    // Distraction rotator
    distractionTimerRef.current = setInterval(() => {
      const idx = distractionIndexRef.current % distractions.current.length;
      setCurrentDistraction(distractions.current[idx]);
      distractionIndexRef.current++;
    }, BOSS_DISTRACTION_INTERVAL_MS);

    // Show first distraction immediately
    setCurrentDistraction(distractions.current[0]);
    distractionIndexRef.current = 1;

    // Accelerometer monitoring (Android — no permission needed)
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      // Calculate deviation from resting position
      const deviation = Math.sqrt(
        (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + ((acc.z ?? 0) - 9.8) ** 2,
      );

      const normalizedStability = Math.max(
        0,
        1 - deviation / (BOSS_STABILITY_THRESHOLD * 20),
      );
      setStability(normalizedStability);

      if (deviation > BOSS_STABILITY_THRESHOLD * 10) {
        // Too much movement — fail
        setPhase("failed");
        cleanup();
        onFail();
      }
    };

    accelListenerRef.current = handleMotion;
    window.addEventListener("devicemotion", handleMotion);
  }, [onComplete, onFail]);

  /** Cleanup all timers and listeners */
  const cleanup = useCallback(() => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (distractionTimerRef.current) clearInterval(distractionTimerRef.current);
    if (accelListenerRef.current) {
      window.removeEventListener("devicemotion", accelListenerRef.current);
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  /** Handle touch events for the two finger zones */
  const handleFingerDown = useCallback(
    (finger: 1 | 2) => {
      if (finger === 1) setFinger1Down(true);
      else setFinger2Down(true);

      // Start if both fingers are down
      if (phase === "ready") {
        if ((finger === 1 && finger2Down) || (finger === 2 && finger1Down)) {
          startHold();
        }
      }
    },
    [phase, finger1Down, finger2Down, startHold],
  );

  const handleFingerUp = useCallback(
    (finger: 1 | 2) => {
      if (finger === 1) setFinger1Down(false);
      else setFinger2Down(false);

      if (phase === "holding") {
        // Finger lifted during challenge — fail
        setPhase("failed");
        cleanup();
        onFail();
      }
    },
    [phase, cleanup, onFail],
  );

  const bothFingersDown = finger1Down && finger2Down;

  // Attach non-passive touch listeners to allow preventDefault
  useEffect(() => {
    const zone1 = finger1Ref.current;
    const zone2 = finger2Ref.current;
    if (!zone1 || !zone2) return;

    const onTouchStart1 = (e: TouchEvent) => {
      e.preventDefault();
      handleFingerDown(1);
    };
    const onTouchEnd1 = (e: TouchEvent) => {
      e.preventDefault();
      handleFingerUp(1);
    };
    const onTouchStart2 = (e: TouchEvent) => {
      e.preventDefault();
      handleFingerDown(2);
    };
    const onTouchEnd2 = (e: TouchEvent) => {
      e.preventDefault();
      handleFingerUp(2);
    };

    const opts: AddEventListenerOptions = { passive: false };
    zone1.addEventListener("touchstart", onTouchStart1, opts);
    zone1.addEventListener("touchend", onTouchEnd1, opts);
    zone2.addEventListener("touchstart", onTouchStart2, opts);
    zone2.addEventListener("touchend", onTouchEnd2, opts);

    return () => {
      zone1.removeEventListener("touchstart", onTouchStart1);
      zone1.removeEventListener("touchend", onTouchEnd1);
      zone2.removeEventListener("touchstart", onTouchStart2);
      zone2.removeEventListener("touchend", onTouchEnd2);
    };
  }, [handleFingerDown, handleFingerUp]);

  return (
    <ScreenShell>
      <ScanLines />

      <div className="flex flex-col h-dvh">
        {/* Header */}
        <div className="pt-4 px-4">
          <h2 className="font-condensed text-2xl text-alert uppercase tracking-wider mb-2">
            {UI.bossTitle}
          </h2>

          {/* Progress bar */}
          {phase === "holding" && (
            <ProgressBar
              value={holdProgress}
              variant="terminal"
              showLabel
              height="h-4"
            />
          )}

          {/* Stability meter */}
          {phase === "holding" && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-text-dead">{UI.bossStability}</span>
                <span
                  className={cn(
                    stability > 0.5 ? "text-terminal" : "text-alert",
                  )}
                >
                  {Math.round(stability * 100)}%
                </span>
              </div>
              <ProgressBar
                value={stability}
                variant={stability > 0.5 ? "terminal" : "alert"}
                height="h-2"
              />
            </div>
          )}
        </div>

        {/* Distraction zone (center) */}
        <div className="flex-1 flex items-center justify-center px-4">
          {phase === "ready" && (
            <p className="font-condensed text-xl text-text-dim text-center uppercase">
              {UI.bossDontMove}
            </p>
          )}

          {phase === "holding" && currentDistraction && (
            <div className="text-center animate-[stamp-in_200ms_step-end_forwards]">
              <p className="font-mono text-lg text-warning leading-relaxed">
                {currentDistraction.content}
              </p>
            </div>
          )}
        </div>

        {/* Two finger zones (bottom half) */}
        <div className="flex gap-2 px-4 pb-4 h-[35vh]">
          {/* Finger 1 zone */}
          <div
            ref={finger1Ref}
            className={cn(
              "flex-1 flex items-center justify-center",
              "border-2 rounded-[1px]",
              "font-condensed text-lg uppercase",
              "select-none touch-none",
              finger1Down
                ? "bg-terminal/20 border-terminal text-terminal"
                : "bg-bunker-800 border-bunker-700 text-text-dead",
            )}
            onMouseDown={() => handleFingerDown(1)}
            onMouseUp={() => handleFingerUp(1)}
          >
            <div className="text-center">
              <p>{UI.bossFingerHere}</p>
              <p className="text-xs mt-1">{UI.twin1}</p>
            </div>
          </div>

          {/* Finger 2 zone */}
          <div
            ref={finger2Ref}
            className={cn(
              "flex-1 flex items-center justify-center",
              "border-2 rounded-[1px]",
              "font-condensed text-lg uppercase",
              "select-none touch-none",
              finger2Down
                ? "bg-terminal/20 border-terminal text-terminal"
                : "bg-bunker-800 border-bunker-700 text-text-dead",
            )}
            onMouseDown={() => handleFingerDown(2)}
            onMouseUp={() => handleFingerUp(2)}
          >
            <div className="text-center">
              <p>{UI.bossFingerHere}</p>
              <p className="text-xs mt-1">{UI.twin2}</p>
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
