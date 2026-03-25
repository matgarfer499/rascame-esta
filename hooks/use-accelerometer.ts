"use client";

// =============================================================================
// useAccelerometer - Reusable hook for DeviceMotionEvent monitoring
// Returns real-time stability (0-1) and deviation from rest position.
// Android Chrome: no permission prompt needed.
// =============================================================================

import { useState, useRef, useCallback, useEffect } from "react";

type AccelerometerState = {
  /** Stability from 0 (shaking) to 1 (perfectly still) */
  stability: number;
  /** Raw deviation from resting position */
  deviation: number;
  /** Whether monitoring is active */
  isMonitoring: boolean;
  /** Start monitoring accelerometer */
  start: () => void;
  /** Stop monitoring */
  stop: () => void;
};

/** Threshold used to normalize stability (deviation / this = instability) */
const NORMALIZATION_FACTOR = 10;

export default function useAccelerometer(
  stabilityThreshold: number,
): AccelerometerState {
  const [stability, setStability] = useState(1);
  const [deviation, setDeviation] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const listenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  const stop = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener("devicemotion", listenerRef.current);
      listenerRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  const start = useCallback(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      // Deviation from resting position (gravity subtracted from Z)
      const dev = Math.sqrt(
        (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + ((acc.z ?? 0) - 9.8) ** 2,
      );
      setDeviation(dev);

      const normalizedStability = Math.max(
        0,
        1 - dev / (stabilityThreshold * NORMALIZATION_FACTOR),
      );
      setStability(normalizedStability);
    };

    listenerRef.current = handleMotion;
    window.addEventListener("devicemotion", handleMotion);
    setIsMonitoring(true);
  }, [stabilityThreshold]);

  // Cleanup on unmount
  useEffect(() => stop, [stop]);

  return { stability, deviation, isMonitoring, start, stop };
}
