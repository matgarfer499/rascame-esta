// =============================================================================
// Content - Personal content placeholders
// Fill these in before launching the app.
// =============================================================================

import type { DistractionItem, MemoryTile, TriviaQuestion } from "./types";

/**
 * Trivia questions for the Twin Trivia challenge.
 * All 10 questions are shown each round. Need 7/10 correct to pass.
 */
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: "¿Qué ojo tiene vago Millán?",
    options: ["El izquierdo", "El derecho", "El del culo"],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "¿Cuál es la fruta favorita de Jamele?",
    options: ["Melondi", "Plátano", "Mandarina (ref. Marina)"],
    correctIndex: 2,
  },
  {
    id: 3,
    question: "¿Qué pasó en la feria de 2022?",
    options: [
      "Matías y Fali pillaron un ciego histórico y tuvieron que irse",
      "Jamele se subió a la Noria borracho y vomitó en el cacharro",
      "Mateo se lió con Millán",
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    question: "¿Qué apuesta hicieron Mateo y Millán durante 2025, con un kebab de premio?",
    options: [
      "El Málaga subía a primera",
      "Quién levantaría más peso en el gym a final de año",
      "Millán se liaba con una tía",
    ],
    correctIndex: 2,
  },
  {
    id: 5,
    question: "¿Tenéis el pene igual de grande por ser gemelos o son tamaños diferentes?",
    options: ["Sí", "No", "Pa k kieres saber eso, ja ja saludos"],
    correctIndex: 2,
  },
  {
    id: 6,
    question: "¿Cuál ha sido el juego de finales de 2025 y comienzos de 2026 que más hemos viciado?",
    options: [
      "El impostor hecho por MatíPro",
      "El teto",
      "El imán",
    ],
    correctIndex: 0,
  },
  {
    id: 7,
    question: "¿De qué está sirviendo Fali actualmente por el país?",
    options: [
      "Nada, está viviendo del cuento",
      "Tropa",
      "De recoge pelotas",
    ],
    correctIndex: 1,
  },
  {
    id: 8,
    question: "¿Qué se lesiona más Meléndez?",
    options: [
      "La rodilla",
      "La muñeca",
      "Todo, es un puto muñeco de cristal",
    ],
    correctIndex: 2,
  },
  {
    id: 9,
    question: "¿Qué es más probable: que Mateo llegue un día puntual o que Millán ahorre lo que gana?",
    options: [
      "Que Mateo llegue puntual",
      "Que Millán ahorre dinero",
      "Esta gente no vale pa na, son unos desgraciados",
    ],
    correctIndex: 2,
  },
  {
    id: 10,
    question: "¿Quién se va a quedar primero calvo del grupo?",
    options: ["Matías", "Miguel", "Millán"],
    correctIndex: 0,
  },
];

/**
 * Dares/prompts for the Confession Booth challenge.
 * Players must perform these out loud while the microphone listens.
 * Order matters: if they fail, the NEXT dare is shown (escalating embarrassment).
 */
export const CONFESSION_DARES: string[] = [
  "El perro de San Roque no tiene rabo porque Ramón Ramírez se lo ha robado",
  "Erre con erre guitarra, erre con erre barril, rápido ruedan los carros al ferrocarril",
  "Tres tristes tigres robaron treinta y tres raciones de arroz rojo del refrigerador de Ramiro Rodríguez",
  "Me he comprado un Ferrari rojo de hierro"
];

/**
 * Memory tiles for the Memory Lane challenge.
 * 9 tiles with inside joke references. Can include text and optional images.
 */
export const MEMORY_TILES: MemoryTile[] = [
  { id: 1, text: "MIGUEL" },
  { id: 2, text: "CRISTONAL" },
  { id: 3, text: "JAMELE" },
  { id: 4, text: "MATIAS" },
  { id: 5, text: "MATEO" },
  { id: 6, text: "MILLAN" },
  { id: 7, text: "FALI" },
  { id: 8, text: "PAMPLONA" },
  { id: 9, text: "ERNESTO" },
];

/**
 * Distracting content for the Boss (Liquid Final) challenge.
 * Shown during tactical silence phases to make twins laugh and fail.
 * PLACEHOLDER — replace with real inside jokes about the twins.
 */
export const DISTRACTION_CONTENT: DistractionItem[] = [
  { type: "text", content: "PLACEHOLDER: Frase graciosa #1" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #2" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #3" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #4" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #5" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #6" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #7" },
  { type: "text", content: "PLACEHOLDER: Frase graciosa #8" },
];
