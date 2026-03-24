"use client";

// =============================================================================
// IntroScreen - Thin wrapper around CodecCall for the birthday intro sequence.
// Audio: codec ring loop → Snake voice message with synced Spanish subtitles.
// =============================================================================

import { UI } from "@/lib/i18n";
import { CODEC_RING_SRC, CODEC_MESSAGE_SRC, CODEC_SUBTITLE_TIMESTAMPS } from "@/lib/constants";
import type { SubtitleCue } from "@/lib/types";
import { ScanLines, ScreenShell, CodecCall } from "@/components/ui";

type IntroScreenProps = {
  onStart: () => void;
};

/** Subtitle cues zipped from timestamps + i18n strings */
const INTRO_SUBTITLE_CUES: readonly SubtitleCue[] = CODEC_SUBTITLE_TIMESTAMPS.map(
  (time, i) => ({ time, text: UI.introSubtitles[i] }),
);

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <ScreenShell centered className="bg-black">
      <ScanLines />
      <CodecCall
        ringSrc={CODEC_RING_SRC}
        messageSrc={CODEC_MESSAGE_SRC}
        subtitleCues={INTRO_SUBTITLE_CUES}
        actionLabel={UI.introStartButton}
        onAction={onStart}
      />
    </ScreenShell>
  );
}
