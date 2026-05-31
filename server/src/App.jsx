import React, { useState, useEffect, useRef } from "react";
import VialGame from "./components/VialGame";
import TrainingPhase from "./components/TrainingPhase";
import PrelimQuestion from "./components/PrelimQuestions";
import ReloadWarningModal from "./components/ReloadWarningModal";
import {
  initializeSession,
  endSession,
  logGameCompletion,
  logPrelimAnswer,
  logInstructionsResult,
  logTrainingResult,
  logTermination,
  logTabVisibilityChange,
} from "./data/logging";
import "./styles/App.css";

import {
  PRODUCTION_MODE,
  validateUrlParams,
  getVersionCode,
} from "./data/participantConfig";

import {
  initializeAccess,
  completeSession,
  setupReloadWarning,
  checkReloadAttempt,
  markIntentionalRedirect,
} from "./data/accessControl";

import {
  VERSION_CONFIG,
  GAME_COMPLETE_REDIRECT_URL,
  RELOAD_REDIRECT_URLS_GENERAL,
  RELOAD_REDIRECT_URLS_MAIN_GAME,
  FAIL_TRAINING_REDIRECT_URL,
  FAIL_INSTRUCTIONS_REDIRECT_URL,
} from "./data/params";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [gameVersion, setGameVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  const [prelimAnswered, setPrelimAnswered] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [gameComplete, setGameComplete] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);

  const reloadWarningCleanupRef = useRef(null);

  const tabHiddenTimerRef = useRef(null);
  const tabHiddenAtRef = useRef(null);
  const gameCompletedRef = useRef(false);

  // Bootstrap
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

      await initializeSession(participantId, version, PRODUCTION_MODE);
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  // Reload warning
  useEffect(() => {
    if (userId && PRODUCTION_MODE) {
      reloadWarningCleanupRef.current = setupReloadWarning();
    }
    return () => {
      if (reloadWarningCleanupRef.current) {
        reloadWarningCleanupRef.current();
        reloadWarningCleanupRef.current = null;
      }
    };
  }, [userId]);

  // Redirect logic
  useEffect(() => {
    if (!showReloadModal) return;

    // Kill the beforeunload listener immediately when reload is detected
    if (reloadWarningCleanupRef.current) {
      reloadWarningCleanupRef.current();
      reloadWarningCleanupRef.current = null;
    }

    const { participantId, version } = validateUrlParams();
    const redirectUrl = trainingComplete
      ? RELOAD_REDIRECT_URLS_MAIN_GAME[version]
      : RELOAD_REDIRECT_URLS_GENERAL[version];
    if (!redirectUrl) return;

    const versionCode = getVersionCode(version);
    const url = new URL(redirectUrl);
    if (participantId) url.searchParams.set("PROLIFIC_ID", participantId);
    if (versionCode) url.searchParams.set("STUDY_ID", versionCode);
    const finalUrl = url.toString();

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          redirectTo(
            finalUrl,
            "reload",
            trainingComplete ? "main_game" : "training",
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showReloadModal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (userId) {
        completeSession(userId);
        endSession();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !gameVersion) return;

    const currentStage = trainingComplete ? "main_game" : "training";
    const AWAY_LIMIT_MS = 15000;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logTabVisibilityChange("hidden", currentStage);
        tabHiddenTimerRef.current = setTimeout(() => {
          if (gameComplete || isDisqualified) return;

          const versionCode = getVersionCode(gameVersion);
          const redirectUrl = trainingComplete
            ? RELOAD_REDIRECT_URLS_MAIN_GAME[gameVersion]
            : RELOAD_REDIRECT_URLS_GENERAL[gameVersion];

          if (!redirectUrl) return;

          const url = new URL(redirectUrl);
          if (userId) url.searchParams.set("PROLIFIC_PID", userId);
          if (versionCode) url.searchParams.set("STUDY_ID", versionCode);
          redirectTo(url.toString(), "tab_switch", currentStage);
        }, AWAY_LIMIT_MS);
      } else {
        logTabVisibilityChange("visible", currentStage);
        if (tabHiddenTimerRef.current) {
          clearTimeout(tabHiddenTimerRef.current);
          tabHiddenTimerRef.current = null;
        }
        tabHiddenAtRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (tabHiddenTimerRef.current) {
        clearTimeout(tabHiddenTimerRef.current);
      }
    };
  }, [userId, gameVersion, trainingComplete, gameComplete, isDisqualified]);

  // Handlers
  const redirectTo = (url, reason = "unknown", stage = "unknown") => {
    markIntentionalRedirect();
    logTermination(reason, stage);

    if (reloadWarningCleanupRef.current) {
      reloadWarningCleanupRef.current();
      reloadWarningCleanupRef.current = null;
    }
    if (PRODUCTION_MODE) {
      window.location.replace(url);
    }
  };

  const handleTrainingComplete = () => {
    sessionStorage.setItem("mainGameStarted", "true");
    logInstructionsResult(true, null);
    setTrainingComplete(true);
  };
  const handleGameComplete = async ({
    finalScore,
    totalRounds,
    cumulativeProgress,
  } = {}) => {
    if (reloadWarningCleanupRef.current) {
      reloadWarningCleanupRef.current();
      reloadWarningCleanupRef.current = null;
    }
    if (gameCompletedRef.current) return; // block any second call
    gameCompletedRef.current = true;

    var reachedBonusGoal = false;
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
    if (redirectUrl) {
      const versionCode = getVersionCode(gameVersion);
      const url = new URL(redirectUrl);
      if (userId) url.searchParams.set("PROLIFIC_PID", userId);
      if (versionCode) url.searchParams.set("STUDY_ID", versionCode);
      url.searchParams.set("B", reachedBonusGoal ? "true" : "false");

      setTimeout(() => {
        redirectTo(url.toString(), "game complete", "experiment complete");
      }, 5000);
    }
  };
  const handleInstructionsDisqualified = async (reason) => {
    setIsDisqualified(true);
    await logInstructionsResult(false, reason);

    const redirectUrl = FAIL_INSTRUCTIONS_REDIRECT_URL[gameVersion];
    if (!redirectUrl) return;
    const versionCode = getVersionCode(gameVersion);
    const url = new URL(redirectUrl);
    if (userId) url.searchParams.set("PROLIFIC_PID", userId);
    if (versionCode) url.searchParams.set("STUDY_ID", versionCode);
    redirectTo(url.toString(), "instructions_failed", "instructions");
  };

  const handleTrainingDisqualified = () => {
    setIsDisqualified(true);

    const redirectUrl = FAIL_TRAINING_REDIRECT_URL[gameVersion];
    if (!redirectUrl) return;
    const versionCode = getVersionCode(gameVersion);
    const url = new URL(redirectUrl);
    if (userId) url.searchParams.set("PROLIFIC_PID", userId);
    if (versionCode) url.searchParams.set("STUDY_ID", versionCode);
    redirectTo(url.toString(), "training_failed", "training");
  };

  // can get rid of this later 4/28
  const handleModalOpen = () => {};
  const handleModalClose = () => {};

  const handleDevReset = () => {
    if (PRODUCTION_MODE) return;
    setUserId(null);
    setGameVersion(null);
    setPrelimAnswered(false);
    setTrainingComplete(false);
    setError(null);
    setIsLoading(true);
    window.location.reload();
  };

  const DevOverlay = ({ status }) =>
    PRODUCTION_MODE ? null : (
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 1000 }}>
        <div>User: {userId}</div>
        <div>Version: {gameVersion}</div>
        <div>Status: {status}</div>
        <button onClick={handleDevReset}>Reset</button>
      </div>
    );

  // Reload Block Screen
  if (showReloadModal) {
    const { version } = validateUrlParams();
    const redirectUrl = trainingComplete
      ? RELOAD_REDIRECT_URLS_MAIN_GAME
      : RELOAD_REDIRECT_URLS_GENERAL;

    return (
      <div className="reload-overlay">
        <div className="reload-card">
          <h2 className="reload-title">Experiment Terminated</h2>
          <p className="reload-text">
            This page was reloaded, which is not allowed during the experiment.
            Your session has been terminated. You will be redirected shortly.
          </p>
          {redirectUrl ? (
            <p className="reload-countdown">
              Redirecting in <strong>{redirectCountdown}</strong> second
              {redirectCountdown !== 1 ? "s" : ""}…
            </p>
          ) : (
            <p className="reload-fallback">
              Please close this window and contact the researcher.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>{error}</div>;

  if (userId && !prelimAnswered) {
    return (
      <PrelimQuestion
        onComplete={async (answer) => {
          await logPrelimAnswer(answer);
          setPrelimAnswered(true);
        }}
      />
    );
  }

  if (!trainingComplete) {
    return (
      <>
        {!gameComplete && !isDisqualified && (
          <ReloadWarningModal
            isActive={!!userId}
            userId={userId}
            onModalOpen={handleModalOpen}
            onModalClose={handleModalClose}
          />
        )}
        <DevOverlay status="TRAINING" />
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
      {!gameComplete && !isDisqualified && (
        <ReloadWarningModal
          isActive={!!userId}
          userId={userId}
          onModalOpen={handleModalOpen}
          onModalClose={handleModalClose}
        />
      )}
      <DevOverlay status="MAIN GAME" />
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
