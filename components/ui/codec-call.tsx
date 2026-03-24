"use client";

// =============================================================================
// CodecCall - Reusable MGS-style codec call orchestrator
//
// Wires together:
//   useCodecAudio  — audio playback and phase management
//   CodecFrame     — visual UI (portrait, EQ, frequency, subtitles)
//   CodecShutter   — black shutter transition when answering the call
//
// Usage:
//   <CodecCall
//     ringSrc="/sounds/codec-sound.mp3"
//     messageSrc="/sounds/intro-message.mp3"
//     subtitleCues={INTRO_SUBTITLE_CUES}
//     actionLabel={UI.introStartButton}
//     onAction={() => goToWall()}
//   />
// =============================================================================

import { useMemo, useState } from "react";
import { useCodecAudio } from "@/hooks/use-codec-audio";
import { UI } from "@/lib/i18n";
import type { SubtitleCue } from "@/lib/types";
import CodecFrame from "./codec-frame";
import CodecShutter from "./codec-shutter";
import IndustrialButton from "./industrial-button";

type CodecCallProps = {
  /** Audio source for the ringing loop */
  ringSrc: string;
  /** Audio source for the voice message */
  messageSrc: string;
  /** Subtitle cues (time + text) synced to messageSrc */
  subtitleCues: readonly SubtitleCue[];
  /** Portrait image. Defaults to /snake.webp */
  portraitSrc?: string;
  /** Speaker name beside VU meter. Defaults to UI.codecSpeaker */
  speakerName?: string;
  /** Label for the call-to-action button shown when transmission ends */
  actionLabel: string;
  /** Called when the player taps the action button */
  onAction: () => void;
};

/**
 * Resolve the active subtitle for a given playback position.
 * Returns the text of the last cue whose time has been reached, or null.
 */
function resolveSubtitle(
  currentTime: number,
  cues: readonly SubtitleCue[],
): string | null {
  for (let i = cues.length - 1; i >= 0; i--) {
    if (currentTime >= cues[i].time) return cues[i].text;
  }
  return null;
}

export default function CodecCall({
  ringSrc,
  messageSrc,
  subtitleCues,
  portraitSrc,
  speakerName,
  actionLabel,
  onAction,
}: CodecCallProps) {
  const { phase, currentTime, stopRing, startMessage } = useCodecAudio({
    ringSrc,
    messageSrc,
  });

  // Controls the shutter animation (false → true triggers the sequence)
  const [shutterActive, setShutterActive] = useState(false);

  const subtitle = useMemo(
    () => (phase === "playing" ? resolveSubtitle(currentTime, subtitleCues) : null),
    [phase, currentTime, subtitleCues],
  );

  // ── RESPONDER button handler ─────────────────────────────────────────
  const handleAnswer = () => {
    stopRing();
    setShutterActive(true);
  };

  // ── Shutter midpoint: swap content (ring → message) ─────────────────
  const handleShutterMidpoint = () => {
    startMessage();
  };

  // ── Shutter complete: panels are fully open, reset trigger ──────────
  const handleShutterComplete = () => {
    setShutterActive(false);
  };

  return (
    <>
      {/* Shutter overlay — portal-like, covers the whole viewport */}
      <CodecShutter
        active={shutterActive}
        onMidpoint={handleShutterMidpoint}
        onComplete={handleShutterComplete}
      />

      <div className="w-full flex flex-col items-center gap-6">
        <CodecFrame
          phase={phase}
          subtitle={subtitle}
          portraitSrc={portraitSrc}
          speakerName={speakerName}
        />

        {/* Answer button — only shown while ringing */}
        {phase === "ringing" && (
          <IndustrialButton variant="danger" onClick={handleAnswer}>
            {UI.codecAnswerCall}
          </IndustrialButton>
        )}

        {/* Action button — shown after transmission ends */}
        {phase === "ended" && (
          <div className="origin-top animate-[shutter-close_200ms_step-end_forwards]">
            <IndustrialButton variant="danger" fullWidth onClick={onAction}>
              {actionLabel}
            </IndustrialButton>
          </div>
        )}
      </div>
    </>
  );
}
