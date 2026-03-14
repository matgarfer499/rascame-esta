// =============================================================================
// Content - Personal content placeholders
// Fill these in before launching the app.
// =============================================================================

import type { DistractionItem, MemoryTile, TriviaQuestion } from "./types";

/**
 * Trivia questions for the Twin Trivia challenge.
 * Each question is answered by the opposite twin (targetTwin answers about the other).
 * You need 5-8 questions per twin (10-16 total).
 */
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // -- Questions for Cristóbal to answer (about Miguel) --
  {
    id: 1,
    question: "PLACEHOLDER: ¿Cuál es la mayor vergüenza de Miguel?",
    options: ["Opción A", "Opción B", "Opción C"],
    correctIndex: 0,
    targetTwin: "cristobal",
  },
  {
    id: 2,
    question: "PLACEHOLDER: ¿Qué dijo Miguel cuando...?",
    options: ["Opción A", "Opción B", "Opción C"],
    correctIndex: 1,
    targetTwin: "cristobal",
  },
  {
    id: 3,
    question: "PLACEHOLDER: ¿Cuál es la comida favorita de Miguel?",
    options: ["Opción A", "Opción B", "Opción C"],
    correctIndex: 2,
    targetTwin: "cristobal",
  },
  // -- Questions for Miguel to answer (about Cristóbal) --
  {
    id: 4,
    question: "PLACEHOLDER: ¿Cuál es la mayor vergüenza de Cristóbal?",
    options: ["Opción A", "Opción B", "Opción C"],
    correctIndex: 0,
    targetTwin: "miguel",
  },
  {
    id: 5,
    question: "PLACEHOLDER: ¿Qué dijo Cristóbal cuando...?",
    options: ["Opción A", "Opción B", "Opción C"],
    correctIndex: 1,
    targetTwin: "miguel",
  },
  {
    id: 6,
    question: "PLACEHOLDER: ¿Cuál es la comida favorita de Cristóbal?",
    options: ["Opción A", "Opción B", "Opción C"],
    correctIndex: 2,
    targetTwin: "miguel",
  },
];

/**
 * Dares/prompts for the Confession Booth challenge.
 * Players must perform these out loud while the microphone listens.
 * Order matters: if they fail, the NEXT dare is shown (escalating embarrassment).
 */
export const CONFESSION_DARES: string[] = [
  "Los dos tenéis que cantar el Cumpleaños Feliz a vosotros mismos EN VOZ ALTA",
  "PLACEHOLDER: Un dare más vergonzoso que el anterior",
  "PLACEHOLDER: El dare más vergonzoso de todos",
];

/**
 * Memory tiles for the Memory Lane challenge.
 * 9 tiles with inside joke references. Can include text and optional images.
 */
export const MEMORY_TILES: MemoryTile[] = [
  { id: 1, text: "PLACEHOLDER: Referencia #1" },
  { id: 2, text: "PLACEHOLDER: Referencia #2" },
  { id: 3, text: "PLACEHOLDER: Referencia #3" },
  { id: 4, text: "PLACEHOLDER: Referencia #4" },
  { id: 5, text: "PLACEHOLDER: Referencia #5" },
  { id: 6, text: "PLACEHOLDER: Referencia #6" },
  { id: 7, text: "PLACEHOLDER: Referencia #7" },
  { id: 8, text: "PLACEHOLDER: Referencia #8" },
  { id: 9, text: "PLACEHOLDER: Referencia #9" },
];

/**
 * Distracting content for the Boss (Dual Hold) challenge.
 * Shown while twins must hold still. Designed to make them laugh and fail.
 */
export const DISTRACTION_CONTENT: DistractionItem[] = [
  { type: "text", content: "PLACEHOLDER: Frase graciosa #1" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #2" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #3" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #4" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #5" },
];
