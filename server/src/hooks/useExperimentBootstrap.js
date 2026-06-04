/**
 * reading URL params, checking access, starting the session.
 */
import { useEffect, useState } from "react";
import { initializeSession, endSession, logGameConfig } from "../data/logging";
import { PRODUCTION_MODE, validateUrlParams } from "../data/participantConfig";
import {
  initializeAccess,
  completeSession,
  checkReloadAttempt,
} from "../data/accessControl";

export const useExperimentBootstrap = () => {
  const [userId, setUserId] = useState(null);
  const [gameVersion, setGameVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const {
        valid,
        participantId,
        version,
        error: paramError,
      } = validateUrlParams();

      if (participantId) setUserId(participantId);
      if (version) setGameVersion(version);

      if (!valid) {
        setError(paramError);
        setIsLoading(false);
        return;
      }

      const { shouldBlock } = checkReloadAttempt();
      if (shouldBlock && PRODUCTION_MODE) {
        const mainGameStarted =
          sessionStorage.getItem("mainGameStarted") === "true";
        setShowReloadModal(true);
        setTrainingComplete(mainGameStarted);
        setError("Page was reloaded. Cannot continue experiment.");
        setIsLoading(false);
        return;
      }

      const accessResult = await initializeAccess(participantId);
      if (!accessResult.success) {
        setError(accessResult.error);
        setIsLoading(false);
        return;
      }

      await initializeSession(participantId, version);
      await logGameConfig(participantId, version);
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    return () => {
      if (userId) {
        completeSession(userId);
        endSession();
      }
    };
  }, [userId]);

  return {
    userId,
    gameVersion,
    isLoading,
    error,
    showReloadModal,
    trainingComplete,
    setTrainingComplete,
  };
};
