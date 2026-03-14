"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

// =============================================================================
// Timer - Countdown or count-up timer with industrial styling
// =============================================================================

type TimerProps = {
  /** For countdown: total seconds. For count-up: omit or set to 0. */
  initialSeconds?: number;
  /** Count direction */
  mode?: "countdown" | "countup";
  /** Start counting on mount */
  autoStart?: boolean;
  /** Called when countdown reaches 0 */
  onComplete?: () => void;
  /** Called every tick with current seconds */
  onTick?: (seconds: number) => void;
  /** Visual variant */
  variant?: "default" | "alert" | "terminal";
  /** Large display size */
  large?: boolean;
  className?: string;
};

const VARIANT_STYLES: Record<string, string> = {
  default: "text-text-primary",
  alert: "text-alert",
  terminal: "text-terminal",
};

export default function Timer({
  initialSeconds = 0,
  mode = "countdown",
  autoStart = true,
  onComplete,
  onTick,
  variant = "default",
  large = false,
  className,
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  // Keep callback refs fresh without re-triggering effects
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Track whether onComplete has already fired to prevent double-calls
  const completeFiredRef = useRef(false);

  // Reset completeFired when timer restarts
  useEffect(() => {
    if (running) {
      completeFiredRef.current = false;
    }
  }, [running]);

  // Core interval: only computes next value, no side effects
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = mode === "countdown" ? prev - 1 : prev + 1;
        if (mode === "countdown" && next <= 0) return 0;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, mode]);

  // Side effects: fire onTick and detect countdown completion
  // Runs AFTER setSeconds commits so parent state updates are safe
  useEffect(() => {
    if (mode === "countdown" && seconds <= 0 && running) {
      setRunning(false);
      if (!completeFiredRef.current) {
        completeFiredRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    if (seconds !== initialSeconds) {
      onTickRef.current?.(seconds);
    }
  }, [seconds, running, mode, initialSeconds]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(
    (newSeconds?: number) => {
      setSeconds(newSeconds ?? initialSeconds);
      setRunning(false);
    },
    [initialSeconds],
  );

  // Determine if we should pulse (countdown under 10 seconds)
  const shouldPulse = mode === "countdown" && seconds <= 10 && seconds > 0;

  return (
    <div
      className={cn(
        "font-stencil tabular-nums",
        large ? "text-4xl" : "text-xl",
        VARIANT_STYLES[variant],
        shouldPulse && "animate-[pulse-alert_500ms_step-end_infinite]",
        className,
      )}
      role="timer"
      aria-live="polite"
    >
      {formatTime(seconds)}
    </div>
  );
}

// Export control methods type for external use via ref pattern
export type TimerControls = {
  start: () => void;
  pause: () => void;
  reset: (seconds?: number) => void;
};
