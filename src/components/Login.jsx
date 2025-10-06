import React, { useState } from "react";
import "../styles/Login.css";

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      setError("Please enter a User ID");
      return;
    }

    // Validate user ID (alphanumeric, underscores, hyphens)
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(userId.trim())) {
      setError(
        "User ID can only contain letters, numbers, underscores, and hyphens"
      );
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
        <p className="login-subtitle">Enter your User ID to start playing</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError("");
              }}
              placeholder="Enter your user ID"
              className={error ? "error" : ""}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="login-button">
            Start Game
          </button>

          <button
            type="button"
            onClick={handleGenerateId}
            className="generate-button"
          >
            Generate Random ID
          </button>
        </form>

        <div className="login-info">
          <p>Your User ID will be saved in the URL for easy access later.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
