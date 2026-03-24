"use client";

// =============================================================================
// CodecShutter - Two-panel black shutter that closes to center then reopens.
//
// Usage:
//   <CodecShutter active={shutterActive} onMidpoint={fn} onComplete={fn} />
//
// When `active` transitions false → true:
//   1. Both panels animate closed (top panel scales down from top, bottom from
//      bottom) over CLOSE_MS ms.
//   2. At midpoint: onMidpoint() fires (caller swaps visible content).
//   3. Both panels animate open over OPEN_MS ms.
//   4. At complete: onComplete() fires (shutter resets to idle).
//
// Reuses existing `shutter-close` / `shutter-open` CSS keyframes from
// globals.css (scaleY(0→1) and scaleY(1→0)).
// =============================================================================

import { useEffect, useRef, useState } from "react";

const CLOSE_MS = 380;
const OPEN_MS  = 380;

type ShutterState = "idle" | "closing" | "opening";

type CodecShutterProps = {
  /** Trigger the shutter sequence when this flips from false to true */
  active: boolean;
  /** Called when both panels are fully closed (midpoint of transition) */
  onMidpoint: () => void;
  /** Called when both panels are fully open (transition complete) */
  onComplete: () => void;
};

export default function CodecShutter({
  active,
  onMidpoint,
  onComplete,
}: CodecShutterProps) {
  const [state, setState] = useState<ShutterState>("idle");

  // Freeze callbacks in refs so the effect below never re-runs due to new
  // function references from the parent.
  const onMidpointRef = useRef(onMidpoint);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onMidpointRef.current = onMidpoint; }, [onMidpoint]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const prevActiveRef = useRef(false);

  useEffect(() => {
    // Only trigger on false → true edge
    if (!active || prevActiveRef.current === active) {
      prevActiveRef.current = active;
      return;
    }
    prevActiveRef.current = active;

    // Phase 1: close
    setState("closing");

    const midTimer = setTimeout(() => {
      onMidpointRef.current();
      // Phase 2: open
      setState("opening");

      const endTimer = setTimeout(() => {
        onCompleteRef.current();
        setState("idle");
      }, OPEN_MS);

      return () => clearTimeout(endTimer);
    }, CLOSE_MS);

    return () => clearTimeout(midTimer);
  }, [active]);

  if (state === "idle") return null;

  const closingAnim = `shutter-close ${CLOSE_MS}ms step-end forwards`;
  const openingAnim = `shutter-open  ${OPEN_MS}ms  step-end forwards`;
  const animation   = state === "closing" ? closingAnim : openingAnim;

  return (
    <>
      {/* Top panel — scales from top edge downward */}
      <div
        className="fixed inset-x-0 top-0 h-1/2 bg-black z-50 origin-top"
        style={{ animation }}
      />
      {/* Bottom panel — scales from bottom edge upward */}
      <div
        className="fixed inset-x-0 bottom-0 h-1/2 bg-black z-50 origin-bottom"
        style={{ animation }}
      />
    </>
  );
}
