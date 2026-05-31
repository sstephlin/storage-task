import React, { useState, useEffect, useRef } from "react";
import { PRODUCTION_MODE } from "../data/participantConfig";
import { markIntentionalRedirect } from "../data/accessControl";
import { isIntentionalRedirect } from "../data/accessControl";

const ReloadWarningModal = ({
  isActive,
  userId,
  onModalOpen,
  onModalClose,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const beforeUnloadRef = useRef(null);
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    if (!showModal) {
      // Clean up countdown when modal closes
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setCountdownSeconds(30);
      return;
    }

    // Start 30-second countdown when modal opens
    setCountdownSeconds(30);
    let remaining = 30;

    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdownSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(countdownTimerRef.current);
        // Auto-redirect when countdown reaches 0
        handleForceLeave();
      }
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [showModal]);

  useEffect(() => {
    if (!isActive || !PRODUCTION_MODE) return;

    let isNavigatingAway = false;
    const handleBeforeUnload = (e) => {
      if (isIntentionalRedirect()) return; // let programmatic redirects through silently

      if (!isNavigatingAway) {
        setAttemptedAction("reload");
        setShowModal(true);
        if (onModalOpen) onModalOpen();
      }
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    const handlePopState = () => {
      if (!isNavigatingAway) {
        setAttemptedAction("navigate");
        setShowModal(true);
        if (onModalOpen) onModalOpen();
        window.history.pushState(null, "", window.location.href);
      }
    };

    const handleKeyDown = (e) => {
      if (
        (e.key === "r" && (e.ctrlKey || e.metaKey)) ||
        e.key === "F5" ||
        (e.key === "F5" && e.ctrlKey)
      ) {
        e.preventDefault();
        setAttemptedAction("reload");
        setShowModal(true);
        if (onModalOpen) onModalOpen();
      }
    };

    beforeUnloadRef.current = handleBeforeUnload;

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("keydown", handleKeyDown);
      beforeUnloadRef.current = null;
    };
  }, [isActive, onModalOpen]);

  const handleClose = () => {
    setShowModal(false);
    if (onModalClose) onModalClose();
  };

  const handleForceLeave = () => {
    setShowModal(false);
    if (onModalClose) onModalClose();

    // Mark as intentional so beforeunload handler returns silently
    markIntentionalRedirect();

    if (attemptedAction === "reload") {
      window.location.reload();
    } else {
      window.history.back();
    }
  };

  if (!showModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "600px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          animation: "slideIn 0.3s ease-out",
        }}
      >
        <style>
          {`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>

        {/* Warning Icon */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#dc3545",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Warning: Do Not Reload or Leave
          </h2>
        </div>

        {/* Main Message */}
        <div
          style={{
            marginBottom: "32px",
            color: "#333",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          <p
            style={{
              marginBottom: "16px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#dc3545",
            }}
          >
            If you reload or leave this page, you will NOT be able to complete
            the experiment.
          </p>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              borderLeft: "4px solid #dc3545",
            }}
          >
            <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
              Why this matters:
            </p>
            <ul style={{ margin: 0, paddingLeft: "24px" }}>
              <li style={{ marginBottom: "6px" }}>
                Each participant can only access the experiment{" "}
                <strong>ONE TIME</strong>
              </li>
              <li style={{ marginBottom: "6px" }}>
                Reloading or leaving will end your session permanently
              </li>
              <li style={{ marginBottom: "6px" }}>
                You will not be able to log in again with your credentials
              </li>
              <li style={{ marginBottom: "6px" }}>
                Your data may be incomplete and cannot be used
              </li>
            </ul>
          </div>

          <p style={{ marginBottom: "16px" }}>
            <strong>Participant ID:</strong>{" "}
            <code
              style={{
                backgroundColor: "#e9ecef",
                padding: "4px 8px",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            >
              {userId}
            </code>
          </p>
        </div>

        {/* Auto-redirect Countdown */}
        <div
          style={{
            backgroundColor: "#fff3cd",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "24px",
            textAlign: "center",
            border: "2px solid #ffc107",
          }}
        >
          <p
            style={{
              margin: "0 0 12px 0",
              color: "#856404",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Automatic redirect in:
          </p>
          <p
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#dc3545",
              margin: "0",
            }}
          >
            {countdownSeconds}s
          </p>
          <p
            style={{ margin: "6px 0 0 0", color: "#856404", fontSize: "13px" }}
          >
            Click "Continue Experiment" to dismiss this timer
          </p>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: "14px 24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#218838";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#28a745";
              e.target.style.transform = "translateY(0)";
            }}
          >
            ✓ Continue Experiment
          </button>

          <button
            onClick={handleForceLeave}
            style={{
              flex: 1,
              padding: "14px 24px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#5a6268";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#6c757d";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Leave Anyway (NOT RECOMMENDED)
          </button>
        </div>

        {/* Additional Notice */}
        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            color: "#999",
            fontSize: "12px",
            fontStyle: "italic",
          }}
        >
          Click outside this dialog or press ESC to continue the experiment
        </p>
      </div>
    </div>
  );
};

export default ReloadWarningModal;
