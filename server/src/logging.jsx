// Firebase Logging System - Restructured for Round-Based Data Collection
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================================================
// STRING TO INTEGER MAPPINGS
// ============================================================================

export const BUTTON_TYPE_MAP = {
  add_vial_1: 1,
  add_vial_2: 2,
  empty_bucket_1: 3,
  empty_bucket_2: 4,
};

export const GAME_VERSION_MAP = {
  one_vial_alternating: 0.1,
  one_vial_always_bucket: 0.2,
  // one_vial_always_bucket_simple: 3,
  // one_vial_always_bucket_simple_fast: 4,
  two_vials_single_bucket: 0.3,
  two_vials_phases: 0.4,
};

export const PHASE_MAP = {
  abundance: 1,
  deprivation: 2,
  none: 0,
};

export const BUTTON_TYPE_REVERSE = Object.fromEntries(
  Object.entries(BUTTON_TYPE_MAP).map(([k, v]) => [v, k]),
);
export const GAME_VERSION_REVERSE = Object.fromEntries(
  Object.entries(GAME_VERSION_MAP).map(([k, v]) => [v, k]),
);
export const PHASE_REVERSE = Object.fromEntries(
  Object.entries(PHASE_MAP).map(([k, v]) => [v, k]),
);

// ============================================================================
// SESSION STATE
// ============================================================================

let currentUserId = null;
let currentSessionId = null;
let sessionStartTime = null;
let lastButtonPressTime = null;
let roundStartTime = null;
let currentRoundNumber = null;
let currentRoundDocId = null;

// Tutorial state
let lastSlideChangeTime = null;

// ============================================================================
// SESSION LIFECYCLE
// ============================================================================

/**
 * Initialize a new game session.
 * Records participant ID (from external URL endpoint), version assignment,
 * and environment metadata.
 *
 * @param {string} userId       - Participant ID from external platform URL param
 * @param {string} gameVersion  - Resolved internal version string
 * @param {boolean} productionMode
 */
export const initializeSession = async (
  userId,
  gameVersion,
  productionMode,
) => {
  currentUserId = userId;
  currentSessionId = `${userId}_${Date.now()}`;
  sessionStartTime = Date.now();
  lastButtonPressTime = null;
  lastSlideChangeTime = null;
  roundStartTime = null;
  currentRoundNumber = null;
  currentRoundDocId = null;

  try {
    // Top-level user record
    const userRef = doc(db, "user_sessions", userId);
    await setDoc(
      userRef,
      {
        userId,
        lastSession: currentSessionId,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // Session document
    const sessionRef = doc(
      db,
      "user_sessions",
      userId,
      "sessions",
      currentSessionId,
    );
    await setDoc(sessionRef, {
      sessionId: currentSessionId,
      startTime: sessionStartTime,
      startTimeFormatted: new Date(sessionStartTime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
        hour12: true,
      }),

      // Participant identity — comes from external platform URL (?pid=)
      participantId: userId,

      // Version assignment
      gameVersion, // human-readable string
      gameVersionCode: GAME_VERSION_MAP[gameVersion] || 0, // integer for analysis

      productionMode: productionMode ? 1 : 0,
    });

    console.log("Session initialized:", currentSessionId);
  } catch (error) {
    console.error("Error initializing session:", error);
  }
};

/**
 * End the current session.
 */
export const endSession = async () => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const sessionRef = doc(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
    );
    await updateDoc(sessionRef, {
      endTime: serverTimestamp(),
      sessionDuration: Date.now() - sessionStartTime,
    });

    console.log("Session ended:", currentSessionId);

    currentSessionId = null;
    currentUserId = null;
    lastButtonPressTime = null;
    lastSlideChangeTime = null;
    roundStartTime = null;
    currentRoundNumber = null;
    currentRoundDocId = null;
  } catch (error) {
    console.error("Error ending session:", error);
  }
};

// ============================================================================
// PRELIM QUESTION (PrelimQuestion component)
// ============================================================================

/**
 * Log the participant's answer(s) to the preliminary platform question.
 * Called from App.js onComplete callback of <PrelimQuestion />.
 *
 * @param {string} answer - Free-text answer entered by participant
 */
export const logPrelimAnswer = async (answer) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const sessionRef = doc(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
    );
    await updateDoc(sessionRef, {
      prelimAnswer: answer,
      prelimAnsweredAt: serverTimestamp(),
      prelimMsSinceSessionStart: Date.now() - sessionStartTime,
    });

    console.log("Prelim answer logged:", answer);
  } catch (error) {
    console.error("Error logging prelim answer:", error);
  }
};

// ============================================================================
// TUTORIAL / INSTRUCTIONS SLIDE NAVIGATION
// ============================================================================

