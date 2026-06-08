/**
 * setting up the browser “don’t reload/leave” warning.
 */
import { useCallback, useEffect, useRef } from "react";
import { PRODUCTION_MODE } from "../data/participantConfig";
import { setupReloadWarning } from "../data/accessControl";

export const useReloadWarning = (userId) => {
  const cleanupRef = useRef(null);

  const cleanupReloadWarning = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (userId && PRODUCTION_MODE) {
      cleanupRef.current = setupReloadWarning(); // shows browser popup
    }

    return cleanupReloadWarning;
  }, [cleanupReloadWarning, userId]);

  return cleanupReloadWarning;
};
