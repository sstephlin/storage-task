// Access Control System for Experiment
// Uses Firebase for persistent access tracking

import { PRODUCTION_MODE } from "./participantConfig";
import { getDatabase, ref, set, get, serverTimestamp } from "firebase/database";

// Session storage keys (for reload detection only)
const SESSION_KEY = "experiment_session_active";
const SESSION_START_KEY = "experiment_session_start";
const SESSION_USER_KEY = "experiment_session_user";

/**
 * Check if participant has already accessed the game
 * @param {string} userId - Participant ID
 * @returns {Promise<boolean>} True if already accessed
 */
export const hasParticipantAccessed = async (userId) => {
  if (!PRODUCTION_MODE) return false;

  try {
    const db = getDatabase();
    const accessRef = ref(db, `participant_access/${userId}`);
    const snapshot = await get(accessRef);

    return snapshot.exists();
  } catch (error) {
    console.error("Error checking participant access:", error);
    // In case of Firebase error, allow access but log the error
    // You may want to handle this differently based on your needs
    return false;
  }
};

/**
 * Mark participant as having accessed the game
 * @param {string} userId - Participant ID
 * @param {Object} metadata - Additional metadata to store
 * @returns {Promise<boolean>} True if successfully marked
 */
export const markParticipantAccessed = async (userId, metadata = {}) => {
  if (!PRODUCTION_MODE) return true;

  try {
    const db = getDatabase();
    const accessRef = ref(db, `participant_access/${userId}`);

    await set(accessRef, {
      accessed: true,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      ...metadata,
    });

    return true;
  } catch (error) {
    console.error("Firebase WRITE ERROR:", error);
    return false;
  }
};

/**
 * Check if there's an active session (for reload detection)
 * Uses sessionStorage which clears on reload
 * @returns {boolean} True if session is active
 */
export const hasActiveSession = () => {
  if (!PRODUCTION_MODE) return false;

  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch (error) {
    return false;
  }
};

/**
 * Mark session as active
 * @param {string} userId - Participant ID
 */
export const markSessionActive = (userId) => {
  if (!PRODUCTION_MODE) return;

  try {
    sessionStorage.setItem(SESSION_KEY, "true");
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    sessionStorage.setItem(SESSION_USER_KEY, userId);
  } catch (error) {
    console.error("Error marking session active:", error);
  }
};

/**
 * Clear session markers
 */
export const clearSession = () => {
  if (!PRODUCTION_MODE) return;

  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_START_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  } catch (error) {
    console.error("Error clearing session:", error);
  }
};

/**
 * Get current session user
 * @returns {string|null} User ID or null
 */
export const getSessionUser = () => {
  if (!PRODUCTION_MODE) return null;

  try {
    return sessionStorage.getItem(SESSION_USER_KEY);
  } catch (error) {
    return null;
  }
};

/**
 * Get session duration in milliseconds
 * @returns {number|null} Duration in ms, or null if no active session
 */
export const getSessionDuration = () => {
  if (!PRODUCTION_MODE) return null;

  try {
    const startTime = sessionStorage.getItem(SESSION_START_KEY);
    if (!startTime) return null;
    return Date.now() - parseInt(startTime, 10);
  } catch (error) {
    return null;
  }
};

// Module-level flag — set this to true before any intentional redirect
let _intentionalRedirect = false;

export const markIntentionalRedirect = () => {
  _intentionalRedirect = true;
};

export const isIntentionalRedirect = () => _intentionalRedirect;

