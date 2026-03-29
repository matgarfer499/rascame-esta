"use client";

// =============================================================================
// useCodecAudio - Manages the MGS-style codec audio sequence
//
// Phase flow:
//   "ringing"   — ring loops from mount, waiting for user to answer
//   "connected" — user answered: ring stopped, portrait visible, accepted beep
//                 playing, Snake not yet speaking (shutter still animating)
//   "playing"   — shutter fully open, Snake's voice message playing
//   "ended"     — voice message finished
//
// Caller responsibilities:
//   1. Tap RESPONDER → unlockAll() + stopRing() + playAccepted() + trigger shutter
//   2. Shutter midpoint → connect()        (swaps CALL→portrait, silent)
//   3. Shutter complete → startMessage()   (Snake starts speaking)
//
// Mobile audio unlock strategy (iOS + Android):
//   - Web Audio API mode (no html5: true) so a single AudioContext governs all
//     sounds. Once resumed from a user gesture, all subsequent play() calls work
//     even when invoked from setTimeout callbacks — fixing the shutter delay chain.
//   - Autoplay attempted on mount: succeeds on returning visits where the
//     AudioContext is already unlocked; silently blocked on first visit/reload.
//   - On first visit/reload, a one-time touchstart/click listener retries
//     ring.play() and resumes the AudioContext on the first user touch —
//     before the user has had a chance to tap RESPONDER.
//   - unlockAll() must be called synchronously from the RESPONDER tap handler
//     to guarantee the setTimeout-delayed message.play() succeeds on iOS Safari,
//     where the user-gesture trust chain does not survive across setTimeout calls.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";

/** Phases of the codec audio sequence */
export type CodecPhase = "ringing" | "connected" | "playing" | "ended";

type CodecAudioConfig = {
  ringSrc: string;
  acceptedSrc: string;
  messageSrc: string;
};

type UseCodecAudioReturn = {
  phase: CodecPhase;
  /** Current playback time of the message audio (seconds) */
  currentTime: number;
  /** Stop the ringing loop (call immediately when user taps RESPONDER) */
  stopRing: () => void;
  /** Play the accepted-call beep (call immediately when user taps RESPONDER) */
  playAccepted: () => void;
  /** Switch to connected phase — portrait visible, no voice yet (shutter midpoint) */
  connect: () => void;
  /** Begin the voice message (call when shutter has fully opened) */
  startMessage: () => void;
  /**
   * Resume the shared Web Audio AudioContext from within a user gesture.
   * Must be called synchronously in the RESPONDER tap handler so that
   * iOS Safari allows the setTimeout-delayed message.play() to succeed.
   */
  unlockAll: () => void;
};

export function useCodecAudio(config: CodecAudioConfig): UseCodecAudioReturn {
  const [phase, setPhase] = useState<CodecPhase>("ringing");
  const [currentTime, setCurrentTime] = useState(0);

  // Freeze config so the mount effect never re-runs on parent re-renders
  const configRef = useRef(config);

  const ringRef     = useRef<Howl | null>(null);
  const acceptedRef = useRef<Howl | null>(null);
  const messageRef  = useRef<Howl | null>(null);
  const rafRef      = useRef<number>(0);

  // Tracks whether the ring has successfully started playing
  const ringPlayingRef = useRef(false);

  // ── Mount: create all three Howls and start ring loop ──────────────────
  useEffect(() => {
    const { ringSrc, acceptedSrc, messageSrc } = configRef.current;

    // Web Audio API mode (html5: false, the default) — all three sounds share
    // a single AudioContext. Resuming it once from any gesture unlocks all
    // subsequent play() calls, including those deferred via setTimeout.
    ringRef.current = new Howl({
      src: [ringSrc],
      loop: true,
      volume: 0.7,
      preload: true,
    });

    acceptedRef.current = new Howl({
      src: [acceptedSrc],
      volume: 1.0,
      preload: true,
    });

    messageRef.current = new Howl({
      src: [messageSrc],
      volume: 1.0,
      preload: true,
    });

    const ring = ringRef.current;

    // ── Gesture fallback: retry ring on first user touch ────────────────
    // If autoplay is blocked (first visit / page reload), this fires on the
    // first touchstart or click — which happens at least when the user taps
    // the RESPONDER button, but often earlier if they swipe/touch the screen.
    const handleGestureUnlock = () => {
      removeGestureListeners();

      // Ensure the shared AudioContext is running
      if (Howler.ctx && Howler.ctx.state !== "running") {
        Howler.ctx.resume().catch(() => {});
      }

      // Only retry if autoplay didn't already succeed
      if (!ringPlayingRef.current) {
        ring.play();
      }
    };

    const removeGestureListeners = () => {
      document.removeEventListener("touchstart", handleGestureUnlock, true);
      document.removeEventListener("click",      handleGestureUnlock, true);
    };

    document.addEventListener("touchstart", handleGestureUnlock, true);
    document.addEventListener("click",      handleGestureUnlock, true);

    // If autoplay succeeds immediately, cancel the gesture listeners early
    ring.once("play", () => {
      ringPlayingRef.current = true;
      removeGestureListeners();
    });

    // Attempt autoplay — silently queued until AudioContext is active
    ring.play();

    return () => {
      removeGestureListeners();
      cancelAnimationFrame(rafRef.current);
      ringRef.current?.unload();
      acceptedRef.current?.unload();
      messageRef.current?.unload();
    };
  }, []); // intentionally empty — config read via ref

  // ── rAF loop: tracks voice message playback position ───────────────────
  const startTracking = useCallback(() => {
    const tick = () => {
      const howl = messageRef.current;
      if (howl && howl.playing()) {
        setCurrentTime(howl.seek() as number);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── unlockAll ───────────────────────────────────────────────────────────
  // Call synchronously inside the RESPONDER tap handler. Resumes Howler's
  // shared AudioContext so that deferred play() calls (e.g. message after
  // shutter animation) work on iOS Safari.
  const unlockAll = useCallback(() => {
    if (Howler.ctx && Howler.ctx.state !== "running") {
      Howler.ctx.resume().catch(() => {});
    }
  }, []);

  // ── stopRing ────────────────────────────────────────────────────────────
  const stopRing = useCallback(() => {
    ringPlayingRef.current = false;
    ringRef.current?.stop();
  }, []);

  // ── playAccepted ────────────────────────────────────────────────────────
  const playAccepted = useCallback(() => {
    acceptedRef.current?.play();
  }, []);

  // ── connect ─────────────────────────────────────────────────────────────
  // Called at shutter midpoint: portrait swaps to Snake, no audio change.
  const connect = useCallback(() => {
    setPhase("connected");
  }, []);

  // ── startMessage ────────────────────────────────────────────────────────
  // Called when shutter has fully opened: Snake starts speaking.
  const startMessage = useCallback(() => {
    const message = messageRef.current;
    if (!message) return;

    setPhase("playing");

    message.once("end", () => {
      cancelAnimationFrame(rafRef.current);
      setPhase("ended");
    });

    message.play();
    startTracking();
  }, [startTracking]);

  return { phase, currentTime, stopRing, playAccepted, connect, startMessage, unlockAll };
}
