"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import { SHAME_TIMER_SECONDS } from "@/lib/constants";
import { ScreenShell, ScanLines, Timer } from "@/components/ui";

// =============================================================================
// ShameScreen - Punishment timer shown after failing a challenge
// Displays rotating insult messages. No real progress lost.
// =============================================================================

type ShameScreenProps = {
  seconds?: number;
  onComplete: () => void;
};

export default function ShameScreen({
  seconds = SHAME_TIMER_SECONDS,
  onComplete,
}: ShameScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = UI.shameMessages;

  // Rotate shame messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm text-center">
        <h2
          className={cn(
            "font-condensed text-2xl text-alert uppercase tracking-wider mb-6",
            "animate-[pulse-alert_500ms_step-end_infinite]",
          )}
        >
          {UI.shamePenalty}
        </h2>

        {/* Rotating insult */}
        <p className="font-mono text-sm text-warning mb-8 min-h-[3rem]">
          &quot;{messages[messageIndex]}&quot;
        </p>

        {/* Countdown */}
        <div className="mb-4">
          <p className="text-text-dead text-xs font-mono uppercase mb-2">
            {UI.shameRetry}
          </p>
          <Timer
            initialSeconds={seconds}
            mode="countdown"
            variant="alert"
            large
            onComplete={onComplete}
          />
        </div>
      </div>
    </ScreenShell>
  );
}
