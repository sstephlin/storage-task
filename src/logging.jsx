import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Store session information
let currentUserId = null;
let currentSessionId = null;
let lastButtonPressTime = null;

/**
 * Initialize a new game session for a user
 * @param {string} userId - The user's unique identifier
 */
export const initializeSession = async (userId) => {
  currentUserId = userId;
  currentSessionId = `${userId}_${Date.now()}`;
  lastButtonPressTime = null;

  try {
    // Create initial session document
    const sessionRef = doc(db, "user_sessions", currentSessionId);
    await setDoc(sessionRef, {
      userId: userId,
      sessionId: currentSessionId,
      startTime: serverTimestamp(),
      buttonPresses: [],
      vialLevelSnapshots: [],
      gameVersion: null, // Will be set when game starts
    });

    console.log("Session initialized:", currentSessionId);
  } catch (error) {
    console.error("Error initializing session:", error);
  }
};

/**
 * Set the game version (with or without bucket)
 * @param {boolean} hasBucket - Whether the game has a bucket
 */
export const setGameVersion = async (hasBucket) => {
  if (!currentSessionId) return;

  try {
    const sessionRef = doc(db, "user_sessions", currentSessionId);
    await updateDoc(sessionRef, {
      gameVersion: hasBucket ? "with_bucket" : "without_bucket",
    });
  } catch (error) {
    console.error("Error setting game version:", error);
  }
};

/**
 * Log a button press event
 * @param {string} buttonType - Type of button pressed
 * @param {Object} gameState - Current game state
 */
export const logButtonPress = async (buttonType, gameState) => {
  if (!currentSessionId) {
    console.warn("No active session. Call initializeSession first.");
    return;
  }

  try {
    const currentTime = Date.now();
    let timeSinceLastPress = null;

    if (lastButtonPressTime !== null) {
      timeSinceLastPress = currentTime - lastButtonPressTime;
    }

    lastButtonPressTime = currentTime;

    const buttonEvent = {
      buttonType: buttonType,
      timestamp: currentTime,
      timeSinceLastPress: timeSinceLastPress,
      gameState: {
        vial1Level: Math.round(gameState.vial1Level * 100) / 100,
        vial2Level: Math.round(gameState.vial2Level * 100) / 100,
        hasBucket: gameState.hasBucket,
        ...(gameState.hasBucket && {
          bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,
        }),
        gameRunning: gameState.gameRunning,
        currentRound: gameState.currentRound,
        score: gameState.score,
        roundTimeRemaining: gameState.roundTimeRemaining,
      },
    };

    const sessionRef = doc(db, "user_sessions", currentSessionId);
    await updateDoc(sessionRef, {
      buttonPresses: arrayUnion(buttonEvent),
    });

    console.log("Button press logged:", buttonType);
  } catch (error) {
    console.error("Error logging button press:", error);
  }
};

/**
 * Log vial levels periodically
 * @param {Object} gameState - Current game state
 */
export const logVialLevels = async (gameState) => {
  if (!currentSessionId) return;

  try {
    const snapshot = {
      timestamp: Date.now(),
      vial1Level: Math.round(gameState.vial1Level * 100) / 100,
      vial2Level: Math.round(gameState.vial2Level * 100) / 100,
      hasBucket: gameState.hasBucket,
      ...(gameState.hasBucket && {
        bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,
      }),
      currentRound: gameState.currentRound,
      score: gameState.score,
      roundTimeRemaining: gameState.roundTimeRemaining,
    };

    const sessionRef = doc(db, "user_sessions", currentSessionId);
    await updateDoc(sessionRef, {
      vialLevelSnapshots: arrayUnion(snapshot),
    });
  } catch (error) {
    console.error("Error logging vial levels:", error);
  }
};

/**
 * End the current session
 */
export const endSession = async () => {
  if (!currentSessionId) return;

  try {
    const sessionRef = doc(db, "user_sessions", currentSessionId);
    await updateDoc(sessionRef, {
      endTime: serverTimestamp(),
    });

    console.log("Session ended:", currentSessionId);
    currentSessionId = null;
    currentUserId = null;
    lastButtonPressTime = null;
  } catch (error) {
    console.error("Error ending session:", error);
  }
};

/**
 * Get current user ID
 */
export const getCurrentUserId = () => currentUserId;

/**
 * Get current session ID
 */
export const getCurrentSessionId = () => currentSessionId;

/**
 * Reset the button press timer
 */
export const resetButtonPressTimer = () => {
  lastButtonPressTime = null;
};
