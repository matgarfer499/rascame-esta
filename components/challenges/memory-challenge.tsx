"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n";
import {
  MEMORY_ROUNDS,
  MEMORY_INITIAL_SEQUENCE_LENGTH,
  MEMORY_SEQUENCE_INCREMENT,
  MEMORY_FLASH_DURATION_MS,
  MEMORY_FLASH_SPEED_DECAY_MS,
  MEMORY_MAX_ATTEMPTS,
  MEMORY_TROLL_ROUND,
  MEMORY_TROLL_SEQUENCE_LENGTH,
  MEMORY_TROLL_FLASH_DURATION_MS,
  MEMORY_TROLL_GAP_MS,
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
// Rounds 1-4 get progressively harder (more tiles, faster flashes).
// Players have 3 total attempts; a wrong tap on the same round retries it.
// Round 5 is an impossible troll round that auto-completes on any failure.
// =============================================================================

type MemoryChallengeProps = {
  onComplete: () => void;
  onFail: () => void;
};

type Phase = "showing" | "input" | "round-result" | "troll-fail" | "done";

/** Returns flash duration (ms) for a given round number. */
function getFlashDuration(roundNum: number): number {
  if (roundNum === MEMORY_TROLL_ROUND) return MEMORY_TROLL_FLASH_DURATION_MS;
  return Math.max(
    150,
    MEMORY_FLASH_DURATION_MS - (roundNum - 1) * MEMORY_FLASH_SPEED_DECAY_MS,
  );
}

export default function MemoryChallenge({
  onComplete,
  onFail,
}: MemoryChallengeProps) {
  const tiles = useMemo<MemoryTile[]>(
    () => shuffle([...MEMORY_TILES]).slice(0, 9),
    [],
  );

  const [round, setRound] = useState(1);
  const [attempts, setAttempts] = useState(MEMORY_MAX_ATTEMPTS);
  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeTileId, setActiveTileId] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<"correct" | "wrong" | null>(null);

  // Refs that always hold the latest values — prevents stale closures in
  // async showSequence and setTimeout callbacks.
  const isProcessingRef = useRef(false);
  const roundRef = useRef(round);
  const attemptsRef = useRef(attempts);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { attemptsRef.current = attempts; }, [attempts]);

  /** Generate a sequence for the given round. */
  const generateSequence = useCallback(
    (roundNum: number): number[] => {
      const length =
        roundNum === MEMORY_TROLL_ROUND
          ? MEMORY_TROLL_SEQUENCE_LENGTH
          : MEMORY_INITIAL_SEQUENCE_LENGTH +
            (roundNum - 1) * MEMORY_SEQUENCE_INCREMENT;

      const seq: number[] = [];
      for (let i = 0; i < length; i++) {
        seq.push(tiles[Math.floor(Math.random() * tiles.length)].id);
      }
      return seq;
    },
    [tiles],
  );

  /** Flash the sequence at the speed appropriate for the round. */
  const showSequence = useCallback(
    async (seq: number[], roundNum: number) => {
      setPhase("showing");
      await delay(500);

      const flashDuration = getFlashDuration(roundNum);
      const gapDuration =
        roundNum === MEMORY_TROLL_ROUND ? MEMORY_TROLL_GAP_MS : 200;

      for (const tileId of seq) {
        setActiveTileId(tileId);
        await delay(flashDuration);
        setActiveTileId(null);
        await delay(gapDuration);
      }

      setPhase("input");
    },
    [],
  );

  /** Start (or restart) a round. */
  const startRound = useCallback(
    (roundNum: number) => {
      const seq = generateSequence(roundNum);
      setSequence(seq);
      setPlayerInput([]);
      setRoundResult(null);
      showSequence(seq, roundNum);
    },
    [generateSequence, showSequence],
  );

  // Mount: start round 1
  useEffect(() => {
    startRound(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Player taps a tile. */
  const handleTileTap = useCallback(
    (tileId: number) => {
      if (phase !== "input" || isProcessingRef.current) return;

      const newInput = [...playerInput, tileId];
      setPlayerInput(newInput);

      // Brief visual feedback on the tapped tile
      setActiveTileId(tileId);
      setTimeout(() => setActiveTileId(null), 200);

      const inputIndex = newInput.length - 1;

      if (newInput[inputIndex] !== sequence[inputIndex]) {
        // Wrong tap
        isProcessingRef.current = true;
        setRoundResult("wrong");

        // Use ref to read current round — avoids stale closure from async
        // showSequence still running during round transitions.
        if (roundRef.current === MEMORY_TROLL_ROUND) {
          // Troll round: always show the reveal message then auto-complete
          setPhase("troll-fail");
          setTimeout(() => {
            isProcessingRef.current = false;
            setPhase("done");
            onComplete();
          }, 4000);
        } else {
          setPhase("round-result");
          const remainingAttempts = attemptsRef.current - 1;
          setAttempts(remainingAttempts);

          setTimeout(() => {
            isProcessingRef.current = false;
            if (remainingAttempts <= 0) {
              onFail();
            } else {
              // Retry the same round with a new random sequence
              startRound(roundRef.current);
            }
          }, 1500);
        }
        return;
      }

      // Correct tap — check if the full sequence is done
      if (newInput.length === sequence.length) {
        isProcessingRef.current = true;
        setRoundResult("correct");
        setPhase("round-result");

        setTimeout(() => {
          isProcessingRef.current = false;

          if (roundRef.current >= MEMORY_ROUNDS) {
            setPhase("done");
            onComplete();
          } else {
            const nextRound = roundRef.current + 1;
            setRound(nextRound);
            startRound(nextRound);
          }
        }, 1500);
      }
    },
    [phase, playerInput, sequence, startRound, onComplete, onFail],
  );

  // -------------------------------------------------------------------------
  // Troll-fail screen — full override, shown for 4 seconds then auto-completes
  // -------------------------------------------------------------------------
  if (phase === "troll-fail") {
    return (
      <ScreenShell centered>
        <ScanLines />
        <div className="w-full max-w-sm flex flex-col items-center gap-6 px-4">
          <p className="font-condensed text-3xl text-alert uppercase tracking-widest text-center animate-[pulse-alert_500ms_step-end_infinite]">
            SECUENCIA INCORRECTA
          </p>
          <div className="border-2 border-warning p-4 w-full">
            <p className="font-mono text-sm text-warning text-center leading-relaxed">
              {UI.memoryTrollMessage}
            </p>
          </div>
          <p className="font-mono text-xs text-text-dim text-center">
            DESAFÍO COMPLETADO...
          </p>
        </div>
      </ScreenShell>
    );
  }

  const isTrollRound = round === MEMORY_TROLL_ROUND;

  return (
    <ScreenShell centered>
      <ScanLines />

      <div className="w-full max-w-sm">
        {/* Header: title + round counter */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-condensed text-2xl text-warning uppercase tracking-wider">
            {UI.memoryTitle}
          </h2>
          <span className="font-mono text-sm text-text-dim">
            {isTrollRound
              ? UI.memoryTrollRoundLabel
              : `${UI.memoryRound} ${round}/${MEMORY_ROUNDS}`}
          </span>
        </div>

        {/* Attempts indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] text-text-dim uppercase">
            {UI.memoryAttempts}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: MEMORY_MAX_ATTEMPTS }).map((_, i) => {
              const used = i >= attempts;
              return (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 border-2",
                    used
                      ? "border-bunker-600 bg-transparent"
                      : "border-terminal bg-terminal",
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Sequence progress bar (input phase only) */}
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
            {isTrollRound
              ? "¡ÚLTIMA RONDA! MÁXIMA CONCENTRACIÓN..."
              : "OBSERVA LA SECUENCIA..."}
          </p>
        )}

        {phase === "input" && (
          <p className="text-terminal text-xs font-mono text-center mb-4">
            REPITE LA SECUENCIA ({playerInput.length}/{sequence.length})
          </p>
        )}

        {/* Round result feedback */}
        {phase === "round-result" && roundResult && (
          <p
            className={cn(
              "text-xs font-mono text-center mb-4 font-bold",
              roundResult === "correct" ? "text-terminal" : "text-alert",
            )}
          >
            {roundResult === "correct" ? "¡CORRECTO!" : "SECUENCIA INCORRECTA"}
          </p>
        )}

        {/* Tile grid (3×3) */}
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
                  !isActive && "bg-bunker-800 border-bunker-700 text-text-dim",
                  isActive && "bg-warning border-warning text-bunker-950",
                  isInputPhase &&
                    !isActive &&
                    "cursor-pointer hover:border-bunker-500 active:bg-bunker-700",
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
