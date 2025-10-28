import React, { useState, useEffect } from "react";
import VialGame from "./VialGame";
import Login from "./components/Login";
import { initializeSession, endSession } from "./logging";
import "./styles/App.css";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userIdFromUrl = params.get("userId");

    if (userIdFromUrl) {
      // User ID found in URL, auto-login
      handleLogin(userIdFromUrl);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (userId) {
        endSession();
      }
    };
  }, [userId]);

  const handleLogin = async (newUserId) => {
    // Update URL with user ID
    const url = new URL(window.location);
    url.searchParams.set("userId", newUserId);
    window.history.pushState({}, "", url);

    // Initialize Firebase session
    await initializeSession(newUserId);

    setUserId(newUserId);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    // End the current session
    await endSession();

    // Remove userId from URL
    const url = new URL(window.location);
    url.searchParams.delete("userId");
    window.history.pushState({}, "", url);

    setUserId(null);
  };

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

  if (!userId) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {/* <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          background: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        <span style={{ color: "#666" }}>
          User: <strong style={{ color: "#2c3e50" }}>{userId}</strong>
        </span>
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
          Logout
        </button>
      </div> */}
      <VialGame userId={userId} />
    </div>
  );
};

export default App;
