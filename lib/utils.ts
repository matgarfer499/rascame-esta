// =============================================================================
// Utilities - Shared helper functions
// =============================================================================

import { clsx, type ClassValue } from "clsx";

/** Merge Tailwind classes with clsx (avoids template literal class merging) */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Generate a fake PSN code in the format XXXX-XXXX-XXXX.
 * Uses characters that are intentionally ambiguous (0/O, 1/I, etc).
 */
export function generateFakeCode(chars: string): string {
  const blocks: string[] = [];
  for (let b = 0; b < 3; b++) {
    let block = "";
    for (let c = 0; c < 4; c++) {
      block += chars[Math.floor(Math.random() * chars.length)];
    }
    blocks.push(block);
  }
  return blocks.join("-");
}

/** Format seconds as MM:SS */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Pad a number with leading zeros (e.g., 7 → "007") */
export function padNumber(n: number, length: number = 3): string {
  return String(n).padStart(length, "0");
}

/** Shuffle an array in place (Fisher-Yates) */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Generate a random UUID-like string for session IDs */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Delay execution for a given number of milliseconds */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