/**
 * Log every slide navigation event in the Tutorial component.
 * Called whenever the participant moves to a new slide (forward or back).
 *
 * @param {object} params
 * @param {number}  params.slideIndex     - 0-based index of the slide now shown
 * @param {string}  params.slideId        - String ID of the slide (e.g. "intro-3")
 * @param {boolean} params.isQuizSlide    - Whether this is a quiz/quizGroup slide
 * @param {string}  params.direction      - "next" | "prev"
 * @param {string}  params.gameVersion    - Current game version
 */
export const logTutorialSlideChange = async ({
  slideIndex,
  slideId,
  isQuizSlide,
  direction,
  gameVersion,
}) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const now = Date.now();
    const msSincePreviousSlide = lastSlideChangeTime
      ? now - lastSlideChangeTime
      : null;
    lastSlideChangeTime = now;

    const slideEventsRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "tutorial_slides",
    );

    await addDoc(slideEventsRef, {
      // slideIndex, // 0-based position in the slide array
      slideNumber: slideIndex + 1, // 1-based for human readability
      // slideId,
      isQuizSlide: isQuizSlide ? 1 : 0,
      direction, // "next" or "prev"
      gameVersion,
      msSincePreviousSlide,
      // msSinceSessionStart: now - sessionStartTime,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging tutorial slide change:", error);
  }
};

/**
 * Log a quiz answer submission inside the tutorial.
 * Called each time the participant clicks "Submit Answer".
 *
 * @param {object} params
 * @param {string}  params.quizId         - ID of the quiz question
 * @param {string}  params.slideId        - Parent slide ID
 * @param {string[]} params.selectedIds   - Option IDs the participant selected
 * @param {boolean} params.isCorrect      - Whether the answer was correct
 * @param {number}  params.attemptNumber  - Which attempt this is (1-based)
 * @param {string}  params.gameVersion
 */
export const logTutorialQuizAnswer = async ({
  quizId,
  slideId,
  selectedIds,
  isCorrect,
  attemptNumber,
  gameVersion,
}) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const quizAnswersRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "tutorial_quiz_answers",
    );

    await addDoc(quizAnswersRef, {
      quizId,
      slideId,
      selectedIds, // array of option IDs chosen
      isCorrect: isCorrect ? 1 : 0,
      attemptNumber,
      gameVersion,
      msSinceSessionStart: Date.now() - sessionStartTime,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging tutorial quiz answer:", error);
  }
};

// ============================================================================
// ROUND LOGGING (shared by training + main game)
// All round documents include isTrainingMode so data is always distinguishable.
// ============================================================================

/**
 * Log the start of a round.
 *
 * @param {number} roundNumber   - 0-based round index from the game
 * @param {object} roundConfig   - Config object from VialGame
 * @param {boolean} isTrainingMode
 */
export const logRoundStart = async (
  roundNumber,
  roundConfig,
  isTrainingMode = false,
) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const roundNumberForStorage = roundNumber + 1; // 1-indexed
    roundStartTime = Date.now();
    currentRoundNumber = roundNumberForStorage;
    lastButtonPressTime = null;

    const msSinceSessionStart = roundStartTime - sessionStartTime;

    const roundData = {
      roundNumber: roundNumberForStorage,
      msSinceSessionStart,
      timestamp: serverTimestamp(),

      // ── Context ──────────────────────────────────────────────────────────
      isTrainingMode: isTrainingMode ? 1 : 0, // 1 = practice, 0 = real experiment
      phase: roundConfig.isTrainingMode, // kept for back-compat if used
      gameVersion: roundConfig.gameVersion || null,

      // ── Round configuration ───────────────────────────────────────────────
      numVials: roundConfig.numVials || 1,
      vial1HasBucket: roundConfig.vial1HasBucket ? 1 : 0,
      vial2HasBucket: roundConfig.vial2HasBucket ? 1 : 0,
      velocity: Math.round(roundConfig.velocity * 100) / 100,
      setpoint: Math.round(roundConfig.setpoint * 100) / 100,

      phaseLabel: roundConfig.phase || "none",
      phaseCode: PHASE_MAP[roundConfig.phase] || 0,

      // ── Initial state ─────────────────────────────────────────────────────
      initialVial1Level: Math.round(roundConfig.initialVial1Level * 100) / 100,
      initialVial2Level: Math.round(roundConfig.initialVial2Level * 100) / 100,
      initialBucket1Level:
        Math.round(roundConfig.initialBucket1Level * 100) / 100,
      initialBucket2Level:
        Math.round(roundConfig.initialBucket2Level * 100) / 100,

      // ── Outcome (filled in by logRoundEnd) ────────────────────────────────
      roundComplete: 0,
      roundSuccessful: null,
      roundEndTime: null,
      roundDuration: null,
    };

    const roundsRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "rounds",
    );

    const roundDoc = await addDoc(roundsRef, roundData);
    currentRoundDocId = roundDoc.id;

    console.log(
      `[${isTrainingMode ? "TRAINING" : "GAME"}] Round ${roundNumberForStorage} started at ${msSinceSessionStart}ms`,
    );
  } catch (error) {
    console.error("Error logging round start:", error);
  }
};

