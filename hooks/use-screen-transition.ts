"use client";

// =============================================================================
// useScreenTransition - Wraps screen changes with a CodecShutter animation.
//
// Instead of calling setScreen() directly, consumers call transitionTo().
// The hook drives a CodecShutter: the shutter closes over the current screen,
// at the fully-black midpoint the screen swaps (invisible to the user), then
// the shutter opens revealing the new screen.
//
// Usage:
//   const { shutterActive, transitionTo, onMidpoint, onComplete } =
//     useScreenTransition(setScreen);
//
//   // In JSX (at the root level so it covers the full viewport):
//   <CodecShutter active={shutterActive} onMidpoint={onMidpoint} onComplete={onComplete} />
//
//   // Replace direct setScreen() calls with:
//   transitionTo({ type: "challenge-intro", challengeId })
// =============================================================================

import { useCallback, useRef, useState } from "react";
import type { Screen } from "@/lib/types";

type SetScreen = (screen: Screen) => void;

type UseScreenTransitionReturn = {
  /** Pass to <CodecShutter active={...} /> */
  shutterActive: boolean;
  /**
   * Trigger a shutter-wrapped screen change.
   * The shutter closes over the current screen, swaps content at the midpoint,
   * then opens revealing the new screen.
   */
  transitionTo: (screen: Screen) => void;
  /** Pass to <CodecShutter onMidpoint={...} /> — swaps the screen while black */
  onShutterMidpoint: () => void;
  /** Pass to <CodecShutter onComplete={...} /> — resets shutter state */
  onShutterComplete: () => void;
};

export function useScreenTransition(setScreen: SetScreen): UseScreenTransitionReturn {
  const [shutterActive, setShutterActive] = useState(false);

  // Use a ref so the midpoint callback always reads the latest pending screen
  // without creating stale closure issues. This also avoids an extra render.
  const pendingScreenRef = useRef<Screen | null>(null);

  const transitionTo = useCallback((screen: Screen) => {
    pendingScreenRef.current = screen;
    setShutterActive(true);
  }, []);

  // Called by CodecShutter when both panels are fully closed (screen is black).
  // This is the only moment we swap the screen — React can re-render freely here
  // because the user sees nothing but black panels.
  const onShutterMidpoint = useCallback(() => {
    if (pendingScreenRef.current !== null) {
      setScreen(pendingScreenRef.current);
    }
  }, [setScreen]);

  // Called by CodecShutter when both panels have fully opened again.
  // Reset state for the next transition.
  const onShutterComplete = useCallback(() => {
    pendingScreenRef.current = null;
    setShutterActive(false);
  }, []);

  return { shutterActive, transitionTo, onShutterMidpoint, onShutterComplete };
}
