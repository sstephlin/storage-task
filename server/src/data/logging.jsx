import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { VERSION_CODE_MAP } from "./participantConfig";

// ============================================================================
// STRING TO INTEGER MAPPINGS
// ============================================================================

export const BUTTON_TYPE_MAP = {
  add_vial_1: 1,
  add_vial_2: 2,
  empty_bucket_1: 3,
  empty_bucket_2: 4,
};
/**
 * Reverse mapping of button types for easy lookup.
 * This allows you to get the button type string (e.g., "add_vial_1") from the code (e.g., 1).
 * Used to export the mapping as JSON for use in data analysis.
 */
export const BUTTON_TYPE_REVERSE = Object.fromEntries(
  Object.entries(BUTTON_TYPE_MAP).map(([k, v]) => [v, k]),
);
/**
 * Reverse mapping of game versions for easy lookup.
 * This allows you to get the version code (e.g., 0.1) from the version name (e.g., "one_vial_alternating").
 */
export const GAME_VERSION_MAP = Object.fromEntries(
  Object.entries(VERSION_CODE_MAP).map(([code, name]) => [name, Number(code)]),
);

export const GAME_VERSION_REVERSE = VERSION_CODE_MAP;

export const PHASE_MAP = {
  abundance: 1,
  deprivation: 2,
  none: 0,
};

/**
 * Reverse mapping of phase mapping  for easy lookup.
 * Used to export the mapping as JSON for use in data analysis.
 */
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
 * logs session ID, session start time, participant ID, game version, game version code and production mode.
 */
// maaybe take out production mode 5/18
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
    });

    console.log("Session initialized:", currentSessionId);
  } catch (error) {
    console.error("Error initializing session:", error);
  }
};

/**
 * End the current session.
 * Logs end time and session duration, and resets session state variables.
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
 * Log whether the participant passed or failed the instructions quiz, duration in ms, and timestamp of endtime
 * Call this in App.jsx from handleInstructionsDisqualified (passed=false)
 * and from handleTutorialComplete (passed=true).
 * Added to user's session document
 * @param {boolean} passed
 */
export const logInstructionsResult = async (passed, reason) => {
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
        reason: reason,
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
 *  Logs whether training was passed, how many rounds they survived, total rounds attempted, survival rate, duration in ms, and timestamp of endtime
 * Call this in TrainingPhase.jsx / App.jsx when training ends.
 *
 * @param {boolean} passed            - Whether they met the survival threshold
 * @param {number}  roundsSurvived    - How many rounds they survived
 * @param {number}  totalRounds       - Total training rounds attempted
 */
// check if i should call this from App.jsx instead of TrainingPhase.jsx 5/18
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
 * Logs the reason for termination, which stage they were in, duration in ms, and timestamp.
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
/**
 * Log the participant's answer to the preliminary question about their platform, timestamp, and ms since session start.
 */
// do i need to log timestamp? 5/18
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
 * Log a change in the tutorial slide.
 * Logs new slide number, whether it's a quiz slide, direction of navigation (next, initial, redirect), game version, timestamp, and ms since previous slide change.
 */
export const logTutorialSlideChange = async ({
  slideIndex,
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

/**
 * Log an answer to a quiz question within the tutorial.
 * Logs quiz ID, slide ID, selected answer IDs, whether the answer was correct, attempt number, game version, timestamp, and ms since session start.
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

/**
 * Log the start of a new round.
 * Logs round number, time since the session start, current timestamp, whether it's training mode, round configuration details (phase, game version, vial/bucket setup, velocity, setpoint, initial levels).
 * @param {*} roundNumber
 * @param {*} roundConfig
 * @param {*} isTrainingMode
 * @returns
 */
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
 * Logs the type of button pressed, time since round start, time since last button press, current timestamp, game state at the time of press
 * (vial/bucket levels, velocity, setpoint, round time remaining), whether gasStation is active
 *
 * @param {string} buttonType
 * @param {object} gameState
 */
export const logButtonPress = async (
  buttonType,
  gameState,
  trainingMode,
  addAmount,
) => {
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
      addAmount: addAmount,
      roundTimeRemaining: gameState.roundTimeRemaining || 0,
      roundNumber: currentRoundNumber,
      velocity: Math.round(gameState.velocity * 100) / 100,
      setpoint: Math.round(gameState.setpoint * 100) / 100,
      gasStationActive: gameState.gasStationActive === true ? 1 : 0,
    });
  } catch (error) {
    console.error("Error logging button press:", error);
  }
};

// ============================================================================
// GAS STATION TOGGLE EVENTS
// ============================================================================

/**
 * Log each time the gas station turns on or off.
 * Call this in VialGame.jsx inside the useEffect that watches isAddingDisabled.
 * Logs whether the gas station just turned active (green) or inactive (grey), time since session start, time since round start,
 * current round number, whether it's training mode, and timestamp.
 *
 * @param {boolean} isNowActive   - true = pump just turned GREEN, false = just turned GREY
 * @param {string}  isTrainingMode
 */
export const logGasStationToggle = async (
  isNowActive,
  isTrainingMode = false,
  isRoundStart = false,
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
      isRoundStart: isRoundStart ? 1 : 0,
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

/**
 * Log each time the participant hides or shows the tab.
 * Call this from the visibilitychange handler in App.jsx.
 * Logs whether the tab is now hidden or visible, which stage they were in (instructions, training, or main game), time since session start, time since round start, current round number, and timestamp.
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

/**
 * Logs the end of a round, including its success status, training mode, end time, and cumulative progress.
 * @param {*} successful
 * @param {*} isTrainingMode
 * @param {*} cumulativeProgress
 * @returns
 */
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
        cumulativeProgress !== null
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

/**
 * Log the completion of the game, including final score, total rounds, cumulative progress, and whether they reached the bonus goal.
 */
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

/**
 * Returns the mappings for button types, game versions, and phases.
 * @returns
 */
export const getMappings = () => ({
  buttonTypes: { forward: BUTTON_TYPE_MAP, reverse: BUTTON_TYPE_REVERSE },
  gameVersions: { forward: GAME_VERSION_MAP, reverse: GAME_VERSION_REVERSE },
  phases: { forward: PHASE_MAP, reverse: PHASE_REVERSE },
});

export const exportMappingsJSON = () => JSON.stringify(getMappings(), null, 2);
