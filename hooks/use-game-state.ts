"use client";

// =============================================================================
// useGameState - Client-side game state management via useReducer
// Handles screen navigation, card updates, and localStorage backup.
// =============================================================================

import { useReducer, useCallback, useEffect, useRef } from "react";
import type {
  ClientCard,
  ClientGameState,
  GameAction,
  Screen,
  ChallengeId,
} from "@/lib/types";
import { STORAGE_GAME_STATE_KEY, TOTAL_CARDS } from "@/lib/constants";

/** Complete client-side game state */
type GameState = {
  screen: Screen;
  sessionId: string | null;
  cards: ClientCard[];
  codesConfirmed: number;
  challengesCompleted: ChallengeId[];
  scratchCount: number;
  startTime: number;
  mercyActive: boolean;
};

const INITIAL_STATE: GameState = {
  screen: { type: "intro" },
  sessionId: null,
  cards: [],
  codesConfirmed: 0,
  challengesCompleted: [],
  scratchCount: 0,
  startTime: 0,
  mercyActive: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, screen: action.screen };

    case "SCRATCH_CARD":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.cardId
            ? { ...card, status: "scratched" as const, code: action.code }
            : card,
        ),
        scratchCount: state.scratchCount + 1,
      };

    case "CONFIRM_CODE":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.cardId
            ? { ...card, status: "confirmed" as const }
            : card,
        ),
        codesConfirmed: state.codesConfirmed + 1,
      };

    case "REJECT_CODE":
      // Code didn't work — card stays scratched, no confirmation
      return state;

    case "ELIMINATE_CARDS":
      return {
        ...state,
        cards: state.cards.map((card) =>
          action.cardIds.includes(card.id)
            ? { ...card, status: "eliminated" as const }
            : card,
        ),
      };

    case "COMPLETE_CHALLENGE":
      return {
        ...state,
        challengesCompleted: [
          ...state.challengesCompleted,
          action.challengeId,
        ],
      };

    case "RESTORE_SESSION":
      return {
        ...state,
        sessionId: action.state.sessionId,
        cards: action.state.cards,
        codesConfirmed: action.state.codesConfirmed,
        challengesCompleted: action.state.challengesCompleted as ChallengeId[],
        scratchCount: action.state.scratchCount,
        startTime: action.state.startTime,
      };

    case "INCREMENT_SCRATCH_COUNT":
      return {
        ...state,
        scratchCount: state.scratchCount + 1,
      };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const isInitializedRef = useRef(false);

  // Persist state to localStorage on every change (after init)
  useEffect(() => {
    if (!isInitializedRef.current || !state.sessionId) return;

    try {
      const serializable = {
        sessionId: state.sessionId,
        codesConfirmed: state.codesConfirmed,
        challengesCompleted: state.challengesCompleted,
        scratchCount: state.scratchCount,
        startTime: state.startTime,
      };
      localStorage.setItem(
        STORAGE_GAME_STATE_KEY,
        JSON.stringify(serializable),
      );
    } catch {
      // localStorage might be full or disabled — non-critical
    }
  }, [
    state.sessionId,
    state.codesConfirmed,
    state.challengesCompleted,
    state.scratchCount,
    state.startTime,
  ]);

  /** Restore session from server state */
  const restoreSession = useCallback((gameState: ClientGameState) => {
    dispatch({ type: "RESTORE_SESSION", state: gameState });
    isInitializedRef.current = true;
  }, []);

  /** Navigate to a new screen */
  const setScreen = useCallback((screen: Screen) => {
    dispatch({ type: "SET_SCREEN", screen });
  }, []);

  /** Record a card scratch */
  const scratchCard = useCallback((cardId: number, code: string) => {
    dispatch({ type: "SCRATCH_CARD", cardId, code });
  }, []);

  /** Confirm a code worked */
  const confirmCode = useCallback((cardId: number) => {
    dispatch({ type: "CONFIRM_CODE", cardId });
  }, []);

  /** Reject a code (didn't work) */
  const rejectCode = useCallback((cardId: number) => {
    dispatch({ type: "REJECT_CODE", cardId });
  }, []);

  /** Eliminate a batch of cards */
  const eliminateCards = useCallback((cardIds: number[]) => {
    dispatch({ type: "ELIMINATE_CARDS", cardIds });
  }, []);

  /** Complete a challenge */
  const completeChallenge = useCallback((challengeId: ChallengeId) => {
    dispatch({ type: "COMPLETE_CHALLENGE", challengeId });
  }, []);

  /** Check if a saved session exists in localStorage */
  const getSavedSessionId = useCallback((): string | null => {
    try {
      const raw = localStorage.getItem(STORAGE_GAME_STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.sessionId ?? null;
    } catch {
      return null;
    }
  }, []);

  /** Clear saved session from localStorage */
  const clearSavedSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_GAME_STATE_KEY);
    } catch {
      // non-critical
    }
  }, []);

  /** Count of sealed cards (not yet scratched, eliminated, or confirmed) */
  const cardsRemaining = state.cards.filter(
    (c) =>
      c.status !== "eliminated" &&
      c.status !== "confirmed" &&
      c.status !== "scratched",
  ).length;

  return {
    state,
    dispatch,
    // Convenience actions
    setScreen,
    restoreSession,
    scratchCard,
    confirmCode,
    rejectCode,
    eliminateCards,
    completeChallenge,
    // Derived state
    cardsRemaining,
    // Session persistence
    getSavedSessionId,
    clearSavedSession,
  };
}
