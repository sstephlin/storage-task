import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Store the timestamp of the last button press
let lastButtonPressTime = null;

/**
 * Log a button press event to Firebase
 * @param {string} buttonType - Type of button pressed (add_vial_1, add_vial_2, empty_bucket, restart, toggle_version)
 * @param {Object} gameState - Current game state
 */
export const logButtonPress = async (buttonType, gameState) => {
  try {
    const currentTime = Date.now();
    let timeSinceLastPress = null;

    // Calculate time since last button press
    if (lastButtonPressTime !== null) {
      timeSinceLastPress = currentTime - lastButtonPressTime;
    }

    // Update the last button press time
    lastButtonPressTime = currentTime;

    const eventData = {
      eventType: "button_press",
      buttonType: buttonType,
      timestamp: serverTimestamp(),
      timeSinceLastPress: timeSinceLastPress, // in milliseconds, null for first press
      gameState: {
        vial1Level: gameState.vial1Level,
        vial2Level: gameState.vial2Level,
        hasBucket: gameState.hasBucket,
        ...(gameState.hasBucket && { bucket2Level: gameState.bucket2Level }),
        gameRunning: gameState.gameRunning,
      },
    };

    await addDoc(collection(db, "game_events"), eventData);
    console.log(
      "Event logged:",
      buttonType,
      `(${timeSinceLastPress}ms since last press)`
    );
  } catch (error) {
    console.error("Error logging event to Firebase:", error);
  }
};
export const logVialLevels = async (gameState) => {
  try {
    const eventData = {
      eventType: "vial_levels",
      timestamp: serverTimestamp(),
      gameState: {
        vial1Level: gameState.vial1Level,
        vial2Level: gameState.vial2Level,
        hasBucket: gameState.hasBucket,
        ...(gameState.hasBucket && { bucket2Level: gameState.bucket2Level }),
        gameRunning: gameState.gameRunning,
        currentRound: gameState.currentRound,
        score: gameState.score,
        roundTimeRemaining: gameState.roundTimeRemaining,
      },
    };

    await addDoc(collection(db, "game_events"), eventData);
    // Reduced logging to avoid console spam
    console.log("Vial levels logged");
  } catch (error) {
    console.error("Error logging vial levels to Firebase:", error);
  }
};

/**
 * Reset the button press timer (useful when starting a new game session)
 */
export const resetButtonPressTimer = () => {
  lastButtonPressTime = null;
};

/**
 * Log a custom game event
 * @param {string} eventType - Type of event
 * @param {Object} data - Additional event data
 */
export const logGameEvent = async (eventType, data) => {
  try {
    const eventData = {
      eventType: eventType,
      timestamp: serverTimestamp(),
      ...data,
    };

    await addDoc(collection(db, "game_events"), eventData);
    console.log("Event logged:", eventType);
  } catch (error) {
    console.error("Error logging event to Firebase:", error);
  }
};
