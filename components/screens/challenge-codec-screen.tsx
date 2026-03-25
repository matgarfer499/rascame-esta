"use client";

// =============================================================================
// ChallengeCodecScreen - Codec call briefing for all 4 challenges.
// Full MGS-style codec sequence where Snake explains the challenge via
// voice + subtitles before the player accepts.
// =============================================================================

import { UI } from "@/lib/i18n";
import {
  CODEC_RING_SRC,
  CODEC_ACCEPTED_SRC,
  CHALLENGE_1_MESSAGE_SRC,
  CHALLENGE_2_MESSAGE_SRC,
  CHALLENGE_3_MESSAGE_SRC,
  CHALLENGE_4_MESSAGE_SRC,
  CHALLENGE_1_SUBTITLE_TIMESTAMPS,
  CHALLENGE_2_SUBTITLE_TIMESTAMPS,
  CHALLENGE_3_SUBTITLE_TIMESTAMPS,
  CHALLENGE_4_SUBTITLE_TIMESTAMPS,
} from "@/lib/constants";
import type { SubtitleCue } from "@/lib/types";
import { ScanLines, ScreenShell, CodecCall } from "@/components/ui";

// =============================================================================
// Per-challenge codec configuration
// =============================================================================

type ChallengeCodecId = 1 | 2 | 3 | 4;

type ChallengeCodecConfig = {
  messageSrc: string;
  subtitleCues: readonly SubtitleCue[];
};

/** Build subtitle cues by zipping timestamps with i18n strings */
function buildCues(
  timestamps: readonly number[],
  subtitles: readonly string[],
): readonly SubtitleCue[] {
  return timestamps.map((time, i) => ({ time, text: subtitles[i] }));
}

const CHALLENGE_CODEC_MAP: Record<ChallengeCodecId, ChallengeCodecConfig> = {
  1: {
    messageSrc: CHALLENGE_1_MESSAGE_SRC,
    subtitleCues: buildCues(CHALLENGE_1_SUBTITLE_TIMESTAMPS, UI.challenge1Subtitles),
  },
  2: {
    messageSrc: CHALLENGE_2_MESSAGE_SRC,
    subtitleCues: buildCues(CHALLENGE_2_SUBTITLE_TIMESTAMPS, UI.challenge2Subtitles),
  },
  3: {
    messageSrc: CHALLENGE_3_MESSAGE_SRC,
    subtitleCues: buildCues(CHALLENGE_3_SUBTITLE_TIMESTAMPS, UI.challenge3Subtitles),
  },
  4: {
    messageSrc: CHALLENGE_4_MESSAGE_SRC,
    subtitleCues: buildCues(CHALLENGE_4_SUBTITLE_TIMESTAMPS, UI.challenge4Subtitles),
  },
};

// =============================================================================
// Component
// =============================================================================

type ChallengeCodecScreenProps = {
  challengeId: ChallengeCodecId;
  onAccept: () => void;
};

export default function ChallengeCodecScreen({
  challengeId,
  onAccept,
}: ChallengeCodecScreenProps) {
  const config = CHALLENGE_CODEC_MAP[challengeId];

  return (
    <ScreenShell className="bg-black h-dvh overflow-hidden flex flex-col items-center">
      <ScanLines />
      <CodecCall
        ringSrc={CODEC_RING_SRC}
        acceptedSrc={CODEC_ACCEPTED_SRC}
        messageSrc={config.messageSrc}
        subtitleCues={config.subtitleCues}
        actionLabel={UI.challengeAccept}
        onAction={onAccept}
      />
    </ScreenShell>
  );
}
