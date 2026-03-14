"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ChallengeId, Screen } from "@/lib/types";

// =============================================================================
// DebugOverlay - Floating panel for desktop testing
// Shows game state and provides quick actions.
// Only rendered when NEXT_PUBLIC_DEBUG=true.
// =============================================================================

type DebugOverlayProps = {
  screen: Screen;
  sessionId: string | null;
  scratchCount: number;
  codesConfirmed: number;
  challengesCompleted: ChallengeId[];
  cardsRemaining: number;
  onForceScreen?: (screen: Screen) => void;
};

export default function DebugOverlay({
  screen,
  sessionId,
  scratchCount,
  codesConfirmed,
  challengesCompleted,
  cardsRemaining,
  onForceScreen,
}: DebugOverlayProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (process.env.NEXT_PUBLIC_DEBUG !== "true") return null;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-2 right-2 z-[99999] bg-bunker-800 border border-terminal text-terminal px-2 py-1 font-mono text-[10px] rounded-[1px]"
      >
        DBG
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-2 right-2 z-[99999]",
        "bg-bunker-900 border border-terminal p-2",
        "font-mono text-[10px] text-terminal",
        "max-w-[200px] rounded-[1px]",
        "shadow-[2px_2px_0px_#0A0A0A]",
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold uppercase">Debug</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-text-dead hover:text-terminal"
        >
          [x]
        </button>
      </div>

      <div className="space-y-0.5 text-[9px]">
        <p>
          Screen: <span className="text-warning">{screen.type}</span>
        </p>
        <p>Session: {sessionId ? sessionId.slice(0, 8) + "..." : "none"}</p>
        <p>Scratches: {scratchCount}</p>
        <p>Confirmed: {codesConfirmed}</p>
        <p>Challenges: [{challengesCompleted.join(",")}]</p>
        <p>Remaining: {cardsRemaining}</p>
      </div>

      {/* Quick screen jumps */}
      {onForceScreen && (
        <div className="mt-1.5 pt-1.5 border-t border-bunker-700">
          <p className="text-text-dead mb-1">Jump to:</p>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { label: "Intro", screen: { type: "intro" } },
                { label: "Wall", screen: { type: "wall" } },
                { label: "Victory", screen: { type: "victory" } },
              ] as { label: string; screen: Screen }[]
            ).map(({ label, screen: targetScreen }) => (
              <button
                key={label}
                onClick={() => onForceScreen(targetScreen)}
                className="bg-bunker-800 border border-bunker-700 px-1 py-0.5 text-[8px] text-text-dim hover:text-terminal hover:border-terminal"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
