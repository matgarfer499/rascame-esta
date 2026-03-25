"use client";

// =============================================================================
// HoldPositionAction - Both twins hold fingers down while phone stays still
// Combines dual touch zones with accelerometer stability monitoring.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { BOSS_STABILITY_THRESHOLD } from "@/lib/constants";
import { ProgressBar } from "@/components/ui";
import useAccelerometer from "@/hooks/use-accelerometer";
import type { BossActionComponentProps } from "./index";

/** Deviation threshold for immediate failure */
const EXCESSIVE_MOVEMENT = BOSS_STABILITY_THRESHOLD * 10;

export default function HoldPositionAction({
  duration,
  onSuccess,
  onFailure,
}: BossActionComponentProps) {
  const [finger1, setFinger1] = useState(false);
  const [finger2, setFinger2] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [active, setActive] = useState(true);

  const { stability, deviation, start: startAccel, stop: stopAccel } =
    useAccelerometer(BOSS_STABILITY_THRESHOLD);

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const deviationRef = useRef(0);
  const zone1Ref = useRef<HTMLDivElement>(null);
  const zone2Ref = useRef<HTMLDivElement>(null);

  // Keep deviation ref in sync for use inside interval callback
  useEffect(() => {
    deviationRef.current = deviation;
  }, [deviation]);

  const handleResult = useCallback(
    (success: boolean) => {
      if (!active) return;
      setActive(false);
      stopAccel();
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (success) onSuccess();
      else onFailure();
    },
    [active, stopAccel, onSuccess, onFailure],
  );

  // Start accelerometer on mount
  useEffect(() => {
    startAccel();
  }, [startAccel]);

  /** Start the hold timer when both fingers are down */
  const startHold = useCallback(() => {
    startTimeRef.current = Date.now();
    holdTimerRef.current = setInterval(() => {
      // Check for excessive movement inside the timer callback
      if (deviationRef.current > EXCESSIVE_MOVEMENT) {
        handleResult(false);
        return;
      }
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      setHoldProgress(progress);
      if (progress >= 1) handleResult(true);
    }, 100);
  }, [duration, handleResult]);

  /** Handle finger down events */
  const handleFingerDown = useCallback(
    (finger: 1 | 2) => {
      if (finger === 1) setFinger1(true);
      else setFinger2(true);

      // Check if BOTH fingers are now down
      const otherDown = finger === 1 ? finger2 : finger1;
      if (otherDown && holdTimerRef.current === null) {
        startHold();
      }
    },
    [finger1, finger2, startHold],
  );

  /** Handle finger up — immediate failure if mid-hold */
  const handleFingerUp = useCallback(
    (finger: 1 | 2) => {
      if (finger === 1) setFinger1(false);
      else setFinger2(false);
      if (holdTimerRef.current !== null) handleResult(false);
    },
    [handleResult],
  );

  // Non-passive touch listeners
  useEffect(() => {
    const z1 = zone1Ref.current;
    const z2 = zone2Ref.current;
    if (!z1 || !z2) return;

    const opts: AddEventListenerOptions = { passive: false };
    const onStart1 = (e: TouchEvent) => { e.preventDefault(); handleFingerDown(1); };
    const onEnd1 = (e: TouchEvent) => { e.preventDefault(); handleFingerUp(1); };
    const onStart2 = (e: TouchEvent) => { e.preventDefault(); handleFingerDown(2); };
    const onEnd2 = (e: TouchEvent) => { e.preventDefault(); handleFingerUp(2); };

    z1.addEventListener("touchstart", onStart1, opts);
    z1.addEventListener("touchend", onEnd1, opts);
    z2.addEventListener("touchstart", onStart2, opts);
    z2.addEventListener("touchend", onEnd2, opts);
    return () => {
      z1.removeEventListener("touchstart", onStart1);
      z1.removeEventListener("touchend", onEnd1);
      z2.removeEventListener("touchstart", onStart2);
      z2.removeEventListener("touchend", onEnd2);
    };
  }, [handleFingerDown, handleFingerUp]);

  const bothDown = finger1 && finger2;

  return (
    <div className="flex flex-col w-full h-full gap-3">
      {/* Stability + Progress */}
      <div className="px-2">
        {bothDown && (
          <>
            <ProgressBar value={holdProgress} variant="terminal" showLabel height="h-4" />
            <div className="flex justify-between text-[10px] font-mono mt-2 mb-1">
              <span className="text-text-dead">{UI.bossStability}</span>
              <span className={cn(stability > 0.5 ? "text-terminal" : "text-alert")}>
                {Math.round(stability * 100)}%
              </span>
            </div>
            <ProgressBar
              value={stability}
              variant={stability > 0.5 ? "terminal" : "alert"}
              height="h-2"
            />
          </>
        )}
        {!bothDown && (
          <p className="font-condensed text-lg text-text-dim text-center uppercase">
            {UI.bossHoldPositionHint}
          </p>
        )}
      </div>

      {/* Touch zones */}
      <div className="flex gap-2 flex-1 min-h-[30vh]">
        <div
          ref={zone1Ref}
          className={cn(
            "flex-1 flex items-center justify-center",
            "border-2 rounded-[1px] select-none touch-none",
            "font-condensed text-lg uppercase",
            finger1
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
        <div
          ref={zone2Ref}
          className={cn(
            "flex-1 flex items-center justify-center",
            "border-2 rounded-[1px] select-none touch-none",
            "font-condensed text-lg uppercase",
            finger2
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
  );
}
