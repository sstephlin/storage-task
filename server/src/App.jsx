import React, { useState, useEffect, useRef } from "react"; // ✅ add useRef
import VialGame from "./VialGame";
import TrainingPhase from "./TrainingPhase";
import PrelimQuestion from "./components/PrelimQuestions";
import ReloadWarningModal from "./components/ReloadWarningModal";
import {
  initializeSession,
  endSession,
  logGameCompletion,
  logPrelimAnswer,
} from "./logging";
import "./styles/App.css";

import {
  PRODUCTION_MODE,
  validateUrlParams,
  VERSION_REDIRECT_URLS,
  getVersionCode,
} from "./participantConfig";

import {
  initializeAccess,
  completeSession,
  setupReloadWarning,
  checkReloadAttempt,
} from "./accessControl";

import { VERSION_CONFIG } from "./params";

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

  // ✅ Declare the ref so handleGameComplete can actually use it
  const reloadWarningCleanupRef = useRef(null);

  // ─── Bootstrap ──────────────────────────────────────────────────────────────
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
        setShowReloadModal(true);
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

  // ─── Reload warning ─────────────────────────────────────────────────────────
  // ✅ Store cleanup in ref instead of local variable so handleGameComplete can reach it
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

  // ─── Redirect logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showReloadModal) return;

    // Kill the beforeunload listener immediately when reload is detected
    if (reloadWarningCleanupRef.current) {
      reloadWarningCleanupRef.current();
      reloadWarningCleanupRef.current = null;
    }

    const { participantId, version } = validateUrlParams();
    const redirectUrl = version ? VERSION_REDIRECT_URLS[version] : null;
    if (!redirectUrl) return;

    const versionCode = getVersionCode(version);
    const url = new URL(redirectUrl);
    if (participantId) url.searchParams.set("pid", participantId);
    if (versionCode) url.searchParams.set("v", versionCode);
    const finalUrl = url.toString();

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = finalUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showReloadModal]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (userId) {
        completeSession(userId);
        endSession();
      }
    };
  }, [userId]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleTrainingComplete = () => setTrainingComplete(true);

  const handleGameComplete = async ({
    finalScore,
    totalRounds,
    cumulativeProgress,
  } = {}) => {
    // ✅ Remove beforeunload listener BEFORE any async work or redirect
    if (reloadWarningCleanupRef.current) {
      reloadWarningCleanupRef.current();
      reloadWarningCleanupRef.current = null;
    }

    setGameComplete(true);
    console.log("cumulative", cumulativeProgress);

    if (userId) {
      await logGameCompletion({
        finalScore: finalScore ?? 0,
        totalRounds: totalRounds ?? 0,
        cumulativeProgress: cumulativeProgress ?? 0,
        isTrainingMode: false,
      });
      await completeSession(userId); // also calls clearSession() internally
      await endSession();
    }

    const redirectUrl = VERSION_REDIRECT_URLS[gameVersion];
    if (redirectUrl) {
      const versionCode = getVersionCode(gameVersion);
      const url = new URL(redirectUrl);
      if (userId) url.searchParams.set("PROLIFIC_PID", userId);
      if (versionCode) url.searchParams.set("STUDY_ID", versionCode);

      setTimeout(() => {
        window.location.replace(url.toString());
      }, 5000);
    }
  };

  const handleModalOpen = () => setIsGamePaused(true);
  const handleModalClose = () => setIsGamePaused(false);

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

  // ─── Reload Block Screen ─────────────────────────────────────────────────────
  if (showReloadModal) {
    const { version } = validateUrlParams();
    const redirectUrl = version ? VERSION_REDIRECT_URLS[version] : null;

    return (
      <div className="reload-overlay">
        <div className="reload-card">
          <div className="reload-icon">⚠️</div>
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
        {/* ✅ ReloadWarningModal also gated on !gameComplete here */}
        {!gameComplete && (
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
        />
      </>
    );
  }

  return (
    <div>
      {/* ✅ isActive already false when gameComplete, but gating render too avoids any modal re-mount */}
      {!gameComplete && (
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
