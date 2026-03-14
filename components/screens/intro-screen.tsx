"use client";

import { useState } from "react";
import { UI } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { IndustrialButton, TypeWriter, ScreenShell, ScanLines } from "@/components/ui";

// =============================================================================
// IntroScreen - Opening transmission with typewriter effect
// Flow: header types out → message types out → button appears
// =============================================================================

type IntroScreenProps = {
  onStart: () => void;
};

/** Lines to type before the personal message */
const HEADER_LINES = [
  UI.introTransmission,
  "",
  UI.introSender + " " + UI.introSenderName,
  UI.introRecipients,
  "",
] as const;

/** Personal message lines (from i18n placeholders) */
const MESSAGE_LINES = UI.introMessage;

/** Closing line */
const FOOTER_LINES = [
  "",
  UI.introEndTransmission,
] as const;

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [phase, setPhase] = useState<"header" | "message" | "footer" | "ready">(
    "header",
  );

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* App title — always visible */}
        <h1
          className={cn(
            "font-condensed text-5xl text-alert tracking-wider",
            "border-b-2 border-bunker-700 pb-2 mb-6",
            "text-left",
          )}
        >
          {UI.appName}
        </h1>

        {/* Header transmission lines */}
        <TypeWriter
          lines={[...HEADER_LINES]}
          charDelay={25}
          lineDelay={300}
          showCursor={phase === "header"}
          onComplete={() => setPhase("message")}
          className="mb-2"
          lineClassName="leading-relaxed"
        />

        {/* Personal message */}
        {(phase === "message" || phase === "footer" || phase === "ready") && (
          <TypeWriter
            lines={[...MESSAGE_LINES]}
            charDelay={30}
            lineDelay={200}
            showCursor={phase === "message"}
            onComplete={() => setPhase("footer")}
            className="mb-2 border-l-2 border-warning pl-3"
            lineClassName="text-warning leading-relaxed"
          />
        )}

        {/* Footer */}
        {(phase === "footer" || phase === "ready") && (
          <TypeWriter
            lines={[...FOOTER_LINES]}
            charDelay={25}
            lineDelay={300}
            showCursor={phase === "footer"}
            onComplete={() => setPhase("ready")}
            className="mb-8"
            lineClassName="leading-relaxed"
          />
        )}

        {/* Start button — appears with a mechanical shutter */}
        {phase === "ready" && (
          <div
            className="origin-top animate-[shutter-close_200ms_step-end_forwards]"
          >
            <IndustrialButton
              variant="danger"
              fullWidth
              onClick={onStart}
            >
              {UI.introStartButton}
            </IndustrialButton>

            <p className="text-text-dead text-[10px] text-center mt-3 font-mono uppercase">
              {UI.operationSubtitle}
            </p>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}
