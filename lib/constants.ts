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

/** Grid-based coverage tracking (avoids expensive getImageData on mobile) */
export const SCRATCH_GRID_COLS = 20;
export const SCRATCH_GRID_ROWS = 12;

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
export const TRIVIA_QUESTIONS_PER_ROUND = 10;
export const TRIVIA_CORRECT_TO_PASS = 7;

/** Confession challenge settings */
export const CONFESSION_VOLUME_THRESHOLD = 0.04; // 0-1 RMS normalized — raw signal without AGC is lower
export const CONFESSION_DURATION_SECONDS = 5;
/** Sampling interval (ms) */
export const CONFESSION_TICK_MS = 200;

/** Memory challenge settings */
export const MEMORY_ROUNDS = 4;
export const MEMORY_INITIAL_SEQUENCE_LENGTH = 4;
export const MEMORY_SEQUENCE_INCREMENT = 2;
/** Base flash duration (ms) for round 1. Decreases by MEMORY_FLASH_SPEED_DECAY_MS each round. */
export const MEMORY_FLASH_DURATION_MS = 600;
/** How much faster each round gets (ms reduction per round) */
export const MEMORY_FLASH_SPEED_DECAY_MS = 100;
/** Total attempts allowed across the whole challenge before failing */
export const MEMORY_MAX_ATTEMPTS = 3;
/** Which round number is the impossible troll round (must equal MEMORY_ROUNDS) */
export const MEMORY_TROLL_ROUND = 4;
/** Sequence length for the troll round (impossible to memorize) */
export const MEMORY_TROLL_SEQUENCE_LENGTH = 50;
/** Flash duration (ms) per tile in the troll round — 50 tiles × 60ms = 3s total */
export const MEMORY_TROLL_FLASH_DURATION_MS = 40;
/** Gap between flashes in the troll round (ms) */
export const MEMORY_TROLL_GAP_MS = 20;

/** Boss fight settings */
export const BOSS_MAX_HP = 100;
export const BOSS_HP_RECOVERY = 10;
export const BOSS_MAX_FAILURES = 5;
/** HP thresholds where the boss transitions to phase 2 and phase 3 */
export const BOSS_PHASE_2_THRESHOLD = 70;
export const BOSS_PHASE_3_THRESHOLD = 30;
export const BOSS_STABILITY_THRESHOLD = 0.5;
export const BOSS_VOLUME_THRESHOLD = 0.1;
export const BOSS_SILENCE_THRESHOLD = 0.04;
export const BOSS_DISTRACTION_INTERVAL_MS = 3000;
/** Delay between actions (ms) — the "prepare" pause */
export const BOSS_ACTION_GAP_MS = 2000;
/** Time multiplier per phase (1 = normal, < 1 = faster) */
export const BOSS_PHASE_TIME_MULTIPLIERS = [1, 0.8, 0.6] as const;

/** Per-action damage and base duration (seconds) */
export const BOSS_ACTION_CONFIGS = {
  "double-strike": { damage: 15, duration: 3 },
  "war-cry": { damage: 20, duration: 4 },
  "hold-position": { damage: 15, duration: 6 },
  "quick-combo": { damage: 20, duration: 8 },
  "tactical-silence": { damage: 15, duration: 5 },
} as const;

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
export const ELIMINATION_STAGGER_MS = 400;

/** Delay (ms) after animation completes before showing the continue button */
export const ELIMINATION_CONTINUE_DELAY_MS = 3000;

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

/** Audio file paths for challenge codec calls (intro briefings) */
export const CHALLENGE_1_MESSAGE_SRC = "/sounds/first-challenge.mp3";
export const CHALLENGE_2_MESSAGE_SRC = "/sounds/second-challenge.mp3";
export const CHALLENGE_3_MESSAGE_SRC = "/sounds/third-challenge.mp3";
export const CHALLENGE_4_MESSAGE_SRC = "/sounds/fourth-challenge.mp3";

/** Audio file paths for per-challenge debrief codec calls */
export const CHALLENGE_1_DEBRIEF_SRC = "/sounds/first-challenge-succeded.mp3";
export const CHALLENGE_2_DEBRIEF_SRC = "/sounds/second-challenge-succeded.mp3";
export const CHALLENGE_3_DEBRIEF_SRC = "/sounds/third-challenge-succeded.mp3";
export const CHALLENGE_4_DEBRIEF_SRC = "/sounds/fourth-challenge-succeed.mp3";

/**
 * Timestamps (in seconds) for each subtitle line in intro-message.mp3.
 */
export const CODEC_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 3.7, 6.6, 10.6, 13.7, 16.4, 24.8, 29.3, 33.3, 37.3, 38.9, 43.3, 44.6, 46.2, 47.4
] as const;

/**
 * Timestamps (in seconds) for challenge 1 subtitle lines in first-challenge.mp3.
 */
export const CHALLENGE_1_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 1.2, 8.0, 11.2, 15.0, 19.2, 23.3, 25.7, 29.7, 33.3, 35.4, 42.7, 49.3, 52.3, 55.3, 57.3
] as const;

/**
 * Timestamps (in seconds) for challenge 2 subtitle lines in second-challenge.mp3.
 */
export const CHALLENGE_2_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 3.7, 6.9, 12.0, 14.5, 16.0, 20.0, 22.2, 24.7, 26.3, 28.0, 34.7, 40.7, 44.4
] as const;

/**
 * Timestamps (in seconds) for challenge 3 subtitle lines in third-challenge.mp3.
 */
export const CHALLENGE_3_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 3.9, 6.2, 9.3, 15.0, 16.4, 19.1, 23.1, 24.5, 30.5, 34.7, 41.5, 43.5, 46.6, 49.3, 51.4
] as const;

/**
 * Timestamps (in seconds) for challenge 4 subtitle lines in fourth-challenge.mp3.
 */
export const CHALLENGE_4_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 3.5, 4.9, 10.0, 12.5, 15.0, 18.4, 20.2, 24.7, 26.9, 29.4, 32.7, 36.3, 38.3
] as const;

/**
 * Timestamps for the challenge 1 debrief codec (first-challenge-succeded.mp3).
 */
export const CHALLENGE_1_DEBRIEF_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 1.0, 3.7, 10.0, 12.9, 15.5, 18.4, 20.1
] as const;

/**
 * Timestamps for the challenge 2 debrief codec (second-challenge-succeded.mp3).
 */
export const CHALLENGE_2_DEBRIEF_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 1.1, 4.1, 10.4, 15.4, 19.1, 22.4
] as const;

/**
 * Timestamps for the challenge 3 debrief codec (third-challenge-succeded.mp3).
 */
export const CHALLENGE_3_DEBRIEF_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 3.0, 7.4, 13.2, 16.9, 21.3, 25.9
] as const;

/**
 * Timestamps for the challenge 4 debrief codec (fourth-challenge-succeed.mp3).
 */
export const CHALLENGE_4_DEBRIEF_SUBTITLE_TIMESTAMPS: readonly number[] = [
  0.0, 3.1, 7.8, 12.2, 15.0, 18.4, 22.1, 25.4
] as const;
