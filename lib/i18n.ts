// =============================================================================
// i18n - All user-facing Spanish strings
// Centralized here so code never contains inline Spanish text.
// =============================================================================

export const UI = {
  // -- App title & branding --
  appName: "RÁSCAME ESTA",
  operationSubtitle: "OPERACIÓN EN CURSO",

  // -- Twin names --
  twin1: "CRISTÓBAL",
  twin2: "MIGUEL",
  twinsBoth: "CRISTÓBAL & MIGUEL",

  // -- HUD --
  hudCodes: "CÓDIGOS",
  hudRemaining: "RESTANTES",

  // -- Intro screen --
  introTransmission: "> TRANSMISIÓN ENTRANTE...",
  introSender: "> REMITENTE:",
  introRecipients: "> DESTINATARIOS: CRISTÓBAL / MIGUEL",
  introEndTransmission: "> FIN DE TRANSMISIÓN",
  introStartButton: "INICIAR OPERACIÓN",

  // -- Intro message (PLACEHOLDER - replace with your personal message) --
  introMessage: [
    '"Ey, imbéciles. Vuestro regalo',
    "de cumpleaños está escondido",
    "en algún sitio de este muro.",
    "9 códigos PSN de 10€ entre",
    "100 tarjetas. El resto son",
    'basura. Buena suerte."',
  ],
  introSenderName: "TU NOMBRE AQUÍ", // PLACEHOLDER

  // -- Wall / Grid --
  wallTitle: "MURO DEL DESTINO",
  cardLabel: "Nº",
  cardClassified: "CLASIFICADO",
  cardEliminated: "ELIMINADO",

  // -- Scratch screen --
  scratchTitle: "EXPEDIENTE",
  scratchProgress: "DESCUBIERTO",
  scratchInstruction: "Rasca hasta el 85% para revelar el código",
  scratchClose: "CERRAR",

  // -- Code reveal --
  codeRevealed: "CÓDIGO DESCLASIFICADO",
  codeFadeWarning: "SE DESVANECE EN:",
  codeInstruction:
    "Introduce este código en PlayStation Store para verificar su autenticidad",
  codeBackToWall: "VOLVER AL MURO",
  codeWorked: "¡FUNCIONÓ!",
  codeDidNotWork: "NO FUNCIONÓ",

  // -- Challenges --
  challengeAvailable: "⚠ DESAFÍO DISPONIBLE ⚠",
  challengePrefix: "DESAFÍO",
  challengeOf: "DE",
  challengeAccept: "ACEPTAR DESAFÍO",
  challengeBackCoward: "Volver al muro (cobarde)",
  challengeEliminate: "se eliminarán",
  challengeFakeCards: "tarjetas falsas del muro",
  challengeFailWarning: "Si falláis... tendréis que esperar",
  challengeFailSeconds: "segundos de vergüenza",
  challengeComplete: "¡DESAFÍO COMPLETADO!",
  challengeFailed: "HABÉIS FALLADO",

  // -- Challenge names --
  "challenge.trivia.name": "TRIVIA GEMELA",
  "challenge.trivia.description":
    "Demostrad cuánto sabéis el uno del otro. Pantalla dividida, cada uno responde sobre su gemelo.",
  "challenge.confession.name": "LA CONFESIÓN",
  "challenge.confession.description":
    "Tendréis que hacer algo vergonzoso en voz alta. El micrófono será vuestro juez.",
  "challenge.memory.name": "MEMORIA GEMELA",
  "challenge.memory.description":
    "Recordad la secuencia correcta. Vuestra memoria compartida será puesta a prueba.",
  "challenge.boss.name": "AGUANTE DUAL",
  "challenge.boss.description":
    "El jefe final. Dos dedos, cero movimiento, máxima concentración. No. Os. Mováis.",

  // -- Trivia specific --
  triviaTitle: "TRIVIA GEMELA",
  triviaQuestion: "Pregunta",

  // -- Confession specific --
  confessionTitle: "LA CONFESIÓN",
  confessionVolumeLabel: "VOLUMEN",
  confessionLouder: "¡MÁS FUERTE, COBARDES!",
  confessionIsAllYouGot: "¿Eso es todo?",
  confessionGrandmaLouder: "Mi abuela grita más",

  // -- Memory specific --
  memoryTitle: "MEMORIA GEMELA",
  memoryRound: "RONDA",

  // -- Boss specific --
  bossTitle: "AGUANTE DUAL",
  bossFingerHere: "DEDO AQUÍ",
  bossStability: "ESTABILIDAD",
  bossDontMove: "NO. OS. MOVÁIS.",

  // -- Shame timer --
  shamePenalty: "PENALIZACIÓN POR INCOMPETENCIA",
  shameRetry: "REINTENTO EN:",
  shameMessages: [
    "Cristóbal, eso ha sido patético",
    "Miguel, mi abuela tiene mejor memoria",
    "Entre los dos no completáis una neurona",
    "¿De verdad sois gemelos? No compartís ni la inteligencia",
    "Esto es vergonzoso incluso para vosotros",
  ],

  // -- Elimination --
  eliminationTitle: "ELIMINANDO EXPEDIENTES FALSOS",

  // -- Resume screen --
  resumeTitle: "⚠ OPERACIÓN INTERRUMPIDA ⚠",
  resumeDetected: "> Sesión activa detectada",
  resumeStatus: "> Estado actual:",
  resumeCodesConfirmed: "CÓDIGOS CANJEADOS:",
  resumeCardsRemaining: "TARJETAS RESTANTES:",
  resumeChallengesCompleted: "DESAFÍOS COMPLETADOS:",
  resumeButton: "RETOMAR OPERACIÓN",
  resumeRestart: "Abandonar y empezar de nuevo (cobarde)",

  // -- Victory screen --
  victoryTitle: "★ OPERACIÓN COMPLETADA ★",
  victoryStatus: "ESTADO: ÉXITO",
  victoryCodes: "CÓDIGOS:",
  victoryTime: "TIEMPO:",
  victoryCodesListTitle: "TUS CÓDIGOS PSN",

  // -- Victory message (PLACEHOLDER - replace with your personal message) --
  victoryMessage:
    "PLACEHOLDER: Tu mensaje personal de feliz cumpleaños va aquí. Hazlo emotivo, contrasta con toda la crueldad anterior.",
  victorySender: "TU NOMBRE AQUÍ", // PLACEHOLDER
  victoryHappyBirthday: "Feliz Cumpleaños",

  // -- Access denied --
  accessDenied: "ACCESO DENEGADO",
  accessDeniedMessage: "No tienes autorización, soldado.",

  // -- Idle warning --
  idleWarning: "¿Os habéis rendido ya?",

  // -- Landscape warning --
  landscapeWarning: "VUELVE A POSICIÓN VERTICAL, SOLDADO",

  // -- Sound toggle --
  soundOn: "🔊",
  soundOff: "🔇",

  // -- Generic --
  loading: "CARGANDO...",
  error: "ERROR DE SISTEMA",
  seconds: "s",
} as const;

/** Type-safe key accessor */
export type UIKey = keyof typeof UI;
