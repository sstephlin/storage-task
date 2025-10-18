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

/**
 * Initialize a new game session for a user
 * @param {string} userId - The user's unique identifier
 */
export const initializeSession = async (userId) => {
  currentUserId = userId;
  currentSessionId = `${userId}_${Date.now()}`;
  sessionStartTime = Date.now(); // Record start time
  lastButtonPressTime = null;

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
      startTimeMs: sessionStartTime, // Store raw start time
      gameVersion: null,
    });

    console.log("Session initialized:", currentSessionId);
  } catch (error) {
    console.error("Error initializing session:", error);
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
    const timeSinceLastPress =
      lastButtonPressTime !== null ? currentTime - lastButtonPressTime : null;
    lastButtonPressTime = currentTime;

    const buttonPressData = {
      buttonType,
      timestampMs: currentTime,
      timestampReadable: new Date(currentTime).toISOString(),
      timeSinceLastPress,
      msSinceGameStart,
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

    const vialSnapshot = {
      timestampMs: currentTime,
      timestampReadable: new Date(currentTime).toISOString(),
      msSinceGameStart,
      vial1Level: Math.round(gameState.vial1Level * 100) / 100,
      vial2Level: Math.round(gameState.vial2Level * 100) / 100,
      hasBucket: gameState.hasBucket,
      ...(gameState.hasBucket && {
        bucket2Level: Math.round(gameState.bucket2Level * 100) / 100,
      }),
      currentRound: gameState.currentRound,
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
  } catch (error) {
    console.error("Error ending session:", error);
  }
};
