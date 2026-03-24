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
//   1. Tap RESPONDER → stopRing() + playAccepted() + trigger shutter
//   2. Shutter midpoint → connect()        (swaps CALL→portrait, silent)
//   3. Shutter complete → startMessage()   (Snake starts speaking)
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

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

  // ── Mount: create all three Howls and start ring loop ──────────────────
  useEffect(() => {
    const { ringSrc, acceptedSrc, messageSrc } = configRef.current;

    ringRef.current = new Howl({
      src: [ringSrc],
      loop: true,
      volume: 0.7,
      html5: true,
    });

    acceptedRef.current = new Howl({
      src: [acceptedSrc],
      volume: 1.0,
      html5: true,
    });

    messageRef.current = new Howl({
      src: [messageSrc],
      volume: 1.0,
      html5: true,
    });

    // Autoplay — queued silently until first user gesture unlocks AudioContext
    ringRef.current.play();

    return () => {
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

  // ── stopRing ────────────────────────────────────────────────────────────
  const stopRing = useCallback(() => {
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

  return { phase, currentTime, stopRing, playAccepted, connect, startMessage };
}
