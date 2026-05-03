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
      participantId: userId,
      gameVersion,
      gameVersionCode: GAME_VERSION_MAP[gameVersion] || 0,
      productionMode: productionMode ? 1 : 0,

      // ── Phase results (filled in later) ──────────────────────────────────
      // instructionsResult: { passed, msSinceSessionStart, timestamp }
      // trainingResult:     { passed, roundsSurvived, totalRounds, msSinceSessionStart, timestamp }
      // termination:        { reason, stage, msSinceSessionStart, timestamp }
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
// PHASE RESULTS  (instructions + training)
// ============================================================================

/**
 * Log whether the participant passed or failed the instructions quiz.
 * Call this in App.jsx from handleInstructionsDisqualified (passed=false)
 * and from handleTutorialComplete (passed=true).
 *
 * @param {boolean} passed
 */
export const logInstructionsResult = async (passed) => {
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
      instructionsResult: {
        passed: passed ? 1 : 0,
        msSinceSessionStart: Date.now() - sessionStartTime,
        timestamp: serverTimestamp(),
      },
    });
    console.log(`Instructions result: ${passed ? "PASSED" : "FAILED"}`);
  } catch (error) {
    console.error("Error logging instructions result:", error);
  }
};

/**
 * Log the outcome of the training phase.
 * Call this in TrainingPhase.jsx / App.jsx when training ends.
 *
 * @param {boolean} passed            - Whether they met the survival threshold
 * @param {number}  roundsSurvived    - How many rounds they survived
 * @param {number}  totalRounds       - Total training rounds attempted
 */
export const logTrainingResult = async (
  passed,
  roundsSurvived,
  totalRounds,
) => {
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
      trainingResult: {
        passed: passed ? 1 : 0,
        roundsSurvived,
        totalRounds,
        survivalRate:
          totalRounds > 0
            ? Math.round((roundsSurvived / totalRounds) * 100) / 100
            : 0,
        msSinceSessionStart: Date.now() - sessionStartTime,
        timestamp: serverTimestamp(),
      },
    });
    console.log(
      `Training result: ${passed ? "PASSED" : "FAILED"} — ${roundsSurvived}/${totalRounds} rounds survived`,
    );
  } catch (error) {
    console.error("Error logging training result:", error);
  }
};

// ============================================================================
// TERMINATION LOGGING
// ============================================================================

/**
 * Log an experiment termination event to the session document.
 * Call this before any redirect that ends the experiment early.
 *
 * @param {string} reason
 *   One of: "tab_switch" | "reload" | "instructions_failed" | "training_failed"
 * @param {string} stage
 *   One of: "instructions" | "training" | "main_game"
 */
export const logTermination = async (reason, stage) => {
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
      termination: {
        reason, // why they were terminated
        stage, // which stage they were at
        msSinceSessionStart: Date.now() - sessionStartTime,
        timestamp: serverTimestamp(),
      },
    });
    console.log(`Termination logged: reason=${reason} stage=${stage}`);
  } catch (error) {
    console.error("Error logging termination:", error);
  }
};

// ============================================================================
// PRELIM QUESTION
// ============================================================================

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
      slideNumber: slideIndex + 1,
      isQuizSlide: isQuizSlide ? 1 : 0,
      direction,
      gameVersion,
      msSincePreviousSlide,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging tutorial slide change:", error);
  }
};

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
      selectedIds,
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
// ROUND LOGGING
// ============================================================================

export const logRoundStart = async (
  roundNumber,
  roundConfig,
  isTrainingMode = false,
) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const roundNumberForStorage = roundNumber + 1;
    roundStartTime = Date.now();
    currentRoundNumber = roundNumberForStorage;
    lastButtonPressTime = null;

    const msSinceSessionStart = roundStartTime - sessionStartTime;

    const roundData = {
      roundNumber: roundNumberForStorage,
      msSinceSessionStart,
      timestamp: serverTimestamp(),

      isTrainingMode: isTrainingMode ? 1 : 0,
      phase: roundConfig.isTrainingMode,
      gameVersion: roundConfig.gameVersion || null,

      numVials: roundConfig.numVials || 1,
      vial1HasBucket: roundConfig.vial1HasBucket ? 1 : 0,
      vial2HasBucket: roundConfig.vial2HasBucket ? 1 : 0,
      velocity: Math.round(roundConfig.velocity * 100) / 100,
      setpoint: Math.round(roundConfig.setpoint * 100) / 100,

      phaseLabel: roundConfig.phase || "none",
      phaseCode: PHASE_MAP[roundConfig.phase] || 0,

      initialVial1Level: Math.round(roundConfig.initialVial1Level * 100) / 100,
      initialVial2Level: Math.round(roundConfig.initialVial2Level * 100) / 100,
      initialBucket1Level:
        Math.round(roundConfig.initialBucket1Level * 100) / 100,
      initialBucket2Level:
        Math.round(roundConfig.initialBucket2Level * 100) / 100,

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
 * CHANGED: gameState now accepts `gasStationActive` (boolean).
 * Pass it from VialGame like: { ...getCurrentState(), gasStationActive: !isAddingDisabled }
 *
 * @param {string} buttonType
 * @param {object} gameState  — now includes gasStationActive
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

      // NEW: whether the gas station was active at the moment of the press
      // true  = participant had free access to gloop (green pump)
      // false = access was restricted (grey pump)
      gasStationActive: gameState.gasStationActive === true ? 1 : 0,
    });
  } catch (error) {
    console.error("Error logging button press:", error);
  }
};

