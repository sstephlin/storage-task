import React, { useState, useEffect } from "react";
import { validateCredentials, PRODUCTION_MODE } from "../participantConfig";
import { hasParticipantAccessed, checkReloadAttempt } from "../accessControl";

const Login = ({ onLogin }) => {
  const [participantId, setParticipantId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);

  useEffect(() => {
    // Check for reload attempt on mount
    const { isReload, shouldBlock } = checkReloadAttempt();
    if (shouldBlock) {
      setShowReloadWarning(true);
      setError(
        "This page was reloaded. You cannot continue the experiment. Please contact the researcher."
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate credentials
      const participant = validateCredentials(participantId.trim(), pin.trim());

      if (!participant) {
        setError("Invalid Participant ID or PIN. Please try again.");
        setIsLoading(false);
        return;
      }

      // Check if already accessed (only in production mode)
      if (PRODUCTION_MODE) {
        const alreadyAccessed = await hasParticipantAccessed(participant.id);
        if (alreadyAccessed) {
          setError(
            "This participant has already completed the experiment. Each participant can only complete the experiment once."
          );
          setIsLoading(false);
          return;
        }
      }

      // Success - proceed to game
      onLogin(participant.id, participant.version);
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  const handleParticipantIdChange = (e) => {
    const value = e.target.value.toUpperCase(); // Convert to uppercase for consistency
    setParticipantId(value);
    setError("");
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4); // Only digits, max 4
    setPin(value);
    setError("");
  };

  if (showReloadWarning) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
          color: "#e74c3c",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "20px",
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              color: "#e74c3c",
              marginBottom: "20px",
              fontSize: "24px",
            }}
          >
            Session Error
          </h2>
          <p
            style={{
              color: "#555",
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            {error}
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

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          maxWidth: "400px",
          minWidth: "400px",
          width: "100%",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "10px",
            fontSize: "28px",
          }}
        >
          Vial Task Experiment
        </h2>

        {!PRODUCTION_MODE && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <strong style={{ color: "#856404" }}>Development Mode</strong>
            <p
              style={{ margin: "5px 0 0", fontSize: "12px", color: "#856404" }}
            >
              Authentication is bypassed
            </p>
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
            fontSize: "14px",
          }}
        >
          {PRODUCTION_MODE
            ? "Please enter your participant credentials to begin"
            : "Enter any ID to start (dev mode)"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="participantId"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#2c3e50",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Participant ID
            </label>
            <input
              id="participantId"
              type="text"
              value={participantId}
              onChange={handleParticipantIdChange}
              placeholder="e.g., P001"
              required
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
                fontFamily: "monospace",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>

          {PRODUCTION_MODE && (
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="pin"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#2c3e50",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={handlePinChange}
                placeholder="4-digit PIN"
                required
                disabled={isLoading}
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontFamily: "monospace",
                  letterSpacing: "8px",
                  textAlign: "center",
                  boxSizing: "border-box",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6a80e1ff")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#fee",
                border: "1px solid #fcc",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "20px",
                color: "#c33",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading ||
              !participantId.trim() ||
              (PRODUCTION_MODE && pin.length !== 4)
            }
            style={{
              width: "100%",
              padding: "14px",
              background:
                isLoading ||
                !participantId.trim() ||
                (PRODUCTION_MODE && pin.length !== 4)
                  ? "#ccc"
                  : "linear-gradient(135deg, #4b6986ff 0%, #334170ff 100%)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor:
                isLoading ||
                !participantId.trim() ||
                (PRODUCTION_MODE && pin.length !== 4)
                  ? "not-allowed"
                  : "pointer",
              transition: "transform 0.2s, opacity 0.3s",
            }}
            onMouseEnter={(e) => {
              if (
                !isLoading &&
                participantId.trim() &&
                (!PRODUCTION_MODE || pin.length === 4)
              ) {
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
          >
            {isLoading ? "Verifying..." : "Start Experiment"}
          </button>
          {!isLoading &&
            participantId.trim() &&
            (!PRODUCTION_MODE || pin.length === 4) && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  background: "#fff3e0",
                  border: "1px solid #ffb74d",
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: "#e65100",
                  textAlign: "center",
                  lineHeight: "1.5",
                }}
              >
                ⚠️ Once you begin the experiment, you will not be able to pause
                or restart. Doing so will invalidate your results.
              </div>
            )}
        </form>

        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
            fontSize: "12px",
            color: "#999",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0 }}>
            {PRODUCTION_MODE
              ? "Keep your credentials secure. Each participant can only complete the experiment once."
              : "Development mode: Skip authentication for testing"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
