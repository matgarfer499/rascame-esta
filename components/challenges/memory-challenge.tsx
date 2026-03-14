"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  MEMORY_ROUNDS,
  MEMORY_INITIAL_SEQUENCE_LENGTH,
  MEMORY_SEQUENCE_INCREMENT,
  MEMORY_FLASH_DURATION_MS,
} from "@/lib/constants";
import { shuffle, delay } from "@/lib/utils";
import { MEMORY_TILES } from "@/lib/content";
import type { MemoryTile } from "@/lib/types";
import {
  ScreenShell,
  ScanLines,
  ProgressBar,
} from "@/components/ui";

// =============================================================================
// MemoryChallenge - Sequence memory game with inside joke tiles
// Players must repeat a flashing sequence. Rounds get progressively harder.
// =============================================================================

type MemoryChallengeProps = {
  onComplete: () => void;
  onFail: () => void;
};

type Phase = "showing" | "input" | "round-result" | "done";

export default function MemoryChallenge({
  onComplete,
  onFail,
}: MemoryChallengeProps) {
  // Use 9 tiles shuffled
  const tiles = useMemo(() => shuffle([...MEMORY_TILES]).slice(0, 9), []);

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeTileId, setActiveTileId] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<"correct" | "wrong" | null>(null);
  const isProcessingRef = useRef(false);

  /** Generate a sequence for the current round */
  const generateSequence = useCallback(
    (roundNum: number): number[] => {
      const length =
        MEMORY_INITIAL_SEQUENCE_LENGTH +
        (roundNum - 1) * MEMORY_SEQUENCE_INCREMENT;
      const seq: number[] = [];
      for (let i = 0; i < length; i++) {
        const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
        seq.push(randomTile.id);
      }
      return seq;
    },
    [tiles],
  );

  /** Flash the sequence to the player */
  const showSequence = useCallback(
    async (seq: number[]) => {
      setPhase("showing");
      await delay(500); // Brief pause before starting

      for (const tileId of seq) {
        setActiveTileId(tileId);
        await delay(MEMORY_FLASH_DURATION_MS);
        setActiveTileId(null);
        await delay(200); // Gap between flashes
      }

      setPhase("input");
    },
    [],
  );

  /** Start a round */
  const startRound = useCallback(
    (roundNum: number) => {
      const seq = generateSequence(roundNum);
      setSequence(seq);
      setPlayerInput([]);
      setRoundResult(null);
      showSequence(seq);
    },
    [generateSequence, showSequence],
  );

  // Start first round on mount
  useEffect(() => {
    startRound(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Player taps a tile */
  const handleTileTap = useCallback(
    (tileId: number) => {
      if (phase !== "input" || isProcessingRef.current) return;

      const newInput = [...playerInput, tileId];
      setPlayerInput(newInput);

      // Flash the tapped tile briefly
      setActiveTileId(tileId);
      setTimeout(() => setActiveTileId(null), 200);

      const inputIndex = newInput.length - 1;

      // Check if this tap matches the sequence
      if (newInput[inputIndex] !== sequence[inputIndex]) {
        // Wrong!
        isProcessingRef.current = true;
        setRoundResult("wrong");
        setPhase("round-result");

        setTimeout(() => {
          isProcessingRef.current = false;
          onFail();
        }, 1500);
        return;
      }

      // Check if sequence is complete
      if (newInput.length === sequence.length) {
        isProcessingRef.current = true;
        setRoundResult("correct");
        setPhase("round-result");

        setTimeout(() => {
          isProcessingRef.current = false;

          if (round >= MEMORY_ROUNDS) {
            // All rounds passed!
            setPhase("done");
            onComplete();
          } else {
            // Next round
            const nextRound = round + 1;
            setRound(nextRound);
            startRound(nextRound);
          }
        }, 1500);
      }
    },
    [phase, playerInput, sequence, round, startRound, onComplete, onFail],
  );

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-condensed text-2xl text-warning uppercase tracking-wider">
            {UI.memoryTitle}
          </h2>
          <span className="font-mono text-sm text-text-dim">
            {UI.memoryRound} {round}/{MEMORY_ROUNDS}
          </span>
        </div>

        {/* Sequence progress */}
        {phase === "input" && (
          <div className="mb-4">
            <ProgressBar
              value={playerInput.length / sequence.length}
              variant="terminal"
              showLabel
              height="h-3"
            />
          </div>
        )}

        {/* Phase indicator */}
        {phase === "showing" && (
          <p className="text-warning text-xs font-mono text-center mb-4 animate-[pulse-alert_500ms_step-end_infinite]">
            OBSERVA LA SECUENCIA...
          </p>
        )}

        {phase === "input" && (
          <p className="text-terminal text-xs font-mono text-center mb-4">
            REPITE LA SECUENCIA ({playerInput.length}/{sequence.length})
          </p>
        )}

        {/* Round result */}
        {phase === "round-result" && roundResult && (
          <p
            className={cn(
              "text-xs font-mono text-center mb-4 font-bold",
              roundResult === "correct" ? "text-terminal" : "text-alert",
            )}
          >
            {roundResult === "correct"
              ? "¡CORRECTO!"
              : "SECUENCIA INCORRECTA"}
          </p>
        )}

        {/* Tile grid (3x3) */}
        <div className="grid grid-cols-3 gap-2">
          {tiles.map((tile) => {
            const isActive = activeTileId === tile.id;
            const isInputPhase = phase === "input";

            return (
              <button
                key={tile.id}
                type="button"
                disabled={!isInputPhase}
                onClick={() => handleTileTap(tile.id)}
                className={cn(
                  "aspect-square p-2",
                  "border-2 rounded-[1px]",
                  "flex items-center justify-center",
                  "font-mono text-[10px] text-center leading-tight",
                  "transition-all duration-[100ms] ease-linear",
                  // Default state
                  !isActive && "bg-bunker-800 border-bunker-700 text-text-dim",
                  // Active (flashing)
                  isActive && "bg-warning border-warning text-bunker-950",
                  // Interactive
                  isInputPhase &&
                    !isActive &&
                    "cursor-pointer hover:border-bunker-500 active:bg-bunker-700",
                  // Disabled
                  !isInputPhase && !isActive && "opacity-50",
                )}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      </div>
    </ScreenShell>
  );
}
