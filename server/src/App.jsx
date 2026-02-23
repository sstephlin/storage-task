import React, { useState, useEffect } from "react";
import VialGame from "./VialGame";
import TrainingPhase from "./TrainingPhase";
import Tutorial from "./instructions";
import Login from "./components/Login";
import ReloadWarningModal from "./components/ReloadWarningModal";
import { initializeSession, endSession } from "./logging";
import "./styles/App.css";
import { PRODUCTION_MODE, getParticipantVersion } from "./participantConfig";
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

  // Phase states - progression: login -> tutorial -> training -> game
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);

  // Check for reload attempts on mount
  useEffect(() => {
    const { isReload, shouldBlock } = checkReloadAttempt();

    if (shouldBlock && PRODUCTION_MODE) {
      setShowReloadModal(true);
      setError("Page was reloaded. Cannot continue experiment.");
      setIsLoading(false);
      return;
    }

    // Check URL parameters on mount (for development convenience)
    if (!PRODUCTION_MODE) {
      const params = new URLSearchParams(window.location.search);
      const userIdFromUrl = params.get("userId");

      if (userIdFromUrl) {
        handleLogin(userIdFromUrl, "one_vial_alternating");
        return;
      }
    }

    setIsLoading(false);
  }, []);

  // Setup reload warning when user is logged in
  useEffect(() => {
    let cleanup;
    if (userId && PRODUCTION_MODE) {
      cleanup = setupReloadWarning();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [userId]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (userId) {
        completeSession(userId);
        endSession();
      }
    };
  }, [userId]);

  const handleLogin = async (newUserId, assignedVersion) => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize access control (checks for prior access, marks accessed)
      const accessResult = await initializeAccess(newUserId);

      if (!accessResult.success) {
        setError(accessResult.error);
        setIsLoading(false);
        return;
      }

      // Get participant's assigned game version
      const version = assignedVersion || getParticipantVersion(newUserId);

      if (!version) {
        setError("No game version assigned to this participant.");
        setIsLoading(false);
        return;
      }

      // Update URL with userId (for tracking)
      const url = new URL(window.location);
      url.searchParams.set("userId", newUserId);
      window.history.pushState({}, "", url);

      // Initialize Firebase session with version info
      await initializeSession(newUserId, version, PRODUCTION_MODE);

      setUserId(newUserId);
      setGameVersion(version);
      setTutorialComplete(false); // Reset to show tutorial first
      setTrainingComplete(false); // Reset training status
      setIsLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "An error occurred during login. Please try again or contact the researcher.",
      );
      setIsLoading(false);
    }
  };

  const handleTrainingComplete = () => {
    console.log("Training phase completed");
    setTrainingComplete(true);
  };

  const handleTutorialComplete = () => {
    console.log("Tutorial phase completed");
    setTutorialComplete(true);
  };

  const handleGameComplete = async () => {
    // Called when participant completes the experiment
    if (userId) {
      await completeSession(userId);
      await endSession();
    }
  };

  const handleModalOpen = () => {
    setIsGamePaused(true);
  };

  const handleModalClose = () => {
    setIsGamePaused(false);
  };

  // Development-only logout function
  const handleLogout = async () => {
    if (PRODUCTION_MODE) {
      console.warn("Logout is disabled in production mode");
      return;
    }

    await completeSession(userId);
    await endSession();

    const url = new URL(window.location);
    url.searchParams.delete("userId");
    window.history.pushState({}, "", url);

    setUserId(null);
    setGameVersion(null);
    setTutorialComplete(false);
    setTrainingComplete(false);
  };

  // Reload warning modal
  if (showReloadModal) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
          <h2
            style={{
              color: "#e74c3c",
              marginBottom: "20px",
              fontSize: "24px",
            }}
          >
            Experiment Terminated
          </h2>
          <p
            style={{
              color: "#555",
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            This page was reloaded, which is not allowed during the experiment.
            Your session has been terminated.
          </p>
          <p
            style={{
              color: "#777",
              fontSize: "14px",
            }}
          >
            Please close this window and contact the researcher for further
            instructions.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  // Error state
  if (error && !userId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#fee",
            border: "2px solid #fcc",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#c33", marginBottom: "15px" }}>Error</h2>
          <p style={{ color: "#555", fontSize: "16px" }}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(false);
            }}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Login screen
  if (!userId) {
    return <Login onLogin={handleLogin} />;
  }

  // if (!tutorialComplete) {
  //   return <Tutorial />;
  // }

  // Training phase (if not complete)
  if (!trainingComplete) {
    return (
      <>
        <ReloadWarningModal
          isActive={!!userId}
          userId={userId}
          onModalOpen={handleModalOpen}
          onModalClose={handleModalClose}
        />

        {!PRODUCTION_MODE && (
          <div
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              fontSize: "12px",
              zIndex: 1000,
              minWidth: "200px",
            }}
          >
            <div style={{ color: "#666" }}>
              <strong style={{ color: "#2c3e50" }}>Development Mode</strong>
            </div>
            <div style={{ color: "#666" }}>
              User: <strong style={{ color: "#2c3e50" }}>{userId}</strong>
            </div>
            <div style={{ color: "#666" }}>
              Version:{" "}
              <strong style={{ color: "#2c3e50" }}>{gameVersion}</strong>
            </div>
            <div style={{ color: "#666" }}>
              Status: <strong style={{ color: "#f59e0b" }}>TRAINING</strong>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                background: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Logout (Dev Only)
            </button>
          </div>
        )}

        <TrainingPhase
          userId={userId}
          gameVersion={gameVersion}
          onComplete={handleTrainingComplete}
          versionConfig={VERSION_CONFIG[gameVersion]}
        />
      </>
    );
  }

  // Main game screen (after training)
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <ReloadWarningModal
        isActive={!!userId}
        userId={userId}
        onModalOpen={handleModalOpen}
        onModalClose={handleModalClose}
      />

      {/* Debug info (only shown in dev mode) */}
      {!PRODUCTION_MODE && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "12px",
            zIndex: 1000,
            minWidth: "200px",
          }}
        >
          <div style={{ color: "#666" }}>
            <strong style={{ color: "#2c3e50" }}>Development Mode</strong>
          </div>
          <div style={{ color: "#666" }}>
            User: <strong style={{ color: "#2c3e50" }}>{userId}</strong>
          </div>
          <div style={{ color: "#666" }}>
            Version: <strong style={{ color: "#2c3e50" }}>{gameVersion}</strong>
          </div>
          <div style={{ color: "#666" }}>
            Status: <strong style={{ color: "#10b981" }}>MAIN GAME</strong>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Logout (Dev Only)
          </button>
        </div>
      )}

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
