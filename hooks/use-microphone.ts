"use client";

// =============================================================================
// useMicrophone - Reusable hook for Web Audio API microphone volume monitoring
// Returns real-time RMS volume (0-1) from the device microphone.
//
// Mobile compatibility notes:
//   - AudioContext starts "suspended" on mobile; must call resume() after a user gesture.
//   - iOS WebKit exposes webkitAudioContext instead of AudioContext on older versions.
//   - navigator.mediaDevices is only available on HTTPS; guard before calling.
//
// Design notes:
//   - getVolume() reads the AnalyserNode synchronously — no React state pipeline.
//     Use it from setInterval/setTimeout callbacks to avoid stale closure issues.
//   - volume state is updated via rAF loop exclusively for UI display purposes.
// =============================================================================

import { useState, useRef, useCallback, useEffect } from "react";

function resolveAudioContext(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitAudioContext ??
    null
  );
}

type MicrophoneState = {
  /** Current RMS volume (0-1 range) — updated via rAF, for UI display only */
  volume: number;
  /** Whether the microphone is actively listening */
  isListening: boolean;
  /** Whether mic access was denied or errored */
  hasError: boolean;
  /** Start listening to the microphone */
  start: () => Promise<void>;
  /** Stop listening and release resources */
  stop: () => void;
  /**
   * Read the current RMS volume synchronously from the AnalyserNode.
   * Use this inside setInterval/setTimeout callbacks instead of the `volume`
   * state to avoid stale closure issues caused by the React re-render pipeline.
   */
  getVolume: () => number;
};

export default function useMicrophone(): MicrophoneState {
  const [volume, setVolume] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  /** Compute RMS volume synchronously from the AnalyserNode (0-1 range).
   *  Safe to call from any context — returns 0 if the analyser is not ready. */
  const getVolume = useCallback((): number => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!analyser || !dataArray) return 0;

    analyser.getByteTimeDomainData(dataArray);
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    return Math.sqrt(sumSquares / dataArray.length);
  }, []);

  /** Release all audio resources — idempotent */
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setVolume(0);
    setIsListening(false);
  }, []);

  /** Start microphone capture and real-time volume monitoring */
  const start = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasError(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          noiseSuppression: false,
          echoCancellation: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx = resolveAudioContext();
      if (!AudioCtx) {
        setHasError(true);
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      // fftSize 256 → 256 time-domain samples for RMS (not 128 from frequencyBinCount)
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.fftSize);

      setIsListening(true);

      // rAF loop — only for the volume state used by UI meters
      function updateVolume() {
        setVolume(getVolume());
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      }
      updateVolume();
    } catch {
      setHasError(true);
    }
  }, [getVolume]);

  useEffect(() => stop, [stop]);

  return { volume, isListening, hasError, start, stop, getVolume };
}
