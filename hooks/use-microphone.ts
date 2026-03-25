"use client";

// =============================================================================
// useMicrophone - Reusable hook for Web Audio API microphone volume monitoring
// Returns real-time RMS volume (0-1) from the device microphone.
// =============================================================================

import { useState, useRef, useCallback, useEffect } from "react";

type MicrophoneState = {
  /** Current RMS volume (0-1 range) */
  volume: number;
  /** Whether the microphone is actively listening */
  isListening: boolean;
  /** Whether mic access was denied or errored */
  hasError: boolean;
  /** Start listening to the microphone */
  start: () => Promise<void>;
  /** Stop listening and release resources */
  stop: () => void;
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

  /** Compute RMS volume from time-domain analyser data (0-1 range) */
  const computeRms = useCallback((): number => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsListening(true);

      // Continuous volume monitoring via rAF
      function updateVolume() {
        const rms = computeRms();
        setVolume(rms);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      }
      updateVolume();
    } catch {
      setHasError(true);
    }
  }, [computeRms]);

  // Cleanup on unmount
  useEffect(() => stop, [stop]);

  return { volume, isListening, hasError, start, stop };
}
