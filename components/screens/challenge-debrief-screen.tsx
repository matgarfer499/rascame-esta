"use client";

// =============================================================================
// ChallengeDebriefScreen - Post-challenge codec call for all 4 challenges.
// After completing a challenge, Snake calls to congratulate the players
// before transitioning to the elimination animation.
// =============================================================================

import { UI } from "@/lib/i18n";
import {
  CODEC_RING_SRC,
  CODEC_ACCEPTED_SRC,
  CHALLENGE_1_DEBRIEF_SRC,
  CHALLENGE_2_DEBRIEF_SRC,
  CHALLENGE_3_DEBRIEF_SRC,
  CHALLENGE_4_DEBRIEF_SRC,
  CHALLENGE_1_DEBRIEF_SUBTITLE_TIMESTAMPS,
  CHALLENGE_2_DEBRIEF_SUBTITLE_TIMESTAMPS,
  CHALLENGE_3_DEBRIEF_SUBTITLE_TIMESTAMPS,
  CHALLENGE_4_DEBRIEF_SUBTITLE_TIMESTAMPS,
} from "@/lib/constants";
import type { SubtitleCue } from "@/lib/types";
import { ScanLines, ScreenShell, CodecCall } from "@/components/ui";

// =============================================================================
// Per-challenge debrief configuration
// =============================================================================

type ChallengeDebriefId = 1 | 2 | 3 | 4;

type ChallengeDebriefConfig = {
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

const CHALLENGE_DEBRIEF_MAP: Record<ChallengeDebriefId, ChallengeDebriefConfig> = {
  1: {
    messageSrc: CHALLENGE_1_DEBRIEF_SRC,
    subtitleCues: buildCues(CHALLENGE_1_DEBRIEF_SUBTITLE_TIMESTAMPS, UI.challenge1DebriefSubtitles),
  },
  2: {
    messageSrc: CHALLENGE_2_DEBRIEF_SRC,
    subtitleCues: buildCues(CHALLENGE_2_DEBRIEF_SUBTITLE_TIMESTAMPS, UI.challenge2DebriefSubtitles),
  },
  3: {
    messageSrc: CHALLENGE_3_DEBRIEF_SRC,
    subtitleCues: buildCues(CHALLENGE_3_DEBRIEF_SUBTITLE_TIMESTAMPS, UI.challenge3DebriefSubtitles),
  },
  4: {
    messageSrc: CHALLENGE_4_DEBRIEF_SRC,
    subtitleCues: buildCues(CHALLENGE_4_DEBRIEF_SUBTITLE_TIMESTAMPS, UI.challenge4DebriefSubtitles),
  },
};

// =============================================================================
// Component
// =============================================================================

type ChallengeDebriefScreenProps = {
  challengeId: ChallengeDebriefId;
  onContinue: () => void;
};

export default function ChallengeDebriefScreen({
  challengeId,
  onContinue,
}: ChallengeDebriefScreenProps) {
  const config = CHALLENGE_DEBRIEF_MAP[challengeId];

  return (
    <ScreenShell className="bg-black h-dvh overflow-hidden flex flex-col items-center">
      <ScanLines />
      <CodecCall
        ringSrc={CODEC_RING_SRC}
        acceptedSrc={CODEC_ACCEPTED_SRC}
        messageSrc={config.messageSrc}
        subtitleCues={config.subtitleCues}
        actionLabel={UI.challengeDebriefAction}
        onAction={onContinue}
      />
    </ScreenShell>
  );
}
