import React, { useState, useEffect } from "react";

const RobotJourneyProgress = ({
  currentRound,
  totalRounds,
  score,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);

  // Calculate progress based on rounds completed
  const progressPercent = Math.min((currentRound / totalRounds) * 100, 100);

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

  const robotPos = getRobotPosition(progress);
  const currentDotIndex = Math.floor((progress / 100) * (pathDots.length - 1));

  useEffect(() => {
    const duration = 2000; // Animation duration
    const steps = 60;
    const increment = progressPercent / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= progressPercent) {
        setProgress(progressPercent);
        clearInterval(timer);
        // Auto-close after animation completes + 1.5s delay
        setTimeout(onComplete, 1500);
      } else {
        setProgress(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [progressPercent, onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem",
      }}
    >
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
          Round {currentRound} of {totalRounds} • Score: {score}
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

          {/* Robot */}
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
        {progress >= 100 ? "🎉 Journey Complete!" : "🤖 Traveling..."}
      </div>
    </div>
  );
};

export default RobotJourneyProgress;
