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
import { useDebug } from "@/hooks/use-debug";
import { UI } from "@/lib/i18n";
import type { SubtitleCue } from "@/lib/types";
import CodecFrame from "./codec-frame";
import CodecShutter from "./codec-shutter";
import IndustrialButton from "./industrial-button";

type CodecCallProps = {
  /** Audio source for the ringing loop */
  ringSrc: string;
  /** Audio source for the accepted-call beep (plays during shutter transition) */
  acceptedSrc: string;
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
  acceptedSrc,
  messageSrc,
  subtitleCues,
  portraitSrc,
  speakerName,
  actionLabel,
  onAction,
}: CodecCallProps) {
  const { phase, currentTime, stopRing, playAccepted, connect, startMessage } = useCodecAudio({
    ringSrc,
    acceptedSrc,
    messageSrc,
  });
  const { isDebug } = useDebug();

  // Controls the shutter animation (false → true triggers the sequence)
  const [shutterActive, setShutterActive] = useState(false);

  const subtitle = useMemo(
    () => (phase === "playing" ? resolveSubtitle(currentTime, subtitleCues) : null),
    [phase, currentTime, subtitleCues],
  );

  // ── RESPONDER button handler ─────────────────────────────────────────
  const handleAnswer = () => {
    stopRing();
    playAccepted();
    setShutterActive(true);
  };

  // ── DEBUG: skip the entire call sequence ─────────────────────────────
  const handleSkip = () => {
    stopRing();
    onAction();
  };

  // ── Shutter midpoint: screen is black — swap CALL → Snake portrait ───
  const handleShutterMidpoint = () => {
    connect();
  };

  // ── Shutter complete: panels open, Snake visible — start speaking ────
  const handleShutterComplete = () => {
    setShutterActive(false);
    startMessage();
  };

  return (
    <>
      {/* Shutter overlay — portal-like, covers the whole viewport */}
      <CodecShutter
        active={shutterActive}
        onMidpoint={handleShutterMidpoint}
        onComplete={handleShutterComplete}
      />

      <div className="w-full flex-1 min-h-0 flex flex-col items-center gap-4">
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

        {/* Debug skip button — bypasses the entire call sequence */}
        {isDebug && phase !== "ended" && (
          <button
            onClick={handleSkip}
            className="font-mono text-[10px] text-text-dead border border-bunker-700 px-2 py-1 hover:text-terminal hover:border-terminal"
          >
            SKIP CALL &gt;
          </button>
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
