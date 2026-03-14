// =============================================================================
// Session Manager - CRUD operations for game sessions in Redis
// =============================================================================

import type { GameSession, ServerCard, ClientCard, ClientGameState } from "@/lib/types";
import { TOTAL_CARDS } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { getRedisClient, REDIS_KEYS, SESSION_TTL_SECONDS } from "./redis";
import { generateCardDeck } from "./card-generator";

/**
 * Create a new game session.
 * Generates the card deck, stores it in Redis, and returns the session.
 */
export async function createSession(secret: string): Promise<GameSession> {
  const redis = getRedisClient();
  const sessionId = generateId();
  const cards = generateCardDeck();

  const session: GameSession = {
    sessionId,
    secret,
    startTime: Date.now(),
    scratchedCardIds: [],
    eliminatedCardIds: [],
    confirmedCodeIds: [],
    challengesCompleted: [],
    scratchCount: 0,
    mercyActivatedAt: null,
  };

  // Store session, cards, and secret→session lookup in a pipeline
  const pipeline = redis.pipeline();
  pipeline.set(REDIS_KEYS.session(sessionId), JSON.stringify(session), {
    ex: SESSION_TTL_SECONDS,
  });
  pipeline.set(REDIS_KEYS.cards(sessionId), JSON.stringify(cards), {
    ex: SESSION_TTL_SECONDS,
  });
  pipeline.set(REDIS_KEYS.secretLookup(secret), sessionId, {
    ex: SESSION_TTL_SECONDS,
  });
  await pipeline.exec();

  return session;
}

/** Retrieve an existing session by ID */
export async function getSession(
  sessionId: string,
): Promise<GameSession | null> {
  const redis = getRedisClient();
  const raw = await redis.get<string>(REDIS_KEYS.session(sessionId));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as GameSession);
}

/** Retrieve session ID by the game secret (URL param) */
export async function getSessionBySecret(
  secret: string,
): Promise<string | null> {
  const redis = getRedisClient();
  const sessionId = await redis.get<string>(REDIS_KEYS.secretLookup(secret));
  return sessionId;
}

/** Update a session in Redis */
export async function updateSession(session: GameSession): Promise<void> {
  const redis = getRedisClient();
  await redis.set(
    REDIS_KEYS.session(session.sessionId),
    JSON.stringify(session),
    { ex: SESSION_TTL_SECONDS },
  );
}

/** Retrieve the server-side card deck */
export async function getCards(
  sessionId: string,
): Promise<ServerCard[] | null> {
  const redis = getRedisClient();
  const raw = await redis.get<string>(REDIS_KEYS.cards(sessionId));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as ServerCard[]);
}

/**
 * Convert server-side state into the client-safe representation.
 * CRITICAL: Never includes isReal in the output.
 */
export function toClientGameState(
  session: GameSession,
  serverCards: ServerCard[],
): ClientGameState {
  const clientCards: ClientCard[] = serverCards.map((card) => {
    const isScratched = session.scratchedCardIds.includes(card.id);
    const isEliminated = session.eliminatedCardIds.includes(card.id);
    const isConfirmed = session.confirmedCodeIds.includes(card.id);

    let status: ClientCard["status"];
    if (isConfirmed) {
      status = "confirmed";
    } else if (isEliminated) {
      status = "eliminated";
    } else if (isScratched) {
      status = "scratched";
    } else {
      status = "sealed";
    }

    return {
      id: card.id,
      // Only reveal the code if the card has been scratched
      code: isScratched || isConfirmed ? card.code : undefined,
      status,
    };
  });

  return {
    sessionId: session.sessionId,
    totalCards: TOTAL_CARDS,
    cards: clientCards,
    codesConfirmed: session.confirmedCodeIds.length,
    challengesCompleted: session.challengesCompleted,
    scratchCount: session.scratchCount,
    startTime: session.startTime,
  };
}

/** Delete a session and all associated data */
export async function deleteSession(
  sessionId: string,
  secret: string,
): Promise<void> {
  const redis = getRedisClient();
  const pipeline = redis.pipeline();
  pipeline.del(REDIS_KEYS.session(sessionId));
  pipeline.del(REDIS_KEYS.cards(sessionId));
  pipeline.del(REDIS_KEYS.secretLookup(secret));
  await pipeline.exec();
}
