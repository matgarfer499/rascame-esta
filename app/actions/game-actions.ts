"use server";

// =============================================================================
// Game Actions - Server Actions for game operations
// These are the ONLY way the client interacts with server state.
// =============================================================================

import type {
  ActionResponse,
  ClientGameState,
  ScratchResult,
  ChallengeResult,
  ChallengeId,
} from "@/lib/types";
import {
  CHALLENGES,
  MERCY_TIME_THRESHOLD_MS,
  MERCY_CODES_FOUND_THRESHOLD,
  VICTORY_THRESHOLD,
} from "@/lib/constants";
import { shuffle } from "@/lib/utils";
import {
  createSession,
  getSession,
  getSessionBySecret,
  getCards,
  updateSession,
  toClientGameState,
  deleteSession,
} from "@/server/session";

// =============================================================================
// Validate secret against environment variable
// =============================================================================
function isValidSecret(secret: string): boolean {
  console.log(process.env.GAME_SECRET);
  return secret === process.env.GAME_SECRET;
}

// =============================================================================
// START GAME - Create or resume a game session
// =============================================================================
export async function startGame(
  secret: string,
): Promise<ActionResponse<ClientGameState>> {
  if (!isValidSecret(secret)) {
    return { success: false, error: "INVALID_SECRET" };
  }

  try {
    // Check for existing session
    const existingSessionId = await getSessionBySecret(secret);

    if (existingSessionId) {
      const existingSession = await getSession(existingSessionId);
      const existingCards = existingSession
        ? await getCards(existingSessionId)
        : null;

      if (existingSession && existingCards) {
        return {
          success: true,
          data: toClientGameState(existingSession, existingCards),
        };
      }
    }

    // Create new session
    const session = await createSession(secret);
    const cards = await getCards(session.sessionId);
    if (!cards) {
      return { success: false, error: "CARD_GENERATION_FAILED" };
    }

    return {
      success: true,
      data: toClientGameState(session, cards),
    };
  } catch (error) {
    console.error("[startGame] Error:", error);
    return { success: false, error: "SERVER_ERROR" };
  }
}

// =============================================================================
// SCRATCH CARD - Reveal a card's code
// =============================================================================
export async function scratchCard(
  sessionId: string,
  cardId: number,
): Promise<ActionResponse<ScratchResult>> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return { success: false, error: "SESSION_NOT_FOUND" };
    }

    const cards = await getCards(sessionId);
    if (!cards) {
      return { success: false, error: "CARDS_NOT_FOUND" };
    }

    // Validate card exists
    const card = cards.find((c) => c.id === cardId);
    if (!card) {
      return { success: false, error: "CARD_NOT_FOUND" };
    }

    // Check card isn't already scratched or eliminated
    if (session.scratchedCardIds.includes(cardId)) {
      // Already scratched — return the code again
      return {
        success: true,
        data: { cardId, code: card.code },
      };
    }

    if (session.eliminatedCardIds.includes(cardId)) {
      return { success: false, error: "CARD_ELIMINATED" };
    }

    // Update session
    session.scratchedCardIds.push(cardId);
    session.scratchCount += 1;
    await updateSession(session);

    return {
      success: true,
      data: { cardId, code: card.code },
    };
  } catch (error) {
    console.error("[scratchCard] Error:", error);
    return { success: false, error: "SERVER_ERROR" };
  }
}

// =============================================================================
// CONFIRM CODE - Player says the code worked (or didn't)
// =============================================================================
export async function confirmCode(
  sessionId: string,
  cardId: number,
  worked: boolean,
): Promise<ActionResponse<{ victory: boolean }>> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return { success: false, error: "SESSION_NOT_FOUND" };
    }

    // Card must have been scratched
    if (!session.scratchedCardIds.includes(cardId)) {
      return { success: false, error: "CARD_NOT_SCRATCHED" };
    }

    if (worked) {
      // Only add if not already confirmed
      if (!session.confirmedCodeIds.includes(cardId)) {
        session.confirmedCodeIds.push(cardId);
      }
    }

    await updateSession(session);

    const victory = session.confirmedCodeIds.length >= VICTORY_THRESHOLD;

    return {
      success: true,
      data: { victory },
    };
  } catch (error) {
    console.error("[confirmCode] Error:", error);
    return { success: false, error: "SERVER_ERROR" };
  }
}

