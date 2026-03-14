// =============================================================================
// Card Generator - Creates the 100-card deck with 9 real and 91 fake codes
// This runs ONLY on the server. The result is stored in Redis.
// =============================================================================

import type { ServerCard } from "@/lib/types";
import {
  TOTAL_CARDS,
  REAL_CODES_COUNT,
  FAKE_CODE_CHARS,
  GUARANTEED_FAKE_SCRATCHES,
} from "@/lib/constants";
import { generateFakeCode, shuffle } from "@/lib/utils";

/**
 * Parse real PSN codes from the environment variable.
 * Expected format: JSON array of strings, e.g., ["ABCD-1234-EFGH", ...]
 */
export function parseRealCodes(): string[] {
  const raw = process.env.REAL_PSN_CODES;
  if (!raw) {
    throw new Error(
      "REAL_PSN_CODES environment variable is not set. " +
        "Set it to a JSON array of 9 PSN code strings.",
    );
  }

  const codes: unknown = JSON.parse(raw);
  if (!Array.isArray(codes) || codes.length !== REAL_CODES_COUNT) {
    throw new Error(
      `REAL_PSN_CODES must be a JSON array of exactly ${REAL_CODES_COUNT} strings. Got ${Array.isArray(codes) ? codes.length : typeof codes}.`,
    );
  }

  return codes as string[];
}

/**
 * Generate the full deck of 100 ServerCards.
 *
 * Layout rules:
 * - Cards IDs 1-100
 * - 9 real codes placed randomly BUT never in the first GUARANTEED_FAKE_SCRATCHES positions
 * - 91 fake codes fill the rest
 * - The final array is shuffled, then real codes are moved out of the "guaranteed fake" zone
 */
export function generateCardDeck(): ServerCard[] {
  const realCodes = parseRealCodes();

  // Create all cards
  const cards: ServerCard[] = [];

  // Add real cards
  for (let i = 0; i < REAL_CODES_COUNT; i++) {
    cards.push({
      id: 0, // Will be assigned after shuffle
      code: realCodes[i],
      isReal: true,
    });
  }

  // Add fake cards
  const fakeCount = TOTAL_CARDS - REAL_CODES_COUNT;
  for (let i = 0; i < fakeCount; i++) {
    cards.push({
      id: 0,
      code: generateFakeCode(FAKE_CODE_CHARS),
      isReal: false,
    });
  }

  // Shuffle everything
  const shuffled = shuffle(cards);

  // Ensure no real cards are in the first GUARANTEED_FAKE_SCRATCHES positions
  // by swapping them with fake cards from later positions
  for (let i = 0; i < GUARANTEED_FAKE_SCRATCHES; i++) {
    if (shuffled[i].isReal) {
      // Find a fake card beyond the guaranteed zone to swap with
      const swapIdx = shuffled.findIndex(
        (card, idx) => idx >= GUARANTEED_FAKE_SCRATCHES && !card.isReal,
      );
      if (swapIdx !== -1) {
        [shuffled[i], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[i]];
      }
    }
  }

  // Assign sequential IDs (1-indexed)
  return shuffled.map((card, idx) => ({
    ...card,
    id: idx + 1,
  }));
}
