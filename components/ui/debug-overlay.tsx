"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ChallengeId, Screen } from "@/lib/types";
import { DEBUG_CHALLENGE_LABELS } from "@/hooks/use-debug";

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

const SCREEN_JUMPS: { label: string; screen: Screen }[] = [
  { label: "Intro", screen: { type: "intro" } },
  { label: "Wall", screen: { type: "wall" } },
  { label: "Victory", screen: { type: "victory" } },
];

const CHALLENGE_IDS: ChallengeId[] = [1, 2, 3, 4];

const jumpButtonClass =
  "bg-bunker-800 border border-bunker-700 px-1 py-0.5 text-[8px] text-text-dim hover:text-terminal hover:border-terminal";

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

      {onForceScreen && (
        <>
          {/* Screen jumps */}
          <div className="mt-1.5 pt-1.5 border-t border-bunker-700">
            <p className="text-text-dead mb-1">Screens:</p>
            <div className="flex flex-wrap gap-1">
              {SCREEN_JUMPS.map(({ label, screen: target }) => (
                <button
                  key={label}
                  onClick={() => onForceScreen(target)}
                  className={jumpButtonClass}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Challenge jumps */}
          <div className="mt-1.5 pt-1.5 border-t border-bunker-700">
            <p className="text-text-dead mb-1">Challenges:</p>
            <div className="grid grid-cols-2 gap-1">
              {CHALLENGE_IDS.map((id) => (
                <div key={id} className="flex gap-1">
                  <button
                    onClick={() =>
                      onForceScreen({ type: "challenge-intro", challengeId: id })
                    }
                    className={cn(jumpButtonClass, "flex-1")}
                    title={`${DEBUG_CHALLENGE_LABELS[id]} intro screen`}
                  >
                    {DEBUG_CHALLENGE_LABELS[id]} ⓘ
                  </button>
                  <button
                    onClick={() =>
                      onForceScreen({ type: "challenge", challengeId: id })
                    }
                    className={cn(
                      jumpButtonClass,
                      "flex-1 text-warning hover:text-warning hover:border-warning",
                    )}
                    title={`${DEBUG_CHALLENGE_LABELS[id]} gameplay directly`}
                  >
                    ▸
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
