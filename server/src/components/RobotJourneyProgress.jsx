import React, { useState, useEffect } from "react";
import "../styles/RoundTransition.css";

const RoundTransition = ({
  roundNumber,
  wasSuccessful,
  onComplete,
  totalRounds,
  score,
}) => {
  const [countdown, setCountdown] = useState(3);
  const [showJourney, setShowJourney] = useState(false);

  // Calculate previous and current progress
  const previousProgress = Math.min(
    ((roundNumber - 1) / totalRounds) * 100,
    100
  );
  const currentProgress = Math.min((roundNumber / totalRounds) * 100, 100);

  const [journeyProgress, setJourneyProgress] = useState(previousProgress);

  // Define the dotted path coordinates
  const pathDots = [
    { x: 15, y: 35 },
    { x: 20, y: 45 },
    { x: 25, y: 55 },
    { x: 32, y: 60 },
    { x: 40, y: 62 },
    { x: 48, y: 60 },
    { x: 55, y: 55 },
    { x: 62, y: 48 },
    { x: 68, y: 40 },
    { x: 73, y: 32 },
    { x: 78, y: 25 },
    { x: 82, y: 20 },
  ];

  // Calculate robot position along path
  const getRobotPosition = (percent) => {
    const totalSegments = pathDots.length - 1;
    const segmentLength = 100 / totalSegments;
    const currentSegment = Math.floor(percent / segmentLength);
    const segmentProgress = (percent % segmentLength) / segmentLength;

    if (currentSegment >= totalSegments) {
      return pathDots[pathDots.length - 1];
    }

    const start = pathDots[currentSegment];
    const end = pathDots[currentSegment + 1];

    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress,
    };
  };

  const robotPos = getRobotPosition(journeyProgress);
  const currentDotIndex = Math.floor(
    (journeyProgress / 100) * (pathDots.length - 1)
  );

  // For display purposes
  const displayProgress = Math.round(journeyProgress);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // After countdown, show the journey map
          setShowJourney(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Journey animation - animate from previous position to current position
  useEffect(() => {
    if (showJourney) {
      const duration = 2000;
      const steps = 60;
      const progressDelta = currentProgress - previousProgress;
      const increment = progressDelta / steps;
      let current = previousProgress;

      const timer = setInterval(() => {
        current += increment;
        if (current >= currentProgress) {
          setJourneyProgress(currentProgress);
          clearInterval(timer);
          // Auto-close after animation + delay
          setTimeout(onComplete, 1500);
        } else {
          setJourneyProgress(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [showJourney, currentProgress, previousProgress, onComplete]);

  const getMessage = () => {
    if (wasSuccessful) {
      return "Nice job! On to the next round!";
    } else {
      return "Round Failed! It's OK, Let's try again...";
    }
  };

  return (
    <div className="round-transition">
      {!showJourney ? (
        // Phase 1: Countdown with message
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
      ) : (
        // Phase 2: Journey map
        <div className="journey-content">
          {/* Header */}
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              Journey Progress
            </h2>
            <div style={{ fontSize: "1.25rem", color: "#6b7280" }}>
              Round {roundNumber} of {totalRounds} • Score: {score}
            </div>
          </div>

          {/* Map Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              aspectRatio: "16/9",
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              border: "4px solid #1f2937",
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <svg
              style={{ width: "100%", height: "100%" }}
              viewBox="0 0 100 80"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background terrain */}
              <path
                d="M 0 45 Q 15 38 30 42 T 60 38 T 100 45 L 100 80 L 0 80 Z"
                fill="#f3f4f6"
                opacity="0.5"
              />
              <path
                d="M 0 52 Q 20 48 40 50 T 80 48 T 100 52 L 100 80 L 0 80 Z"
                fill="#e5e7eb"
                opacity="0.5"
              />

              {/* Dotted path */}
              {pathDots.map((dot, index) => (
                <circle
                  key={index}
                  cx={dot.x}
                  cy={dot.y}
                  r="0.8"
                  fill={index <= currentDotIndex ? "#374151" : "#d1d5db"}
                  style={{ transition: "fill 0.3s" }}
                />
              ))}

              {/* City destination */}
              <g transform="translate(77, 12)">
                <g transform="translate(5, -3) scale(0.8)">
                  <path
                    d="M 0 0 L -2 0.5 L -1.5 1 L 0.5 0.5 L 2 1 L 2.5 0.5 L 1 0 L 2 -1 L 1.5 -1.5 Z"
                    fill="#60a5fa"
                    stroke="#2563eb"
                    strokeWidth="0.2"
                  />
                  <path
                    d="M 0 0 L -0.3 -2 L 0.3 -2 Z"
                    fill="#60a5fa"
                    stroke="#2563eb"
                    strokeWidth="0.2"
                  />
                </g>

                <rect
                  x="0"
                  y="5"
                  width="2"
                  height="5"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.3"
                />
                <rect
                  x="2.5"
                  y="3"
                  width="2.5"
                  height="7"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.3"
                />
                <rect
                  x="5.5"
                  y="4"
                  width="2"
                  height="6"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.3"
                />

                <rect x="0.4" y="6" width="0.4" height="0.5" fill="#60a5fa" />
                <rect x="1.2" y="6" width="0.4" height="0.5" fill="#60a5fa" />
                <rect x="0.4" y="7.5" width="0.4" height="0.5" fill="#60a5fa" />
                <rect x="1.2" y="7.5" width="0.4" height="0.5" fill="#60a5fa" />

                <rect x="3" y="4" width="0.4" height="0.5" fill="#60a5fa" />
                <rect x="3.8" y="4" width="0.4" height="0.5" fill="#60a5fa" />
                <rect x="3" y="5.5" width="0.4" height="0.5" fill="#60a5fa" />
                <rect x="3.8" y="5.5" width="0.4" height="0.5" fill="#60a5fa" />

                <rect x="6" y="5" width="0.4" height="0.5" fill="#60a5fa" />
                <rect x="6.8" y="5" width="0.4" height="0.5" fill="#60a5fa" />

                <ellipse
                  cx="-2"
                  cy="0"
                  rx="1.5"
                  ry="0.8"
                  fill="#e5e7eb"
                  opacity="0.7"
                />
                <ellipse
                  cx="10"
                  cy="1"
                  rx="1.8"
                  ry="1"
                  fill="#e5e7eb"
                  opacity="0.7"
                />
              </g>

              {/* Trees */}
              <g transform="translate(30, 65)">
                <rect x="-0.3" y="-2" width="0.6" height="2" fill="#78350f" />
                <circle cx="0" cy="-2" r="1.2" fill="#22c55e" />
              </g>

              <g transform="translate(55, 58)">
                <rect x="-0.3" y="-2" width="0.6" height="2" fill="#78350f" />
                <circle cx="0" cy="-2" r="1.2" fill="#22c55e" />
              </g>

              {/* Robot - render last so it appears on top */}
              <g transform={`translate(${robotPos.x}, ${robotPos.y})`}>
                <ellipse
                  cx="0"
                  cy="6"
                  rx="3"
                  ry="0.5"
                  fill="#000000"
                  opacity="0.1"
                />
                <rect
                  x="-2.5"
                  y="-1"
                  width="5"
                  height="4.5"
                  rx="0.5"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.4"
                />
                <rect
                  x="-2"
                  y="-4"
                  width="4"
                  height="2.5"
                  rx="0.3"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.4"
                />
                <rect
                  x="-1.5"
                  y="-3"
                  width="1.2"
                  height="0.8"
                  rx="0.2"
                  fill="#1f2937"
                />
                <rect
                  x="0.3"
                  y="-3"
                  width="1.2"
                  height="0.8"
                  rx="0.2"
                  fill="#1f2937"
                />
                <line
                  x1="0"
                  y1="-4"
                  x2="0"
                  y2="-5"
                  stroke="#1f2937"
                  strokeWidth="0.3"
                />
                <circle
                  cx="0"
                  cy="-5"
                  r="0.4"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.3"
                />
                <circle
                  cx="-3"
                  cy="0.5"
                  r="0.8"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.4"
                />
                <circle
                  cx="3"
                  cy="0.5"
                  r="0.8"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="0.4"
                />
                <rect
                  x="-1.5"
                  y="3.5"
                  width="1"
                  height="1.5"
                  rx="0.2"
                  fill="#1f2937"
                />
                <rect
                  x="0.5"
                  y="3.5"
                  width="1"
                  height="1.5"
                  rx="0.2"
                  fill="#1f2937"
                />
              </g>
            </svg>
          </div>

          {/* Footer message */}
          <div
            style={{
              marginTop: "2rem",
              textAlign: "center",
              fontSize: "1.125rem",
              color: "#6b7280",
            }}
          >
            {journeyProgress >= 100
              ? "🎉 Journey Complete!"
              : "🤖 Traveling..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundTransition;
