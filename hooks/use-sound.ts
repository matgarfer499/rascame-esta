"use client";

// =============================================================================
// useSound - Howler.js-based sound system for game audio
// Manages loading, playing, stopping, fading, and toggling sounds.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

/** All sound effect identifiers used in the game */
export type SoundId =
  | "scratch"
  | "reveal-fake"
  | "reveal-real"
  | "challenge-klaxon"
  | "challenge-complete"
  | "challenge-fail"
  | "elimination"
  | "confirm"
  | "shame"
  | "victory"
  | "button-click"
  | "typewriter-tick"
  | "boss-theme";

/** Sound file configuration: path relative to /public and volume */
type SoundConfig = {
  src: string;
  volume: number;
  /** Loop the sound */
  loop?: boolean;
};

/**
 * Sound file mapping.
 * NOTE: These reference files in public/sounds/ that don't exist yet.
 * The hook gracefully handles missing files (Howler just silently fails).
 * Replace with actual .mp3/.webm files before launch.
 */
const SOUND_CONFIG: Record<SoundId, SoundConfig> = {
  scratch: { src: "/sounds/scratch.mp3", volume: 0.3 },
  "reveal-fake": { src: "/sounds/sad-trombone.mp3", volume: 0.6 },
  "reveal-real": { src: "/sounds/airhorn.mp3", volume: 0.8 },
  "challenge-klaxon": { src: "/sounds/klaxon.mp3", volume: 0.7 },
  "challenge-complete": { src: "/sounds/challenge-complete.mp3", volume: 0.6 },
  "challenge-fail": { src: "/sounds/fart.mp3", volume: 0.7 },
  elimination: { src: "/sounds/mission-accomplished.mp3", volume: 0.4 },
  confirm: { src: "/sounds/confirm.mp3", volume: 0.5 },
  shame: { src: "/sounds/shame.mp3", volume: 0.5 },
  victory: { src: "/sounds/victory.mp3", volume: 0.7 },
  "button-click": { src: "/sounds/click.mp3", volume: 0.2 },
  "typewriter-tick": { src: "/sounds/tick.mp3", volume: 0.1, loop: false },
  "boss-theme": { src: "/sounds/Duel-Boss-Battle-Theme.mp3", volume: 0.3, loop: true },
};

export function useSound() {
  const [muted, setMuted] = useState(false);
  const howlsRef = useRef<Map<SoundId, Howl>>(new Map());
  const initializedRef = useRef(false);

  /** Lazily initialize all Howl instances */
  const ensureInitialized = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    for (const [id, config] of Object.entries(SOUND_CONFIG)) {
      const howl = new Howl({
        src: [config.src],
        volume: config.volume,
        loop: config.loop ?? false,
        preload: true,
        html5: true, // Better for mobile
      });
      howlsRef.current.set(id as SoundId, howl);
    }
  }, []);

  /** Play a sound effect */
  const play = useCallback(
    (id: SoundId) => {
      if (muted) return;
      ensureInitialized();
      const howl = howlsRef.current.get(id);
      howl?.play();
    },
    [muted, ensureInitialized],
  );

  /** Stop a specific sound */
  const stop = useCallback((id: SoundId) => {
    const howl = howlsRef.current.get(id);
    howl?.stop();
  }, []);

  /** Stop all sounds */
  const stopAll = useCallback(() => {
    for (const howl of howlsRef.current.values()) {
      howl.stop();
    }
  }, []);

  /** Pause a specific sound */
  const pause = useCallback((id: SoundId) => {
    const howl = howlsRef.current.get(id);
    howl?.pause();
  }, []);

  /** Resume a paused sound */
  const resume = useCallback(
    (id: SoundId) => {
      if (muted) return;
      const howl = howlsRef.current.get(id);
      howl?.play();
    },
    [muted],
  );

  /**
   * Fade out a sound over `durationMs` milliseconds, then pause it.
   * Uses Howler's native fade() which handles the animation internally.
   */
  const fadeOut = useCallback((id: SoundId, durationMs: number) => {
    const howl = howlsRef.current.get(id);
    if (!howl) return;
    const targetVolume = SOUND_CONFIG[id].volume;
    howl.fade(targetVolume, 0, durationMs);
    // Pause once the fade completes
    const timer = setTimeout(() => {
      howl.pause();
    }, durationMs);
    // Attach a one-time fade event listener as a backup (Howler fires "fade" when done)
    howl.once("fade", () => {
      clearTimeout(timer);
      // Only pause if the volume actually reached 0 (not an incoming fade-in)
      if (howl.volume() === 0) howl.pause();
    });
  }, []);

  /**
   * Resume a paused sound and fade it in over `durationMs` milliseconds.
   * Starts from volume 0 and ramps up to the configured volume.
   */
  const fadeIn = useCallback(
    (id: SoundId, durationMs: number) => {
      if (muted) return;
      const howl = howlsRef.current.get(id);
      if (!howl) return;
      const targetVolume = SOUND_CONFIG[id].volume;
      howl.volume(0);
      howl.play();
      howl.fade(0, targetVolume, durationMs);
    },
    [muted],
  );

  /** Toggle mute */
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const newMuted = !prev;
      // Apply to all Howl instances
      for (const howl of howlsRef.current.values()) {
        howl.mute(newMuted);
      }
      return newMuted;
    });
  }, []);

  // Cleanup all Howl instances on unmount
  useEffect(() => {
    return () => {
      for (const howl of howlsRef.current.values()) {
        howl.unload();
      }
      howlsRef.current.clear();
      // Reset so the next mount (e.g. React Strict Mode double-invoke) can
      // re-initialize the Howl instances from scratch.
      initializedRef.current = false;
    };
  }, []);

  return {
    play,
    stop,
    stopAll,
    pause,
    resume,
    fadeOut,
    fadeIn,
    muted,
    toggleMute,
  };
}
