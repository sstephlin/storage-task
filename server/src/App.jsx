import React, { useCallback, useRef, useState } from "react";
import VialGame from "./components/VialGame";
import TrainingPhase from "./components/TrainingPhase";
import PrelimQuestion from "./components/PrelimQuestions";
import ReloadWarningModal from "./components/ReloadWarningModal";
import ReloadTerminationModal from "./components/ReloadTerminationModal";
import {
  endSession,
  logGameCompletion,
  logPrelimAnswer,
  logInstructionsResult,
  logTermination,
} from "./data/logging";
import "./styles/App.css";

import { PRODUCTION_MODE } from "./data/participantConfig";

import { completeSession, markIntentionalRedirect } from "./data/accessControl";

import {
  VERSION_CONFIG,
  GAME_COMPLETE_REDIRECT_URL,
  FAIL_TRAINING_REDIRECT_URL,
  FAIL_INSTRUCTIONS_REDIRECT_URL,
} from "./data/params";
import { useExperimentBootstrap } from "./hooks/useExperimentBootstrap";
import { useReloadRedirect } from "./hooks/useReloadRedirect";
import { useReloadWarning } from "./hooks/useReloadWarning";
import { useTabTermination } from "./hooks/useTabTermination";
import { buildParticipantRedirectUrl } from "./utils/redirectUtils";

const App = () => {
  const {
    userId,
    gameVersion,
    isLoading,
    error,
    showReloadModal,
    trainingComplete,
    setTrainingComplete,
  } = useExperimentBootstrap();

  const [prelimAnswered, setPrelimAnswered] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  const gameCompletedRef = useRef(false);

  const cleanupReloadWarning = useReloadWarning(userId);

  const redirectTo = useCallback(
    (url, reason = "unknown", stage = "unknown") => {
      markIntentionalRedirect();
      logTermination(reason, stage);
      cleanupReloadWarning();

      if (PRODUCTION_MODE) {
        window.location.replace(url);
      }
    },
    [cleanupReloadWarning],
  );

  const { redirectCountdown, hasRedirect } = useReloadRedirect({
    showReloadModal,
    trainingComplete,
    cleanupReloadWarning,
    redirectTo,
  });

  useTabTermination({
    userId,
    gameVersion,
    trainingComplete,
    gameComplete,
    isDisqualified,
    redirectTo,
  });

  const handlePrelimComplete = useCallback(async (answer) => {
    await logPrelimAnswer(answer);
    setPrelimAnswered(true);
  }, []);

  const handleTrainingComplete = useCallback(() => {
    sessionStorage.setItem("mainGameStarted", "true");
    logInstructionsResult(true, null);
    setTrainingComplete(true);
  }, [setTrainingComplete]);

  const handleGameComplete = useCallback(
    async ({ finalScore, totalRounds, cumulativeProgress } = {}) => {
      cleanupReloadWarning();
      if (gameCompletedRef.current) return; // block any second call
      gameCompletedRef.current = true;
      setGameComplete(true);

      let reachedBonusGoal = false;
      if (userId) {
        const result = await logGameCompletion({
          finalScore: finalScore ?? 0,
          totalRounds: totalRounds ?? 0,
          cumulativeProgress: cumulativeProgress ?? 0,
          isTrainingMode: false,
        });
        reachedBonusGoal = result?.reachedBonusGoal === true;
        await completeSession(userId);
        await endSession();
      }

      const redirectUrl = GAME_COMPLETE_REDIRECT_URL[gameVersion];
      const finalUrl = buildParticipantRedirectUrl(redirectUrl, {
        userId,
        gameVersion,
        bonusReached: reachedBonusGoal,
      });

      if (finalUrl) {
        setTimeout(() => {
          redirectTo(finalUrl, "game complete", "experiment complete");
        }, 5000);
      }
    },
    [cleanupReloadWarning, gameVersion, redirectTo, userId],
  );

  const handleInstructionsDisqualified = useCallback(
    async (reason) => {
      setIsDisqualified(true);
      await logInstructionsResult(false, reason);

      const redirectUrl = FAIL_INSTRUCTIONS_REDIRECT_URL[gameVersion];
      const finalUrl = buildParticipantRedirectUrl(redirectUrl, {
        userId,
        gameVersion,
      });

      if (finalUrl) {
        redirectTo(finalUrl, "instructions_failed", "instructions");
      }
    },
    [gameVersion, redirectTo, userId],
  );

  const handleTrainingDisqualified = useCallback(() => {
    setIsDisqualified(true);

    const redirectUrl = FAIL_TRAINING_REDIRECT_URL[gameVersion];
    const finalUrl = buildParticipantRedirectUrl(redirectUrl, {
      userId,
      gameVersion,
    });

    if (finalUrl) {
      redirectTo(finalUrl, "training_failed", "training");
    }
  }, [gameVersion, redirectTo, userId]);

  if (showReloadModal) {
    return (
      <ReloadTerminationModal
        countdown={redirectCountdown}
        hasRedirect={hasRedirect}
      />
    );
  }

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>{error}</div>;

  if (userId && !prelimAnswered) {
    return <PrelimQuestion onComplete={handlePrelimComplete} />;
  }

  const showReloadWarning = !gameComplete && !isDisqualified;
  const reloadWarningModal = showReloadWarning ? (
    <ReloadWarningModal isActive={!!userId} userId={userId} />
  ) : null;

  if (!trainingComplete) {
    return (
      <>
        {reloadWarningModal}
        <TrainingPhase
          userId={userId}
          gameVersion={gameVersion}
          onComplete={handleTrainingComplete}
          versionConfig={VERSION_CONFIG[gameVersion]}
          onDisqualified={handleTrainingDisqualified}
          onInstructionsDisqualified={handleInstructionsDisqualified}
        />
      </>
    );
  }

  return (
    <div>
      {reloadWarningModal}
      <VialGame
        userId={userId}
        gameVersion={gameVersion}
        onComplete={handleGameComplete}
        isPaused={isGamePaused}
      />
    </div>
  );
};

export default App;