// =============================================================================
// COMPLETE CHALLENGE - Eliminate fake cards after a challenge win
// =============================================================================
export async function completeChallenge(
  sessionId: string,
  challengeId: ChallengeId,
): Promise<ActionResponse<ChallengeResult>> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return { success: false, error: "SESSION_NOT_FOUND" };
    }

    // Check challenge hasn't been completed already
    if (session.challengesCompleted.includes(challengeId)) {
      return { success: false, error: "CHALLENGE_ALREADY_COMPLETED" };
    }

    const challengeConfig = CHALLENGES[challengeId];
    if (!challengeConfig) {
      return { success: false, error: "INVALID_CHALLENGE" };
    }

    const cards = await getCards(sessionId);
    if (!cards) {
      return { success: false, error: "CARDS_NOT_FOUND" };
    }

    // Find eligible fake cards to eliminate (not scratched, not already eliminated, not real)
    const eligibleFakes = cards
      .filter(
        (c) =>
          !c.isReal &&
          !session.scratchedCardIds.includes(c.id) &&
          !session.eliminatedCardIds.includes(c.id),
      )
      .map((c) => c.id);

    // Shuffle and pick the number to eliminate
    const shuffledEligible = shuffle(eligibleFakes);
    const toEliminate = shuffledEligible.slice(
      0,
      Math.min(challengeConfig.fakesToEliminate, shuffledEligible.length),
    );

    // Update session
    session.eliminatedCardIds.push(...toEliminate);
    session.challengesCompleted.push(challengeId);
    await updateSession(session);

    return {
      success: true,
      data: {
        challengeId,
        eliminatedCardIds: toEliminate,
      },
    };
  } catch (error) {
    console.error("[completeChallenge] Error:", error);
    return { success: false, error: "SERVER_ERROR" };
  }
}

// =============================================================================
// GET GAME STATE - Retrieve current state (for session recovery)
// =============================================================================
export async function getGameState(
  sessionId: string,
): Promise<ActionResponse<ClientGameState>> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return { success: false, error: "SESSION_NOT_FOUND" };
    }

    const cards = await getCards(sessionId);
    if (!cards) {
      return { success: false, error: "CARDS_NOT_FOUND" };
    }

    return {
      success: true,
      data: toClientGameState(session, cards),
    };
  } catch (error) {
    console.error("[getGameState] Error:", error);
    return { success: false, error: "SERVER_ERROR" };
  }
}

// =============================================================================
// CHECK MERCY - Check if mercy system should activate
// Returns updated thresholds if mercy is active (called periodically)
// =============================================================================
export async function checkMercy(
  sessionId: string,
): Promise<
  ActionResponse<{
    active: boolean;
    codesFound: number;
    elapsedMs: number;
  }>
> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return { success: false, error: "SESSION_NOT_FOUND" };
    }

    const elapsedMs = Date.now() - session.startTime;
    const codesFound = session.confirmedCodeIds.length;
    const shouldActivate =
      elapsedMs >= MERCY_TIME_THRESHOLD_MS &&
      codesFound < MERCY_CODES_FOUND_THRESHOLD;

    // Record mercy activation time (once)
    if (shouldActivate && !session.mercyActivatedAt) {
      session.mercyActivatedAt = Date.now();
      await updateSession(session);
    }

    return {
      success: true,
      data: {
        active: shouldActivate,
        codesFound,
        elapsedMs,
      },
    };
  } catch (error) {
    console.error("[checkMercy] Error:", error);
    return { success: false, error: "SERVER_ERROR" };
  }
}

// =============================================================================
// RESET GAME - Delete session and start fresh
// =============================================================================
export async function resetGame(
  secret: string,
): Promise<ActionResponse<undefined>> {
  if (!isValidSecret(secret)) {
    return { success: false, error: "INVALID_SECRET" };
  }

  try {
    const existingSessionId = await getSessionBySecret(secret);
    if (existingSessionId) {
      await deleteSession(existingSessionId, secret);
    }
    return { success: true };
  } catch (error) {
    console.error("[resetGame] Error:", error);
    return { success: false, error: "SERVER_ERROR" };
  }
}