// ============================================================================
// GAS STATION TOGGLE EVENTS  (new)
// ============================================================================

/**
 * Log each time the gas station turns on or off.
 * Call this in VialGame.jsx inside the useEffect that watches isAddingDisabled.
 *
 * Stored as a session-level subcollection so you can reconstruct the full
 * availability timeline independent of button presses.
 *
 * @param {boolean} isNowActive   - true = pump just turned GREEN, false = just turned GREY
 * @param {string}  isTrainingMode
 */
export const logGasStationToggle = async (
  isNowActive,
  isTrainingMode = false,
  isRoundStart = false, // add this parameter
) => {
  if (!currentUserId || !currentSessionId) return;
  try {
    const eventsRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "gas_station_events",
    );

    await addDoc(eventsRef, {
      isNowActive: isNowActive ? 1 : 0,
      isRoundStart: isRoundStart ? 1 : 0, // add this field
      roundNumber: currentRoundNumber,
      roundDocId: currentRoundDocId,
      isTrainingMode: isTrainingMode ? 1 : 0,
      msSinceSessionStart: Date.now() - sessionStartTime,
      msSinceRoundStart: roundStartTime ? Date.now() - roundStartTime : null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging gas station toggle:", error);
  }
};
// export const logGasStationToggle = async (
//   isNowActive,
//   isTrainingMode = false,
// ) => {
//   if (!currentUserId || !currentSessionId) return;
//   try {
//     const eventsRef = collection(
//       db,
//       "user_sessions",
//       currentUserId,
//       "sessions",
//       currentSessionId,
//       "gas_station_events",
//     );

//     await addDoc(eventsRef, {
//       isNowActive: isNowActive ? 1 : 0, // 1 = turned on, 0 = turned off
//       roundNumber: currentRoundNumber,
//       roundDocId: currentRoundDocId,
//       isTrainingMode: isTrainingMode ? 1 : 0,
//       msSinceSessionStart: Date.now() - sessionStartTime,
//       msSinceRoundStart: roundStartTime ? Date.now() - roundStartTime : null,
//       timestamp: serverTimestamp(),
//     });
//   } catch (error) {
//     console.error("Error logging gas station toggle:", error);
//   }
// };

// ============================================================================
// TAB VISIBILITY EVENTS  (new)
// ============================================================================

/**
 * Log each time the participant hides or shows the tab.
 * Call this from the visibilitychange handler in App.jsx.
 *
 * @param {"hidden"|"visible"} visibilityState
 * @param {string} stage   - "instructions" | "training" | "main_game"
 */
export const logTabVisibilityChange = async (visibilityState, stage) => {
  if (!currentUserId || !currentSessionId) return;
  try {
    const eventsRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "tab_events",
    );

    await addDoc(eventsRef, {
      visibilityState, // "hidden" or "visible"
      stage, // which part of the experiment
      roundNumber: currentRoundNumber,
      msSinceSessionStart: Date.now() - sessionStartTime,
      msSinceRoundStart: roundStartTime ? Date.now() - roundStartTime : null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging tab visibility change:", error);
  }
};

// ============================================================================
// ROUND END
// ============================================================================

export const logRoundEnd = async (
  successful,
  isTrainingMode = false,
  cumulativeProgress = null,
) => {
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
      cumulativeProgress:
        cumulativeProgress !== null // add this
          ? Math.round(cumulativeProgress * 100) / 100
          : null,
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

export const logGameCompletion = async ({
  finalScore,
  totalRounds,
  cumulativeProgress,
  isTrainingMode = false,
}) => {
  if (!currentUserId || !currentSessionId) return;

  const BONUS_THRESHOLD = 75;
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
        reachedBonusGoal: reachedBonusGoal ? 1 : 0,
        bonusThresholdPct: BONUS_THRESHOLD,
        isTrainingMode: isTrainingMode ? 1 : 0,
        completedAt: serverTimestamp(),
        msSinceSessionStart: Date.now() - sessionStartTime,
      },
    });

    console.log(
      `Game complete — progress: ${cumulativeProgress}% — bonus goal ${reachedBonusGoal ? "REACHED" : "NOT reached"}`,
    );
    return { reachedBonusGoal };
  } catch (error) {
    console.error("Error logging game completion:", error);
    return { reachedBonusGoal };
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
