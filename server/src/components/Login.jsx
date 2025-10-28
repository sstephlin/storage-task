import React, { useState } from "react";
import {
  EXPERIMENT_CONFIG,
  isValidParticipantId,
  getValidationError,
} from "../participantConfig";
// import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      setError("Please enter a Participant ID");
      return;
    }

    // Validate participant ID
    if (!isValidParticipantId(userId.trim())) {
      setError(getValidationError(userId.trim()));
      return;
    }

    onLogin(userId.trim());
  };

  const handleGenerateId = () => {
    // Generate a random user ID
    const randomId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setUserId(randomId);
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Two Vials Game</h1>
        <p className="login-subtitle">
          {EXPERIMENT_CONFIG.REQUIRE_PREASSIGNED_ID
            ? "Enter your assigned Participant ID to begin"
            : "Enter a Participant ID to start playing"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId">
              {EXPERIMENT_CONFIG.REQUIRE_PREASSIGNED_ID
                ? "Participant ID"
                : "User ID"}
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError("");
              }}
              placeholder={
                EXPERIMENT_CONFIG.REQUIRE_PREASSIGNED_ID
                  ? "e.g., P001"
                  : "Enter your ID"
              }
              className={error ? "error" : ""}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="login-button">
            Start Game
          </button>

          {EXPERIMENT_CONFIG.ALLOW_RANDOM_ID && (
            <button
              type="button"
              onClick={handleGenerateId}
              className="generate-button"
            >
              Generate Random ID
            </button>
          )}
        </form>

        <div className="login-info">
          <p>
            {EXPERIMENT_CONFIG.REQUIRE_PREASSIGNED_ID
              ? "Use the Participant ID provided to you by the researcher."
              : "Your ID will be saved in the URL for easy access later."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
