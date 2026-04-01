"use client";

// =============================================================================
// GameOrchestrator - Main game controller that manages screen routing
// and wires up all Server Actions to client state.
// =============================================================================

import { useCallback, useEffect, useState, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import type { ChallengeId, Screen } from "@/lib/types";
import { CHALLENGES } from "@/lib/constants";
import {
  startGame,
  scratchCard as scratchCardAction,
  confirmCode as confirmCodeAction,
  completeChallenge as completeChallengeAction,
  getGameState,
  resetGame,
} from "@/app/actions/game-actions";

// Screens
import { IntroScreen } from "@/components/screens";
import { ResumeScreen } from "@/components/screens";
import { VictoryScreen } from "@/components/screens";
import { AccessDeniedScreen } from "@/components/screens";
import { EliminationScreen } from "@/components/screens";
import { ShameScreen } from "@/components/screens";
import { ChallengeCodecScreen } from "@/components/screens";
import { ChallengeDebriefScreen } from "@/components/screens";

// Game components
import { WallGrid } from "@/components/wall";
import { ScratchScreen } from "@/components/scratch";
import { HUD, ScreenShell } from "@/components/ui";
import CodecShutter from "@/components/ui/codec-shutter";
import DebugOverlay from "@/components/ui/debug-overlay";

// Challenges
import {
  TriviaChallenge,
  ConfessionChallenge,
  MemoryChallenge,
  BossChallenge,
} from "@/components/challenges";

type GameOrchestratorProps = {
  secret: string;
};

export default function GameOrchestrator({ secret }: GameOrchestratorProps) {
  const {
    state,
    setScreen,
    restoreSession,
    scratchCard,
    confirmCode,
    rejectCode,
    eliminateCards,
    completeChallenge,
    cardsRemaining,
    getSavedSessionId,
    clearSavedSession,
  } = useGameState();

  const [loading, setLoading] = useState(false);
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Screen transitions wrapped with a CodecShutter animation.
  // Use transitionTo() instead of setScreen() for codec-adjacent screen changes.
  const { shutterActive, transitionTo, onShutterMidpoint, onShutterComplete } =
    useScreenTransition(setScreen);


  // Elapsed time counter
  useEffect(() => {
    if (!state.startTime) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - state.startTime) / 1000),
      );
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.startTime]);

  // Check for existing session on mount
  useEffect(() => {
    const savedSessionId = getSavedSessionId();
    if (savedSessionId) {
      setScreen({ type: "resume" });
    }
  }, [getSavedSessionId, setScreen]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /** Start a new game */
  const handleStart = useCallback(async () => {
    setLoading(true);
    const result = await startGame(secret);
    setLoading(false);

    if (result.success && result.data) {
      restoreSession(result.data);
      transitionTo({ type: "wall" });
    }
  }, [secret, restoreSession, transitionTo]);

  /** Resume an existing game */
  const handleResume = useCallback(async () => {
    setLoading(true);
    const savedSessionId = getSavedSessionId();
    if (!savedSessionId) {
      // No saved session — start fresh
      await handleStart();
      return;
    }

    const result = await getGameState(savedSessionId);
    setLoading(false);

    if (result.success && result.data) {
      restoreSession(result.data);
      setScreen({ type: "wall" });
    } else {
      // Session expired — clear and start fresh
      clearSavedSession();
      setScreen({ type: "intro" });
    }
  }, [getSavedSessionId, handleStart, restoreSession, setScreen, clearSavedSession]);

  /** Restart the game (delete session) */
  const handleRestart = useCallback(async () => {
    setLoading(true);
    await resetGame(secret);
    clearSavedSession();
    setLoading(false);
    setScreen({ type: "intro" });
  }, [secret, clearSavedSession, setScreen]);

  /** Select a card from the wall */
  const handleSelectCard = useCallback(
    (cardId: number) => {
      setRevealedCode(null);
      setScreen({ type: "scratch", cardId });
    },
    [setScreen],
  );

  /** Scratch complete — fetch code from server */
  const handleScratchComplete = useCallback(
    async (cardId: number) => {
      if (!state.sessionId) return;

      const result = await scratchCardAction(state.sessionId, cardId);
      if (result.success && result.data) {
        scratchCard(cardId, result.data.code);
        setRevealedCode(result.data.code);
      }
    },
    [state.sessionId, scratchCard],
  );

  /** Confirm a code worked */
  const handleConfirmCode = useCallback(
    async (cardId: number) => {
      if (!state.sessionId) return;

      const result = await confirmCodeAction(state.sessionId, cardId, true);
      if (result.success && result.data) {
        confirmCode(cardId);

        if (result.data.victory) {
          setScreen({ type: "victory" });
        } else {
          setScreen({ type: "wall" });
        }
      }
    },
    [state.sessionId, confirmCode, setScreen],
  );

  /** Reject a code (didn't work) */
  const handleRejectCode = useCallback(
    async (cardId: number) => {
      if (!state.sessionId) return;

      await confirmCodeAction(state.sessionId, cardId, false);
      rejectCode(cardId);
      setScreen({ type: "wall" });
    },
    [state.sessionId, rejectCode, setScreen],
  );

  /** Back to wall from scratch screen */
  const handleBackToWall = useCallback(() => {
    setRevealedCode(null);
    setScreen({ type: "wall" });
  }, [setScreen]);

  /** Get the next available challenge (if any) */
  const getAvailableChallenge = useCallback((): ChallengeId | null => {
    const challengeIds: ChallengeId[] = [1, 2, 3, 4];

    for (const id of challengeIds) {
      const config = CHALLENGES[id];
      if (
        state.scratchCount >= config.unlockAfterScratches &&
        !state.challengesCompleted.includes(id)
      ) {
        return id;
      }
    }
    return null;
  }, [state.scratchCount, state.challengesCompleted]);

  /** Accept a challenge */
  const handleAcceptChallenge = useCallback(
    (challengeId: ChallengeId) => {
      transitionTo({ type: "challenge", challengeId });
    },
    [transitionTo],
  );

  /** Challenge completed — trigger debrief codec before elimination */
  const handleChallengeComplete = useCallback(
    async (challengeId: ChallengeId) => {
      if (!state.sessionId) return;

      const result = await completeChallengeAction(
        state.sessionId,
        challengeId,
      );

      // Use server-returned eliminated IDs on success, fall back to empty list
      // so the debrief codec always plays even if the server call failed.
      const eliminatedIds =
        result.success && result.data ? result.data.eliminatedCardIds : [];

      if (result.success && result.data) {
        completeChallenge(challengeId);
      }

      // Always transition to the debrief — the Snake call must play.
      transitionTo({
        type: "challenge-debrief",
        challengeId,
        eliminatedIds,
      });
    },
    [state.sessionId, completeChallenge, transitionTo],
  );

  /** After debrief codec ends — transition to elimination animation */
  const handleDebriefComplete = useCallback(() => {
    if (state.screen.type !== "challenge-debrief") return;
    const { eliminatedIds } = state.screen;
    transitionTo({
      type: "elimination",
      eliminatedIds,
      nextScreen: { type: "wall" },
    });
  }, [state.screen, transitionTo]);

  /** Challenge failed — shame timer, then retry the same challenge directly */
  const handleChallengeFailed = useCallback(
    (challengeId: ChallengeId) => {
      transitionTo({
        type: "shame-timer",
        seconds: 30,
        nextScreen: { type: "challenge", challengeId },
      });
    },
    [transitionTo],
  );

  /** After elimination animation finishes */
  const handleEliminationComplete = useCallback(
    (nextScreen: Screen) => {
      if (nextScreen.type === "wall" && state.screen.type === "elimination") {
        eliminateCards(
          (state.screen as { type: "elimination"; eliminatedIds: number[] })
            .eliminatedIds,
        );
      }
      setScreen(nextScreen);
    },
    [state.screen, eliminateCards, setScreen],
  );

  // Check for available challenge when returning to wall
  useEffect(() => {
    if (state.screen.type === "wall") {
      const availableChallenge = getAvailableChallenge();
      if (availableChallenge !== null) {
        transitionTo({ type: "challenge-intro", challengeId: availableChallenge });
      }
    }
  }, [state.screen.type, getAvailableChallenge, transitionTo]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const screen = state.screen;

  /** Debug overlay — always rendered on top when debug mode is on */
  const debugOverlay = (
    <DebugOverlay
      screen={state.screen}
      sessionId={state.sessionId}
      scratchCount={state.scratchCount}
      codesConfirmed={state.codesConfirmed}
      challengesCompleted={state.challengesCompleted}
      cardsRemaining={cardsRemaining}
      onForceScreen={setScreen}
    />
  );

  // Loading overlay
  if (loading) {
    return (
      <>
        {debugOverlay}
        <ScreenShell centered>
          <p className="font-mono text-text-dim animate-[pulse-alert_1s_step-end_infinite]">
            CARGANDO...
          </p>
        </ScreenShell>
      </>
    );
  }

  /** Render the current screen based on state */
  function renderScreen() {
    switch (screen.type) {
      case "intro":
        return <IntroScreen onStart={handleStart} />;

      case "resume":
        return (
          <ResumeScreen
            codesConfirmed={state.codesConfirmed}
            cardsRemaining={cardsRemaining}
            challengesCompleted={state.challengesCompleted.length}
            onResume={handleResume}
            onRestart={handleRestart}
          />
        );

      case "wall":
        return (
          <>
            <HUD
              codesConfirmed={state.codesConfirmed}
              cardsRemaining={cardsRemaining}
              elapsedSeconds={elapsedSeconds}
            />
            <ScreenShell withHUD>
              <WallGrid cards={state.cards} onSelectCard={handleSelectCard} />
            </ScreenShell>
          </>
        );

      case "scratch":
        return (
          <>
            <HUD
              codesConfirmed={state.codesConfirmed}
              cardsRemaining={cardsRemaining}
              elapsedSeconds={elapsedSeconds}
            />
            <ScratchScreen
              cardId={screen.cardId}
              onScratchComplete={handleScratchComplete}
              revealedCode={revealedCode}
              onConfirm={handleConfirmCode}
              onReject={handleRejectCode}
              onBack={handleBackToWall}
            />
          </>
        );

      case "challenge-intro":
        return (
          <ChallengeCodecScreen
            challengeId={screen.challengeId as 1 | 2 | 3 | 4}
            onAccept={() => handleAcceptChallenge(screen.challengeId)}
          />
        );

      case "challenge-debrief":
        return (
          <ChallengeDebriefScreen
            challengeId={screen.challengeId as 1 | 2 | 3 | 4}
            onContinue={handleDebriefComplete}
          />
        );

      case "challenge": {
        const challengeProps = {
          onComplete: () => handleChallengeComplete(screen.challengeId),
          onFail: () => handleChallengeFailed(screen.challengeId),
        };

        switch (screen.challengeId) {
          case 1:
            return <TriviaChallenge {...challengeProps} />;
          case 2:
            return <ConfessionChallenge {...challengeProps} />;
          case 3:
            return <MemoryChallenge {...challengeProps} />;
          case 4:
            return <BossChallenge {...challengeProps} />;
          default:
            return null;
        }
      }

      case "shame-timer":
        return (
          <ShameScreen
            seconds={screen.seconds}
            onComplete={() => setScreen(screen.nextScreen)}
          />
        );

      case "elimination":
        return (
          <EliminationScreen
            eliminatedIds={screen.eliminatedIds}
            onComplete={() =>
              handleEliminationComplete(screen.nextScreen)
            }
          />
        );

      case "victory":
        return (
          <VictoryScreen
            codesConfirmed={state.codesConfirmed}
            elapsedSeconds={elapsedSeconds}
          />
        );

      case "confirm":
        // This screen is handled inline in ScratchScreen
        return null;

      default:
        return <AccessDeniedScreen />;
    }
  }

  return (
    <>
      {debugOverlay}
      {/* Screen-level shutter transition — fires on codec-adjacent screen changes */}
      <CodecShutter
        active={shutterActive}
        onMidpoint={onShutterMidpoint}
        onComplete={onShutterComplete}
      />
      {renderScreen()}
    </>
  );
}
