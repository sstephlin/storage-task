// import React, { useState, useEffect } from "react";
// import { PRODUCTION_MODE } from "../participantConfig";

// /**
//  * Modal that intercepts navigation attempts and warns users
//  * Shows a custom, descriptive warning before they can leave/reload
//  * @param {boolean} isActive - Whether warnings are active
//  * @param {string} userId - Participant ID
//  * @param {Function} onModalOpen - Callback when modal opens (to pause game)
//  * @param {Function} onModalClose - Callback when modal closes (to resume game)
//  */
// const ReloadWarningModal = ({
//   isActive,
//   userId,
//   onModalOpen,
//   onModalClose,
// }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [attemptedAction, setAttemptedAction] = useState(null);

//   useEffect(() => {
//     if (!isActive || !PRODUCTION_MODE) return;

//     // Track if user is trying to leave
//     let isNavigatingAway = false;

//     // Intercept beforeunload (browser navigation/reload/close)
//     const handleBeforeUnload = (e) => {
//       if (!isNavigatingAway) {
//         setAttemptedAction("reload");
//         setShowModal(true);
//         if (onModalOpen) onModalOpen(); // Pause game
//       }

//       // Still show browser's default warning as backup
//       e.preventDefault();
//       e.returnValue = "";
//       return "";
//     };

//     // Intercept back/forward button
//     const handlePopState = (e) => {
//       if (!isNavigatingAway) {
//         setAttemptedAction("navigate");
//         setShowModal(true);
//         if (onModalOpen) onModalOpen(); // Pause game
//         // Push state back to prevent navigation
//         window.history.pushState(null, "", window.location.href);
//       }
//     };

//     // Add a state to detect back button
//     window.history.pushState(null, "", window.location.href);

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     window.addEventListener("popstate", handlePopState);

//     // Detect common reload shortcuts
//     const handleKeyDown = (e) => {
//       // Ctrl+R, Cmd+R, F5, Ctrl+F5
//       if (
//         (e.key === "r" && (e.ctrlKey || e.metaKey)) ||
//         e.key === "F5" ||
//         (e.key === "F5" && e.ctrlKey)
//       ) {
//         e.preventDefault();
//         setAttemptedAction("reload");
//         setShowModal(true);
//         if (onModalOpen) onModalOpen(); // Pause game
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//       window.removeEventListener("popstate", handlePopState);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [isActive, onModalOpen]);

//   const handleClose = () => {
//     setShowModal(false);
//     if (onModalClose) onModalClose(); // Resume game
//   };

//   const handleForceLeave = () => {
//     // User really wants to leave - let them
//     setShowModal(false);
//     if (onModalClose) onModalClose(); // Clean up before leaving
//     window.removeEventListener("beforeunload", () => {});

//     if (attemptedAction === "reload") {
//       window.location.reload();
//     } else {
//       window.history.back();
//     }
//   };

//   if (!showModal) return null;
import React, { useState, useEffect, useRef } from "react"; // ✅ add useRef
import { PRODUCTION_MODE } from "../participantConfig";

const ReloadWarningModal = ({
  isActive,
  userId,
  onModalOpen,
  onModalClose,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState(null);
  const beforeUnloadRef = useRef(null); // ✅ store handler so it can be removed

  useEffect(() => {
    if (!isActive || !PRODUCTION_MODE) return;

    let isNavigatingAway = false;

    const handleBeforeUnload = (e) => {
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

    beforeUnloadRef.current = handleBeforeUnload; // ✅ save reference

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // ✅ Correctly removes the exact listener that was added
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

    // ✅ Remove using the stored reference — the old anonymous () => {} removed nothing
    if (beforeUnloadRef.current) {
      window.removeEventListener("beforeunload", beforeUnloadRef.current);
      beforeUnloadRef.current = null;
    }

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
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#fff3cd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            ⚠️
          </div>
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
            <p style={{ margin: "0 0 12px 0", fontWeight: "600" }}>
              Why this matters:
            </p>
            <ul style={{ margin: 0, paddingLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}>
                Each participant can only access the experiment{" "}
                <strong>ONE TIME</strong>
              </li>
              <li style={{ marginBottom: "8px" }}>
                Reloading or leaving will end your session permanently
              </li>
              <li style={{ marginBottom: "8px" }}>
                You will not be able to log in again with your credentials
              </li>
              <li style={{ marginBottom: "8px" }}>
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

          <p style={{ margin: 0, color: "#666" }}>
            If you're experiencing technical issues, please contact the
            researcher instead of reloading the page.
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
