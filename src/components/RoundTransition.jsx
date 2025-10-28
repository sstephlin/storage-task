import React, { useState, useEffect } from "react";
import "../styles/RoundTransition.css";

const RoundTransition = ({ roundNumber, wasSuccessful, onComplete }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Small delay before transition complete
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const getMessage = () => {
    if (wasSuccessful) {
      const messages = [
        "Nice job! On to the next round!",
        // "Great work! Keep it up!",
        // "Excellent! Moving forward!",
        // "Well done! Next round loading...",
        // "Perfect! Let's continue!",
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        // "Don't give up! Try again!",
        // "Keep trying! Next round ahead!",
        // "Stay focused! Moving on...",
        // "You've got this! Next round!",
        "Round Failed! It's OK, Let's try again...",
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  };

  return (
    <div className="round-transition">
      <div className="transition-content">
        <h2 className="transition-message">{getMessage()}</h2>

        <div className="countdown-container">
          <div className={`countdown ${countdown === 0 ? "fade-out" : ""}`}>
            {countdown > 0 ? countdown : ""}
          </div>
        </div>

        <div className="robot-track">
          <div className="robot">
            <div className="robot-head">
              <div className="robot-eye left"></div>
              <div className="robot-eye right"></div>
              <div className="robot-antenna"></div>
            </div>
            <div className="robot-body">
              <div className="robot-chest"></div>
            </div>
            <div className="robot-arms">
              <div className="robot-arm left"></div>
              <div className="robot-arm right"></div>
            </div>
            <div className="robot-legs">
              <div className="robot-leg left"></div>
              <div className="robot-leg right"></div>
            </div>
          </div>
        </div>

        <p className="next-round-info">Round {roundNumber + 1} loading...</p>
      </div>
    </div>
  );
};

export default RoundTransition;