/**
 * Log a button/key press within the current round.
 *
 * @param {string} buttonType  - One of the BUTTON_TYPE_MAP keys
 * @param {object} gameState   - Snapshot of current VialGame state
 * @param {boolean} isTrainingMode
 */
export const logButtonPress = async (buttonType, gameState) => {
  if (!currentUserId || !currentSessionId || !currentRoundDocId) return;

  try {
    const currentTime = Date.now();
    const msSinceRoundStart = roundStartTime
      ? currentTime - roundStartTime
      : null;
    const msSinceLastPress = lastButtonPressTime
      ? currentTime - lastButtonPressTime
      : null;
    lastButtonPressTime = currentTime;

    const pressesRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "rounds",
      currentRoundDocId,
      "button_presses",
    );

    await addDoc(pressesRef, {
      buttonType,
      buttonTypeCode: BUTTON_TYPE_MAP[buttonType] || 0,

      msSinceRoundStart,
      msSinceLastPress,
      timestamp: serverTimestamp(),

      vial1Level: Math.round(gameState.vial1Level * 100) / 100,
      vial2Level: Math.round(gameState.vial2Level * 100) / 100,
      bucket1Level: Math.round(gameState.bucket1Level * 100) / 100,
      bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,
      addAmount: gameState.addAmount || 5,
      roundTimeRemaining: gameState.roundTimeRemaining || 0,
      roundNumber: currentRoundNumber,
      velocity: Math.round(gameState.velocity * 100) / 100,
      setpoint: Math.round(gameState.setpoint * 100) / 100,
    });
  } catch (error) {
    console.error("Error logging button press:", error);
  }
};

/**
 * Log the end of a round.
 *
 * @param {boolean} successful
 * @param {boolean} isTrainingMode
 */
export const logRoundEnd = async (successful, isTrainingMode = false) => {
  if (!currentUserId || !currentSessionId || !currentRoundDocId) return;

  try {
    const roundEndTime = Date.now();
    const roundDuration = roundStartTime ? roundEndTime - roundStartTime : null;

    const roundRef = doc(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "rounds",
      currentRoundDocId,
    );

    await updateDoc(roundRef, {
      roundComplete: 1,
      roundSuccessful: successful ? 1 : 0,
      isTrainingMode: isTrainingMode ? 1 : 0,
      roundEndTime,
      roundDuration,
    });

    console.log(
      `[${isTrainingMode ? "TRAINING" : "GAME"}] Round ${currentRoundNumber}: ${successful ? "SUCCESS" : "FAILURE"}`,
    );
  } catch (error) {
    console.error("Error logging round end:", error);
  }
};

// ============================================================================
// GAME COMPLETION
// ============================================================================

/**
 * Log final experiment completion, including whether the 75% progress goal
 * was reached (which determines the bonus).
 *
 * @param {object} params
 * @param {number}  params.finalScore          - Number of rounds survived
 * @param {number}  params.totalRounds         - Total rounds in the game
 * @param {number}  params.cumulativeProgress  - Final progress percentage (0–100)
 * @param {boolean} params.isTrainingMode      - Should be false; guard just in case
 */
export const logGameCompletion = async ({
  finalScore,
  totalRounds,
  cumulativeProgress,
  isTrainingMode = false,
}) => {
  if (!currentUserId || !currentSessionId) return;

  const BONUS_THRESHOLD = 75; // percent
  const reachedBonusGoal =
    Math.round(cumulativeProgress * 100) / 100 >= BONUS_THRESHOLD;
  try {
    const sessionRef = doc(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
    );

    await updateDoc(sessionRef, {
      completion: {
        finalScore,
        totalRounds,
        cumulativeProgress: Math.round(cumulativeProgress * 100) / 100,
        reachedBonusGoal: reachedBonusGoal ? 1 : 0, // 1 = earned $5 bonus
        bonusThresholdPct: BONUS_THRESHOLD,
        isTrainingMode: isTrainingMode ? 1 : 0,
        completedAt: serverTimestamp(),
        msSinceSessionStart: Date.now() - sessionStartTime,
      },
    });

    console.log(
      `Game complete — progress: ${cumulativeProgress}% — bonus goal ${reachedBonusGoal ? "REACHED" : "NOT reached"}`,
    );
  } catch (error) {
    console.error("Error logging game completion:", error);
  }
};

// ============================================================================
// UTILITY
// ============================================================================

export const getMappings = () => ({
  buttonTypes: { forward: BUTTON_TYPE_MAP, reverse: BUTTON_TYPE_REVERSE },
  gameVersions: { forward: GAME_VERSION_MAP, reverse: GAME_VERSION_REVERSE },
  phases: { forward: PHASE_MAP, reverse: PHASE_REVERSE },
});

export const exportMappingsJSON = () => JSON.stringify(getMappings(), null, 2);
