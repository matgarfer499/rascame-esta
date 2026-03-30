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
  introStartButton: "INICIAR OPERACIÓN",

  // -- Codec --
  codecTitle: "CODEC",
  codecFrequencyLabel: "FREQ",
  codecIncomingCall: "TRANSMISIÓN ENTRANTE",
  codecAnswerCall: "RESPONDER",
  codecEndTransmission: "FIN DE TRANSMISIÓN",
  codecSpeaker: "SNAKE",
  codecMemoryLabel: "MEMORY",
  codecCallIndicator: "CALL",

  // -- Intro subtitles (synced to intro-message.mp3 audio) --
  introSubtitles: [
    "Escuchadme bien... Cristóbal... Miguel...",
    "Aquí Snake. ¿Me recibís?",
    "Me han informado de que vuestro objetivo de cumpleaños está oculto en este muro.",
    "Parece una trampa de Foxhound, pero no os confiéis.",
    "Hay cien expedientes con códigos de PlayStation",
    "pero solo nueve de ellos son el paquete real, con un valor de diez euros cada uno.",
    "El resto, son señuelos, pura basura tecnológica.",
    "Si queréis vuestra recompensa, tendréis que esforzaros.",
    "No servirán de nada las nanomáquinas ni esconderse en una caja de cartón esta vez.",
    "Manteneos a la escucha",
    "Volveré a ponerme en contacto por esta frecuencia para ayudaros con la misión.",
    "Buena suerte a los dos",
    "Esto no es un entrenamiento.",
    "Corto y cierro.",
  ],

  // -- Challenge 1 subtitles (synced to first-challenge.mp3 audio) --
  challenge1Subtitles: [
    "¿Pero qué? La frecuencia se esta volviendo loca",
    "Cristóbal, Miguel ¿Me recibís?",
    "Siento una presencia extraña en la línea",
    "Es como si alguien estuviera leyendo vuestros impulsos cerebrales.",
    "Parece que Psycho Mantis ha bloqueado el acceso a los expedientes reales",
    "Con un escudo mental.",
    "Para reducir esa montaña de basura tecnológica",
    "Tendréis que enfrentaros a un escaneo de datos",
    "Un cuestionario sobre vuestro propio equipo de apoyo",
    "Vuestro grupo de amigos.",
    "Solo los recuerdos compartidos pueden romper esta interferencia.",
    "Responded con precisión... u os quedaréis atrapados en este bucle de códigos falsos para siempre.",
    "No dejéis que Mantis controle vuestra mente",
    "Volveré a contactar cuando hayáis despejado la zona.",
    "Corto y cierro.",
  ],

  // -- Challenge 2 subtitles (synced to second-challenge.mp3 audio) --
  challenge2Subtitles: [
    "¡Cristóbal! ¡Miguel! ¡Mantened la calma!",
    "Parece que habéis caído en una emboscada de Revolver Ocelot.",
    "El sistema ha bloqueado los siguientes expedientes con un sensor de frecuencia de voz",
    "Y la única forma de romperlo es gritando.",
    "Escuchadme bien",
    "Ocelot quiere ver si tenéis la resistencia necesaria para ser soldados de élite.",
    "Tenéis que pronunciar esas frases con la R",
    "Y tenéis que hacerlo lo más fuerte posible.",
    "¡Que se enteren en toda la base!",
    "Si no gritáis con fuerza...", 
    "El interrogatorio no terminará nunca y los códigos de PlayStation se perderán para siempre.",
    "No hay opción de rendirse... En esta misión no existe el botón de 'Continuar'.",
    "¡Cumplid con vuestro deber! Corto y cierro.",
  ],

  // -- Challenge 3 subtitles (synced to third-challenge.mp3 audio) --
  challenge3Subtitles: [
    "¡Cristóbal! ¡Miguel! ¡Deteneos justo donde estáis!",
    "Habéis entrado en un sector minado", 
    "Y el radar Soliton está sufriendo interferencias.",
    "Para limpiar este muro de expedientes falsos, vais a tener que memorizar el patrón de desactivación",
    "Paso a paso.",
    "Es como seguir a Meryl a través del campo de nieve",
    "Un solo error en la secuencia y todo saltará por los aires.",
    "Tenéis tres intentos",
    "Tres oportunidades para demostrar que vuestra memoria es más rápida que los sensores térmicos de Foxhound.",
    "Si falláis las tres veces", 
    "La misión se abortará y perderéis el rastro de esos códigos de PlayStation para siempre.",
    "Concentraos", 
    "Visualizad el patrón y repetidlo sin dudar.",
    "No dejéis que la presión os supere.",
    "Cambio y corto.",
  ],

    // -- Challenge 4 intro subtitles (synced to fourth-challenge.mp3 audio) --
  challenge4Subtitles: [
    "Cristóbal... Miguel... Atendedme bien. ",
    "No hay vuelta atrás.",
    "Líquid ha tomado el control del sistema central y está bloqueando los últimos expedientes.",
    "Para liberar esos códigos de diez euros", 
    "Vais a tener que luchar como uno solo.",
    "Escuchadme... Líquid no es un enemigo común.",
    "Va a usar distracciones", 
    "Va a intentar sabotear vuestros terminales y recuperará fuerzas si dudáis.",
    "Olvidaos de las nanomáquinas", 
    "Aquí solo importa vuestra coordinación.",
    "Es el momento de demostrar que vuestros genes son superiores.",
    "Atacad ahora. No le deis ni un segundo de respiro.",
    "¡Acabad con esto de una vez!",
  ],

  // -- Challenge debrief subtitles (per-challenge, synced to individual debrief audios) --

  challenge1DebriefSubtitles: [
    "Buen trabajo",
    "La presencia de Mantis se desvanece.",
    "Habéis demostrado que vuestros vínculos son reales y el escaneo de memoria ha confirmado vuestra identidad.",
    "El muro de expedientes falsos está empezando a caer",
    "Pero no os relajéis. Esto acaba de empezar.",
    "Manteneos alerta para el siguiente punto de inserción.",
    "Corto y cierro.",
  ],

  challenge2DebriefSubtitles: [
    "¡Increíble!",
    "Ocelot no ha podido doblegar vuestra voluntad.",
    "Esos gritos han roto la frecuencia de seguridad y los expedientes falsos están siendo eliminados del sistema.",
    "Habéis demostrado tener los pulmones y la determinación de un soldado de élite.",
    "Tomaos un respiro... pero solo un segundo.",
    "La misión continúa. Cambio y corto.",
  ],

  challenge3DebriefSubtitles: [
    "Habéis cruzado el campo de minas sin un solo rasguño.",
    "Vuestra capacidad de observación y memoria es digna de la unidad Foxhound.",
    "Los datos se están filtrando correctamente y ya estamos más cerca de esos códigos de PlayStation.",
    "Habéis salvado a vuestro equipo de una explosión segura",
    "Pero la fase final está cerca.",
    "No bajéis la guardia. Corto y cierro.",
  ],

  challenge4DebriefSubtitles: [
    "Se acabó... Líquid ha caído.",
    "El sistema está limpio y el muro de expedientes falsos ha sido neutralizado.",
    "Buen trabajo, soldados... vuestra coordinación ha sido impecable.",
    "Los nueve expedientes reales están desbloqueados.",
    "Ya podéis reclamar vuestra recompensa de noventa euros.",
    "No ha sido fácil, pero habéis demostrado de qué pasta estáis hechos.",
    "Disfrutad de vuestro botín... os lo habéis ganado.",
  ],

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
  challengeDebriefAction: "ELIMINAR EXPEDIENTES",
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
    "Tendréis que repetir trabalenguas llenos de ERRES a gritos. El micrófono será vuestro juez.",
  "challenge.memory.name": "MEMORIA GEMELA",
  "challenge.memory.description":
    "Recordad la secuencia correcta. Vuestra memoria compartida será puesta a prueba.",
  "challenge.boss.name": "LIQUID FINAL",
  "challenge.boss.description":
    "El jefe final. Liquid ha tomado el control del sistema. Golpead, gritad, resistid y guardad silencio... todo a la vez. No hay rendición posible.",

  // -- Trivia specific --
  triviaTitle: "TRIVIA GEMELA",
  triviaQuestion: "Pregunta",

  // -- Confession specific --
  confessionTitle: "LA CONFESIÓN",
  confessionVolumeLabel: "VOLUMEN",
  confessionLouder: "¿Ha dicho Hidiogeno?",
  confessionIsAllYouGot: "¿Eso es una R o un estornudo?",
  confessionGrandmaLouder: "Mi abuela rrrruge más fuerte",

  // -- Memory specific --
  memoryTitle: "MEMORIA GEMELA",
  memoryRound: "RONDA",
  memoryTrollRoundLabel: "RONDA FINAL",
  memoryTrollMessage:
    "Que era de coña chavales, no sus ralleis que pasasteis el reto",
  memoryAttempts: "INTENTOS",

  // -- Boss specific --
  bossTitle: "LIQUID FINAL",
  bossHpLabel: "LIQUID",
  bossPhase1: "FASE 1 — TANTEO",
  bossPhase2: "FASE 2 — SE ENFADA",
  bossPhase3: "FASE 3 — DESESPERACIÓN",
  bossFailures: "FALLOS",
  bossFingerHere: "DEDO AQUÍ",
  bossStability: "ESTABILIDAD",

  // Boss action names
  bossDoubleStrike: "¡GOLPE DOBLE!",
  bossDoubleStrikeHint: "¡AMBOS! Tocad vuestra zona ¡YA!",
  bossWarCry: "¡GRITO DE GUERRA!",
  bossWarCryHint: "¡GRITAD CON TODA VUESTRA ALMA!",
  bossHoldPosition: "¡POSICIÓN FIRME!",
  bossHoldPositionHint: "Dedos en las zonas. No. Os. Mováis.",
  bossQuickCombo: "¡COMBO RÁPIDO!",
  bossQuickComboHint: "¡Tocad las dianas en orden!",
  bossTacticalSilence: "¡SILENCIO TÁCTICO!",
  bossTacticalSilenceHint: "Ni. Un. Ruido.",

  // Boss flow messages
  bossPrepare: "PREPARAOS...",
  bossCounterattack: "¡CONTRAATAQUE!",
  bossRecovering: "LIQUID SE RECUPERA...",
  bossDamageDealt: "¡DAÑO INFLIGIDO!",
  bossActionFailed: "¡HABÉIS FALLADO!",
  bossDefeated: "¡LIQUID DERROTADO!",

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
