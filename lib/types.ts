// =============================================================================
// Game Types - Shared between client and server
// =============================================================================

/** Possible states for a card in the grid */
export type CardStatus = "sealed" | "scratched" | "eliminated" | "confirmed";

/** Client-side card representation (never includes isReal) */
export type ClientCard = {
  id: number;
  status: CardStatus;
  code?: string; // Only present after scratching
};

/** Server-side card with the real/fake flag (NEVER sent to client) */
export type ServerCard = {
  id: number;
  code: string;
  isReal: boolean;
};

/** Game session state persisted in Redis */
export type GameSession = {
  sessionId: string;
  secret: string;
  startTime: number;
  scratchedCardIds: number[];
  eliminatedCardIds: number[];
  confirmedCodeIds: number[];
  challengesCompleted: number[];
  scratchCount: number;
  mercyActivatedAt: number | null;
};

/** What the client receives about the current game state */
export type ClientGameState = {
  sessionId: string;
  totalCards: number;
  cards: ClientCard[];
  codesConfirmed: number;
  challengesCompleted: number[];
  scratchCount: number;
  startTime: number;
};

/** Available challenge identifiers */
export type ChallengeId = 1 | 2 | 3 | 4;

/** Challenge definition */
export type ChallengeConfig = {
  id: ChallengeId;
  nameKey: string;
  descriptionKey: string;
  fakesToEliminate: number;
  unlockAfterScratches: number;
};

/** Standard server action response */
export type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

/** Scratch action response */
export type ScratchResult = {
  cardId: number;
  code: string;
};

/** Challenge completion response */
export type ChallengeResult = {
  challengeId: ChallengeId;
  eliminatedCardIds: number[];
};

/** Screen navigation state */
export type Screen =
  | { type: "intro" }
  | { type: "resume" }
  | { type: "wall" }
  | { type: "scratch"; cardId: number }
  | { type: "confirm"; cardId: number; code: string }
  | { type: "challenge-intro"; challengeId: ChallengeId }
  | { type: "challenge"; challengeId: ChallengeId }
  | { type: "shame-timer"; seconds: number; nextScreen: Screen }
  | { type: "elimination"; eliminatedIds: number[]; nextScreen: Screen }
  | { type: "victory" };

/** Trivia question for the Twin Trivia challenge */
export type TriviaQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  targetTwin: "cristobal" | "miguel";
};

/** Memory tile for the Memory Lane challenge */
export type MemoryTile = {
  id: number;
  text: string;
  imageUrl?: string;
};

/** Distraction item for the Boss challenge */
export type DistractionItem = {
  type: "text" | "image";
  content: string;
};

/** Game reducer action types */
export type GameAction =
  | { type: "SET_SCREEN"; screen: Screen }
  | { type: "SCRATCH_CARD"; cardId: number; code: string }
  | { type: "CONFIRM_CODE"; cardId: number }
  | { type: "REJECT_CODE"; cardId: number }
  | { type: "ELIMINATE_CARDS"; cardIds: number[] }
  | { type: "COMPLETE_CHALLENGE"; challengeId: ChallengeId }
  | { type: "RESTORE_SESSION"; state: ClientGameState }
  | { type: "INCREMENT_SCRATCH_COUNT" };