export const setupReloadWarning = () => {
  if (!PRODUCTION_MODE) return () => {};

  const handleBeforeUnload = (e) => {
    if (_intentionalRedirect) return; // Let it through silently
    e.preventDefault();
    e.returnValue = "";
    return "";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
};

/**
 * Check if user is attempting to reload and handle accordingly
 * @returns {Object} { isReload: boolean, shouldBlock: boolean }
 */
export const checkReloadAttempt = () => {
  if (!PRODUCTION_MODE) {
    return { isReload: false, shouldBlock: false };
  }

  const isReload = hasActiveSession();
  const shouldBlock = isReload; // Block if there's an active session

  return { isReload, shouldBlock };
};

/**
 * Initialize access control for a participant
 * Call this when participant successfully logs in
 * @param {string} userId - Participant ID
 * @param {Object} metadata - Additional data to store
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export const initializeAccess = async (userId, metadata = {}) => {
  if (!PRODUCTION_MODE) {
    return { success: true };
  }

  try {
    // Check if already accessed
    const alreadyAccessed = await hasParticipantAccessed(userId);
    if (alreadyAccessed) {
      return {
        success: false,
        error: "This participant has already completed the experiment.",
      };
    }

    // Check for reload attempt
    const { isReload, shouldBlock } = checkReloadAttempt();
    if (shouldBlock) {
      // Check if this is the same user
      const sessionUser = getSessionUser();
      if (sessionUser && sessionUser !== userId) {
        return {
          success: false,
          error: "Session was reloaded. Please contact the researcher.",
        };
      }
    }

    // Mark as accessed in Firebase
    const marked = await markParticipantAccessed(userId, metadata);
    if (!marked) {
      return {
        success: false,
        error: "Failed to register access. Please contact the researcher.",
      };
    }

    // Mark session as active in sessionStorage
    markSessionActive(userId);
    // setupReloadWarning();

    return { success: true };
  } catch (error) {
    console.error("Error initializing access:", error);
    return {
      success: false,
      error: "An error occurred. Please contact the researcher.",
    };
  }
};

/**
 * Complete the session (call when experiment is finished)
 * Optionally update Firebase with completion status
 * @param {string} userId - Participant ID
 * @param {Object} completionData - Data about completion
 */
export const completeSession = async (userId, completionData = {}) => {
  if (!PRODUCTION_MODE) return;

  try {
    // Update Firebase with completion info
    const db = getDatabase();
    const accessRef = ref(db, `participant_access/${userId}`);

    await set(accessRef, {
      accessed: true,
      completed: true,
      completionTimestamp: serverTimestamp(),
      ...completionData,
    });

    // Clear session storage
    clearSession();
  } catch (error) {
    console.error("Error completing session:", error);
    // Still clear session even if Firebase update fails
    clearSession();
  }
};

/**
 * Reset a participant's access (admin function for testing)
 * WARNING: Only use this in development or for specific admin purposes
 * @param {string} userId - Participant ID
 * @returns {Promise<boolean>} True if successfully reset
 */
export const resetParticipantAccess = async (userId) => {
  if (PRODUCTION_MODE) {
    console.warn("Attempting to reset access in PRODUCTION mode!");
  }

  try {
    const db = getDatabase();
    const accessRef = ref(db, `participant_access/${userId}`);

    // Remove the entry from Firebase
    await set(accessRef, null);

    // Clear local session
    clearSession();

    return true;
  } catch (error) {
    console.error("Error resetting participant access:", error);
    return false;
  }
};

/**
 * Get access information for a participant (admin function)
 * @param {string} userId - Participant ID
 * @returns {Promise<Object|null>} Access data or null
 */
export const getParticipantAccessInfo = async (userId) => {
  try {
    const db = getDatabase();
    const accessRef = ref(db, `participant_access/${userId}`);
    const snapshot = await get(accessRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error getting participant access info:", error);
    return null;
  }
};

/**
 * Get all participant access records (admin function)
 * Use with caution - could be a large dataset
 * @returns {Promise<Object|null>} All access records
 */
export const getAllParticipantAccess = async () => {
  try {
    const db = getDatabase();
    const accessRef = ref(db, "participant_access");
    const snapshot = await get(accessRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.error("Error getting all participant access:", error);
    return null;
  }
};
