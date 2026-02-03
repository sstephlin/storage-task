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

// Button type mappings
export const BUTTON_TYPE_MAP = {
  add_vial_1: 1,
  add_vial_2: 2,
  empty_bucket_1: 3,
  empty_bucket_2: 4,
};

// Game version mappings
export const GAME_VERSION_MAP = {
  one_vial_alternating: 1,
  one_vial_always_bucket: 2,
  two_vials_single_bucket: 3,
  two_vials_phases: 4,
};

// Phase mappings
export const PHASE_MAP = {
  abundance: 1,
  deprivation: 2,
  none: 0, // For versions without phases
};

// Reverse mappings for reference
export const BUTTON_TYPE_REVERSE = Object.fromEntries(
  Object.entries(BUTTON_TYPE_MAP).map(([k, v]) => [v, k])
);

export const GAME_VERSION_REVERSE = Object.fromEntries(
  Object.entries(GAME_VERSION_MAP).map(([k, v]) => [v, k])
);

export const PHASE_REVERSE = Object.fromEntries(
  Object.entries(PHASE_MAP).map(([k, v]) => [v, k])
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
let currentRoundDocId = null; // Store the document ID for current round

/**
 * Initialize a new game session for a user
 * @param {string} userId - The user's unique identifier
 * @param {string} gameVersion - Game version string
 * @param {boolean} productionMode - Whether in production mode
 */
export const initializeSession = async (
  userId,
  gameVersion,
  productionMode
) => {
  currentUserId = userId;
  currentSessionId = `${userId}_${Date.now()}`;
  sessionStartTime = Date.now();
  lastButtonPressTime = null;
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
      { merge: true }
    );

    const sessionRef = doc(
      db,
      "user_sessions",
      userId,
      "sessions",
      currentSessionId
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
      gameVersion: gameVersion, // String for readability
      gameVersionCode: GAME_VERSION_MAP[gameVersion] || 0, // Integer for analysis
      productionMode: productionMode ? 1 : 0, // Integer boolean
    });

    console.log("Session initialized:", currentSessionId);
  } catch (error) {
    console.error("Error initializing session:", error);
  }
};

/**
 * Log when a new round starts
 * Creates a new round document with metadata
 * @param {number} roundNumber - The round number (1-indexed for storage)
 * @param {object} roundConfig - Configuration for this round
 */
export const logRoundStart = async (roundNumber, roundConfig) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    // Convert to 1-indexed for storage
    const roundNumberForStorage = roundNumber + 1;

    roundStartTime = Date.now();
    currentRoundNumber = roundNumberForStorage;
    lastButtonPressTime = null; // Reset for new round

    const msSinceGameStart = roundStartTime - sessionStartTime;

    // Prepare round data with integer mappings
    const roundData = {
      roundNumber: roundNumberForStorage, // 1-indexed
      msSinceGameStart,
      timestamp: serverTimestamp(),

      // Round configuration
      numVials: roundConfig.numVials || 1,
      vial1HasBucket: roundConfig.vial1HasBucket ? 1 : 0,
      vial2HasBucket: roundConfig.vial2HasBucket ? 1 : 0,
      velocity: Math.round(roundConfig.velocity * 100) / 100,
      setpoint: Math.round(roundConfig.setpoint * 100) / 100,

      // Phase information (if applicable)
      phase: roundConfig.phase || "none", // String for readability
      phaseCode: PHASE_MAP[roundConfig.phase] || 0, // Integer for analysis

      // Initial state
      initialVial1Level: Math.round(roundConfig.initialVial1Level * 100) / 100,
      initialVial2Level: Math.round(roundConfig.initialVial2Level * 100) / 100,
      initialBucket1Level:
        Math.round(roundConfig.initialBucket1Level * 100) / 100,
      initialBucket2Level:
        Math.round(roundConfig.initialBucket2Level * 100) / 100,

      // Round outcome (will be updated at round end)
      roundComplete: 0,
      roundSuccessful: null,
      roundEndTime: null,
      roundDuration: null,
    };

    // Create round document
    const roundsRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "rounds"
    );

    const roundDoc = await addDoc(roundsRef, roundData);
    currentRoundDocId = roundDoc.id;

    console.log(
      `Round ${roundNumberForStorage} started at ${msSinceGameStart}ms`
    );
  } catch (error) {
    console.error("Error logging round start:", error);
  }
};

/**
 * Log a button press event within the current round
 * @param {string} buttonType - Type of button pressed
 * @param {object} gameState - Current game state
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

    const buttonPressData = {
      buttonType: buttonType, // String for readability
      buttonTypeCode: BUTTON_TYPE_MAP[buttonType] || 0, // Integer for analysis
      msSinceRoundStart,
      msSinceLastPress,
      timestamp: serverTimestamp(),

      // Vial levels at button press
      vial1Level: Math.round(gameState.vial1Level * 100) / 100,
      vial2Level: Math.round(gameState.vial2Level * 100) / 100,

      // Bucket levels at button press
      bucket1Level: Math.round(gameState.bucket1Level * 100) / 100,
      bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,

      // Add amount (from game params)
      addAmount: gameState.addAmount || 5, // Default from GAME_PARAMS.ADD_AMOUNT

      // Time remaining in round
      roundTimeRemaining: gameState.roundTimeRemaining || 0,

      // Additional context
      roundNumber: currentRoundNumber,
      velocity: Math.round(gameState.velocity * 100) / 100,
      setpoint: Math.round(gameState.setpoint * 100) / 100,
    };

    // Add to button_presses subcollection under current round
    const pressesRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "rounds",
      currentRoundDocId,
      "button_presses"
    );

    await addDoc(pressesRef, buttonPressData);
  } catch (error) {
    console.error("Error logging button press:", error);
  }
};

/**
 * Log round completion
 * Updates the round document with outcome
 * @param {boolean} successful - Whether round was completed successfully
 */
export const logRoundEnd = async (successful) => {
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
      currentRoundDocId
    );

    await updateDoc(roundRef, {
      roundComplete: 1,
      roundSuccessful: successful ? 1 : 0,
      roundEndTime,
      roundDuration,
    });

    console.log(
      `Round ${currentRoundNumber} ended: ${successful ? "SUCCESS" : "FAILURE"}`
    );
  } catch (error) {
    console.error("Error logging round end:", error);
  }
};

/**
 * End the current session
 */
export const endSession = async () => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const sessionRef = doc(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId
    );
    await updateDoc(sessionRef, {
      endTime: serverTimestamp(),
      sessionDuration: Date.now() - sessionStartTime,
    });

    console.log("Session ended:", currentSessionId);

    // Reset all state
    currentSessionId = null;
    currentUserId = null;
    lastButtonPressTime = null;
    roundStartTime = null;
    currentRoundNumber = null;
    currentRoundDocId = null;
  } catch (error) {
    console.error("Error ending session:", error);
  }
};

/**
 * Get mapping documentation for data analysis
 * @returns {object} All mappings and reverse mappings
 */
export const getMappings = () => {
  return {
    buttonTypes: {
      forward: BUTTON_TYPE_MAP,
      reverse: BUTTON_TYPE_REVERSE,
    },
    gameVersions: {
      forward: GAME_VERSION_MAP,
      reverse: GAME_VERSION_REVERSE,
    },
    phases: {
      forward: PHASE_MAP,
      reverse: PHASE_REVERSE,
    },
  };
};

/**
 * Export mappings as JSON for documentation
 * @returns {string} JSON string of all mappings
 */
export const exportMappingsJSON = () => {
  return JSON.stringify(getMappings(), null, 2);
};
