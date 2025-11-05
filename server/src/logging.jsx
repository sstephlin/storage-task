import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Session state
let currentUserId = null;
let currentSessionId = null;
let sessionStartTime = null; // Track when session started (ms)
let lastButtonPressTime = null;
let roundStartTime = null; // Track when current round started (ms)
let currentRoundNumber = null; // Track current round

/**
 * Initialize a new game session for a user
 * @param {string} userId - The user's unique identifier
 */
export const initializeSession = async (userId) => {
  currentUserId = userId;
  currentSessionId = `${userId}_${Date.now()}`;
  sessionStartTime = Date.now(); // Record start time
  lastButtonPressTime = null;
  roundStartTime = null;
  currentRoundNumber = null;

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
      startTime: serverTimestamp(),
      startTimeFormatted: new Date(sessionStartTime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      gameVersion: null,
      setpoint: null, // Will be updated when game starts
    });

    console.log("Session initialized:", currentSessionId);
  } catch (error) {
    console.error("Error initializing session:", error);
  }
};

/**
 * Update the setpoint in session metadata and reset game start time
 * @param {number} setpoint - The target setpoint value
 */
export const updateSessionSetpoint = async (setpoint) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    // Reset the game start time to NOW (when game actually begins)
    sessionStartTime = Date.now();
    lastButtonPressTime = null;

    const sessionRef = doc(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId
    );
    await updateDoc(sessionRef, {
      setpoint: Math.round(setpoint * 100) / 100,
      gameStartTime: serverTimestamp(),
      gameStartTimeFormatted: new Date(sessionStartTime).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }
      ),
    });

    console.log("Setpoint updated and game start time set:", setpoint);
  } catch (error) {
    console.error("Error updating setpoint:", error);
  }
};

/**
 * Log when a new round starts
 * @param {number} roundNumber - The round number (0-indexed or 1-indexed depending on your system)
 * @param {object} gameState - Current game state
 */
export const logRoundStart = async (roundNumber, gameState) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    roundStartTime = Date.now();
    currentRoundNumber = roundNumber;
    const msSinceGameStart = roundStartTime - sessionStartTime;

    const roundStartData = {
      roundNumber,
      msSinceGameStart,
      timestamp: serverTimestamp(),
      gameState: {
        vial1Level: Math.round(gameState.vial1Level * 100) / 100,
        vial2Level: Math.round(gameState.vial2Level * 100) / 100,
        numBuckets: gameState.numBuckets,
        ...(gameState.numBuckets === 2 && {
          bucket1Level: Math.round(gameState.bucket1Level * 100) / 100,
        }),
        ...(gameState.numBuckets >= 1 && {
          bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,
        }),
        currentDrainRate: gameState.currentDrainRate,
        score: gameState.score,
      },
    };

    const roundsRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "round_starts"
    );

    await addDoc(roundsRef, roundStartData);
    console.log(`Round ${roundNumber} started at ${msSinceGameStart}ms`);
  } catch (error) {
    console.error("Error logging round start:", error);
  }
};

/**
 * Log a button press event
 */
export const logButtonPress = async (buttonType, gameState) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const currentTime = Date.now();
    const msSinceGameStart = currentTime - sessionStartTime;
    const msSinceRoundStart =
      roundStartTime !== null ? currentTime - roundStartTime : null;
    const msSinceLastPress =
      lastButtonPressTime !== null ? currentTime - lastButtonPressTime : null;
    lastButtonPressTime = currentTime;

    const buttonPressData = {
      buttonType,
      msSinceGameStart,
      msSinceRoundStart, // NEW: Time since current round started
      msSinceLastPress,
      roundNumber: currentRoundNumber, // NEW: Which round this press occurred in
      gameState: {
        vial1Level: Math.round(gameState.vial1Level * 100) / 100,
        vial2Level: Math.round(gameState.vial2Level * 100) / 100,
        numBuckets: gameState.numBuckets,
        ...(gameState.numBuckets === 2 && {
          bucket1Level: Math.round(gameState.bucket1Level * 100) / 100,
        }),
        ...(gameState.numBuckets >= 1 && {
          bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,
        }),
        gameRunning: gameState.gameRunning,
        currentRound: gameState.currentRound,
        score: gameState.score,
        roundTimeRemaining: gameState.roundTimeRemaining,
      },
    };

    const pressesRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "button_presses"
    );

    await addDoc(pressesRef, buttonPressData);
  } catch (error) {
    console.error("Error logging button press:", error);
  }
};

/**
 * Log vial level snapshots
 */
export const logVialLevels = async (gameState) => {
  if (!currentUserId || !currentSessionId) return;

  try {
    const currentTime = Date.now();
    const msSinceGameStart = currentTime - sessionStartTime;
    const msSinceRoundStart =
      roundStartTime !== null ? currentTime - roundStartTime : null;

    // Calculate distance from setpoint (above is positive, below is negative)
    const vial1DistanceFromSetpoint = gameState.setpoint
      ? Math.round((gameState.vial1Level - gameState.setpoint) * 100) / 100
      : null;
    const vial2DistanceFromSetpoint = gameState.setpoint
      ? Math.round((gameState.vial2Level - gameState.setpoint) * 100) / 100
      : null;

    const vialSnapshot = {
      msSinceGameStart,
      msSinceRoundStart, // NEW: Time since current round started
      vial1Level: Math.round(gameState.vial1Level * 100) / 100,
      vial2Level: Math.round(gameState.vial2Level * 100) / 100,
      vial1DistanceFromSetpoint,
      vial2DistanceFromSetpoint,
      setpoint: gameState.setpoint,
      numBuckets: gameState.numBuckets,
      ...(gameState.numBuckets === 2 && {
        bucket1Level: Math.round(gameState.bucket1Level * 100) / 100,
      }),
      ...(gameState.numBuckets >= 1 && {
        bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,
      }),
      currentRound: gameState.currentRound,
      roundNumber: currentRoundNumber, // NEW: Which round this snapshot is from
      score: gameState.score,
      roundTimeRemaining: gameState.roundTimeRemaining,
      velocity: gameState.velocity,
    };

    const vialRef = collection(
      db,
      "user_sessions",
      currentUserId,
      "sessions",
      currentSessionId,
      "vial_snapshots"
    );

    await addDoc(vialRef, vialSnapshot);
  } catch (error) {
    console.error("Error logging vial levels:", error);
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
    });

    console.log("Session ended:", currentSessionId);
    currentSessionId = null;
    currentUserId = null;
    lastButtonPressTime = null;
    roundStartTime = null;
    currentRoundNumber = null;
  } catch (error) {
    console.error("Error ending session:", error);
  }
};
