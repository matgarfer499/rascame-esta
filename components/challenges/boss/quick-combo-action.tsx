"use client";

// =============================================================================
// QuickComboAction - Tap numbered targets in sequence
// Numbered circles appear one by one; players must tap each before timeout.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { BossActionComponentProps } from "./index";

/** Grid positions for combo targets (percentage-based for responsiveness) */
const TARGET_POSITIONS = [
  { x: 20, y: 25 },
  { x: 70, y: 20 },
  { x: 35, y: 60 },
  { x: 75, y: 65 },
  { x: 15, y: 80 },
  { x: 55, y: 40 },
] as const;

/** Target size in pixels */
const TARGET_SIZE = 64;

export default function QuickComboAction({
  duration,
  onSuccess,
  onFailure,
}: BossActionComponentProps) {
  const totalTargets = duration <= 5 ? 4 : 6;
  const [currentTarget, setCurrentTarget] = useState(0);
  const [active, setActive] = useState(true);
  const [flashWrong, setFlashWrong] = useState<number | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perTargetTimeout = (duration * 1000) / totalTargets;

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

  // Per-target timeout
  useEffect(() => {
    if (!active) return;
    timeoutRef.current = setTimeout(() => handleResult(false), perTargetTimeout);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentTarget, active, perTargetTimeout, handleResult]);

  /** Handle tap on a target */
  const handleTap = useCallback(
    (index: number) => {
      if (!active) return;

      if (index === currentTarget) {
        // Correct target
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const next = currentTarget + 1;
        if (next >= totalTargets) {
          handleResult(true);
        } else {
          setCurrentTarget(next);
        }
      } else {
        // Wrong target — flash red and fail
        setFlashWrong(index);
        setTimeout(() => handleResult(false), 300);
      }
    },
    [active, currentTarget, totalTargets, handleResult],
  );

  return (
    <div className="relative w-full h-full min-h-[40vh]">
      {/* Progress indicator */}
      <div className="absolute top-0 left-0 right-0 text-center">
        <span className="font-mono text-[10px] text-text-dead">
          {currentTarget}/{totalTargets}
        </span>
      </div>

      {/* Targets */}
      {Array.from({ length: totalTargets }).map((_, i) => {
        const pos = TARGET_POSITIONS[i % TARGET_POSITIONS.length];
        const isCurrent = i === currentTarget;
        const isHit = i < currentTarget;
        const isWrong = flashWrong === i;

        return (
          <button
            key={i}
            type="button"
            className={cn(
              "absolute flex items-center justify-center",
              "rounded-[1px] border-2 font-condensed text-xl",
              "select-none touch-none transition-none",
              isCurrent &&
                "border-warning bg-warning/20 text-warning animate-[pulse-alert_500ms_step-end_infinite]",
              isHit && "border-terminal/30 bg-terminal/10 text-terminal/30",
              !isCurrent && !isHit && !isWrong &&
                "border-bunker-700 bg-bunker-800 text-text-dead",
              isWrong && "border-alert bg-alert/30 text-alert",
            )}
            style={{
              left: `calc(${pos.x}% - ${TARGET_SIZE / 2}px)`,
              top: `calc(${pos.y}% - ${TARGET_SIZE / 2}px)`,
              width: TARGET_SIZE,
              height: TARGET_SIZE,
            }}
            onClick={() => handleTap(i)}
            disabled={!active || isHit}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
