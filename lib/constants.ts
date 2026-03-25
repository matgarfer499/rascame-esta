// =============================================================================
// Game Constants - All magic numbers and configuration values
// =============================================================================

import type { ChallengeConfig, ChallengeId } from "./types";

/** Total number of cards in the grid */
export const TOTAL_CARDS = 100;

/** Number of real PSN codes hidden in the grid */
export const REAL_CODES_COUNT = 9;

/** Number of fake codes */
export const FAKE_CODES_COUNT = TOTAL_CARDS - REAL_CODES_COUNT;

/** Grid dimensions */
export const GRID_COLUMNS = 10;
export const GRID_ROWS = 10;

/** Scratch mechanic thresholds */
export const SCRATCH_COVERAGE_THRESHOLD = 0.85;
export const SCRATCH_COVERAGE_THRESHOLD_MERCY = 0.60;
export const SCRATCH_BRUSH_RADIUS = 15;
export const SCRATCH_BRUSH_RADIUS_MERCY = 25;
export const SCRATCH_COVERAGE_CHECK_INTERVAL_MS = 500;

/** Code reveal timer (seconds before the code fades) */
export const CODE_FADE_TIMER_SECONDS = 30;
export const CODE_FADE_TIMER_SECONDS_MERCY = 60;

/** Number of guaranteed fake scratches at the start */
export const GUARANTEED_FAKE_SCRATCHES = 5;

/** Challenge configurations */
export const CHALLENGES: Record<ChallengeId, ChallengeConfig> = {
  1: {
    id: 1,
    nameKey: "challenge.trivia.name",
    descriptionKey: "challenge.trivia.description",
    fakesToEliminate: 15,
    unlockAfterScratches: 3,
  },
  2: {
    id: 2,
    nameKey: "challenge.confession.name",
    descriptionKey: "challenge.confession.description",
    fakesToEliminate: 20,
    unlockAfterScratches: 8,
  },
  3: {
    id: 3,
    nameKey: "challenge.memory.name",
    descriptionKey: "challenge.memory.description",
    fakesToEliminate: 20,
    unlockAfterScratches: 13,
  },
  4: {
    id: 4,
    nameKey: "challenge.boss.name",
    descriptionKey: "challenge.boss.description",
    fakesToEliminate: 25,
    unlockAfterScratches: 18,
  },
};

/** Shame timer duration in seconds (on challenge failure) */
export const SHAME_TIMER_SECONDS = 30;

/** Mercy system thresholds */
export const MERCY_TIME_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
export const MERCY_CODES_FOUND_THRESHOLD = 5; // Fewer than 5 found triggers mercy

/** Idle warning timeout in seconds */
export const IDLE_WARNING_SECONDS = 30;

/** Trivia challenge settings */
export const TRIVIA_QUESTIONS_PER_ROUND = 5;
export const TRIVIA_CORRECT_TO_PASS = 4;
export const TRIVIA_TIME_LIMIT_SECONDS = 45;

/** Confession challenge settings */
export const CONFESSION_VOLUME_THRESHOLD = 0.25; // 0-1 RMS normalized
export const CONFESSION_DURATION_SECONDS = 5;

/** Memory challenge settings */
export const MEMORY_ROUNDS = 5;
export const MEMORY_INITIAL_SEQUENCE_LENGTH = 4;
export const MEMORY_SEQUENCE_INCREMENT = 2;
/** Base flash duration (ms) for round 1. Decreases by MEMORY_FLASH_SPEED_DECAY_MS each round. */
export const MEMORY_FLASH_DURATION_MS = 600;
/** How much faster each round gets (ms reduction per round) */
export const MEMORY_FLASH_SPEED_DECAY_MS = 100;
/** Total attempts allowed across the whole challenge before failing */
export const MEMORY_MAX_ATTEMPTS = 3;
/** Which round number is the impossible troll round (must equal MEMORY_ROUNDS) */
export const MEMORY_TROLL_ROUND = 5;
/** Sequence length for the troll round (impossible to memorize) */
export const MEMORY_TROLL_SEQUENCE_LENGTH = 50;
/** Flash duration (ms) per tile in the troll round — 50 tiles × 60ms = 3s total */
export const MEMORY_TROLL_FLASH_DURATION_MS = 40;
/** Gap between flashes in the troll round (ms) */
export const MEMORY_TROLL_GAP_MS = 20;

/** Boss challenge settings */
export const BOSS_HOLD_DURATION_SECONDS = 15;
export const BOSS_STABILITY_THRESHOLD = 0.5; // Accelerometer threshold
export const BOSS_DISTRACTION_INTERVAL_MS = 3000;

/** PSN code format: XXXX-XXXX-XXXX (alphanumeric, 3 blocks of 4) */
export const PSN_CODE_BLOCK_LENGTH = 4;
export const PSN_CODE_BLOCKS = 3;
export const PSN_CODE_SEPARATOR = "-";

/** Characters used to generate fake codes (ambiguous on purpose) */
export const FAKE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

/** LocalStorage keys */
export const STORAGE_SESSION_KEY = "rascame-esta-session";
export const STORAGE_GAME_STATE_KEY = "rascame-esta-state";

/** Elimination animation stagger delay per card (ms) */
export const ELIMINATION_STAGGER_MS = 100;

/** Codes confirmed to trigger victory */
export const VICTORY_THRESHOLD = REAL_CODES_COUNT;

// =============================================================================
// Codec Intro - MGS-style codec call configuration
// =============================================================================

/** Classic MGS codec frequency for Snake */
export const CODEC_FREQUENCY = "140.85";

/** Audio file paths for the codec intro */
export const CODEC_RING_SRC = "/sounds/codec-sound.mp3";
export const CODEC_ACCEPTED_SRC = "/sounds/accepted-call-sound.mp3";
export const CODEC_MESSAGE_SRC = "/sounds/intro-message.mp3";

/**
 * Timestamps (in seconds) for each subtitle line in intro-message.mp3.
 * Each entry corresponds to the same index in UI.introSubtitles.
 */
export const CODEC_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 3.7, 6.6, 10.6, 13.7, 16.4, 24.8, 29.3, 33.3, 37.3, 38.9, 43.3, 44.6, 46.2, 47.4
] as const;
