"use client";

// =============================================================================
// useCodecAudio - Manages the MGS-style codec audio sequence
//
// API:
//   - Ring starts automatically on mount (loop). No idle phase.
//   - stopRing()    — stops the ringing loop (call before shutter transition)
//   - startMessage() — begins the voice message, starts rAF time tracking
//   - phase: "ringing" | "playing" | "ended"
//   - currentTime: seconds into the message audio (for subtitle sync)
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

/** Phases of the codec audio sequence (no idle — ring starts on mount) */
export type CodecPhase = "ringing" | "playing" | "ended";

type CodecAudioConfig = {
  ringSrc: string;
  messageSrc: string;
};

type UseCodecAudioReturn = {
  phase: CodecPhase;
  /** Current playback time of the message audio (seconds) */
  currentTime: number;
  /** Stop the ringing loop (call just before the shutter transition) */
  stopRing: () => void;
  /** Begin the voice message (call at shutter midpoint) */
  startMessage: () => void;
};

export function useCodecAudio(config: CodecAudioConfig): UseCodecAudioReturn {
  const [phase, setPhase] = useState<CodecPhase>("ringing");
  const [currentTime, setCurrentTime] = useState(0);

  // Freeze the config so the mount effect doesn't re-run if parent re-renders
  const configRef = useRef(config);

  const ringRef    = useRef<Howl | null>(null);
  const messageRef = useRef<Howl | null>(null);
  const rafRef     = useRef<number>(0);

  // ── Mount: create Howls and start ring loop ─────────────────────────────
  useEffect(() => {
    const { ringSrc, messageSrc } = configRef.current;

    ringRef.current = new Howl({
      src: [ringSrc],
      loop: true,
      volume: 0.7,
      html5: true,
    });

    messageRef.current = new Howl({
      src: [messageSrc],
      volume: 1.0,
      html5: true,
    });

    // Autoplay — will queue silently until a user gesture unlocks AudioContext
    ringRef.current.play();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ringRef.current?.unload();
      messageRef.current?.unload();
    };
  }, []); // intentionally empty — config is read via ref

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

  // ── startMessage ────────────────────────────────────────────────────────
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

  return { phase, currentTime, stopRing, startMessage };
}
