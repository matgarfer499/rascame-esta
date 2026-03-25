"use client";

// =============================================================================
// DoubleStrikeAction - Both twins must tap their zone simultaneously
// Two touch zones appear; both must be pressed within a tight time window.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import type { BossActionComponentProps } from "./index";

/** Max time between the two taps to count as simultaneous (ms) */
const SIMULTANEOUS_WINDOW_MS = 1500;

export default function DoubleStrikeAction({
  duration,
  onSuccess,
  onFailure,
}: BossActionComponentProps) {
  const [finger1, setFinger1] = useState(false);
  const [finger2, setFinger2] = useState(false);
  const [active, setActive] = useState(true);

  const finger1TimeRef = useRef<number | null>(null);
  const finger2TimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zone1Ref = useRef<HTMLDivElement>(null);
  const zone2Ref = useRef<HTMLDivElement>(null);

  const handleResult = useCallback(
    (success: boolean) => {
      if (!active) return;
      setActive(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (success) onSuccess();
      else onFailure();
    },
    [active, onSuccess, onFailure],
  );

  /** Check if both fingers tapped within the time window */
  const checkSimultaneous = useCallback(
    (finger: 1 | 2) => {
      const now = Date.now();
      if (finger === 1) finger1TimeRef.current = now;
      else finger2TimeRef.current = now;

      const other = finger === 1 ? finger2TimeRef.current : finger1TimeRef.current;
      if (other !== null && Math.abs(now - other) <= SIMULTANEOUS_WINDOW_MS) {
        handleResult(true);
      }
    },
    [handleResult],
  );

  // Timeout: if they don't tap both in time, fail
  useEffect(() => {
    timeoutRef.current = setTimeout(() => handleResult(false), duration * 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [duration, handleResult]);

  // Non-passive touch listeners
  useEffect(() => {
    const z1 = zone1Ref.current;
    const z2 = zone2Ref.current;
    if (!z1 || !z2) return;

    const opts: AddEventListenerOptions = { passive: false };
    const onTouch1 = (e: TouchEvent) => {
      e.preventDefault();
      setFinger1(true);
      checkSimultaneous(1);
    };
    const onTouch2 = (e: TouchEvent) => {
      e.preventDefault();
      setFinger2(true);
      checkSimultaneous(2);
    };

    z1.addEventListener("touchstart", onTouch1, opts);
    z2.addEventListener("touchstart", onTouch2, opts);
    return () => {
      z1.removeEventListener("touchstart", onTouch1);
      z2.removeEventListener("touchstart", onTouch2);
    };
  }, [checkSimultaneous]);

  return (
    <div className="flex gap-2 w-full h-full">
      {/* Zone 1 */}
      <div
        ref={zone1Ref}
        className={cn(
          "flex-1 flex items-center justify-center",
          "border-2 rounded-[1px] select-none touch-none",
          "font-condensed text-lg uppercase transition-none",
          finger1
            ? "bg-terminal/20 border-terminal text-terminal"
            : "bg-bunker-800 border-alert text-alert animate-[pulse-alert_500ms_step-end_infinite]",
        )}
        onMouseDown={() => {
          setFinger1(true);
          checkSimultaneous(1);
        }}
      >
        <div className="text-center">
          <p>{UI.bossFingerHere}</p>
          <p className="text-xs mt-1">{UI.twin1}</p>
        </div>
      </div>

      {/* Zone 2 */}
      <div
        ref={zone2Ref}
        className={cn(
          "flex-1 flex items-center justify-center",
          "border-2 rounded-[1px] select-none touch-none",
          "font-condensed text-lg uppercase transition-none",
          finger2
            ? "bg-terminal/20 border-terminal text-terminal"
            : "bg-bunker-800 border-alert text-alert animate-[pulse-alert_500ms_step-end_infinite]",
        )}
        onMouseDown={() => {
          setFinger2(true);
          checkSimultaneous(2);
        }}
      >
        <div className="text-center">
          <p>{UI.bossFingerHere}</p>
          <p className="text-xs mt-1">{UI.twin2}</p>
        </div>
      </div>
    </div>
  );
}
