import React, { useState, useEffect } from "react";
import "../styles/RoundTransition.css";

const RoundTransition = ({
  roundNumber,
  wasSuccessful,
  onComplete,
  totalRounds,
  score,
  cumulativeProgress = 0, // Performance-based progress (0-100) - NEW position
  previousProgress = 0, // Previous round's progress - OLD position
}) => {
  const [countdown, setCountdown] = useState(3);
  const [showJourney, setShowJourney] = useState(true);

  // Animated progress that will smoothly transition from previous to current
  const [journeyProgress, setJourneyProgress] = useState(previousProgress);

  // Animated round score counter
  const [animatedRoundScore, setAnimatedRoundScore] = useState(0);

  // Define the dotted path coordinates - more points for smoother robot movement
  const pathDots = [
    { x: 15, y: 35 },
    { x: 17, y: 39 },
    { x: 19, y: 43 },
    { x: 21, y: 47 },
    { x: 23, y: 51 },
    { x: 25, y: 55 },
    { x: 27, y: 57.5 },
    { x: 29, y: 59.5 },
    { x: 31, y: 60.5 },
    { x: 33, y: 61 },
    { x: 35, y: 61.5 },
    { x: 37, y: 62 },
    { x: 39, y: 62 },
    { x: 41, y: 61.8 },
    { x: 43, y: 61.5 },
    { x: 45, y: 61 },
    { x: 47, y: 60.5 },
    { x: 49, y: 59.5 },
    { x: 51, y: 58 },
    { x: 53, y: 56.5 },
    { x: 55, y: 55 },
    { x: 57, y: 53 },
    { x: 59, y: 51 },
    { x: 61, y: 49 },
    { x: 63, y: 47 },
    { x: 65, y: 44.5 },
    { x: 67, y: 42 },
    { x: 69, y: 39 },
    { x: 71, y: 36 },
    { x: 72.5, y: 34 },
    { x: 74, y: 32 },
    { x: 75.5, y: 30 },
    { x: 77, y: 27.5 },
    { x: 78.5, y: 25 },
    { x: 80, y: 23 },
    { x: 81, y: 21.5 },
    { x: 82, y: 20 },
  ];

  // Calculate robot position along path
  const getRobotPosition = (percent) => {
    // Clamp percent to valid range
    const clampedPercent = Math.max(0, Math.min(100, percent));

    const totalSegments = pathDots.length - 1;
    const segmentLength = 100 / totalSegments;
    const currentSegment = Math.floor(clampedPercent / segmentLength);
    const segmentProgress = (clampedPercent % segmentLength) / segmentLength;

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

  // Calculate goal position at 75%
  const goalPosition = getRobotPosition(75);
  const repairShopPosition = getRobotPosition(cumulativeProgress);

  const robotPos = getRobotPosition(journeyProgress);

  // For display purposes
  const displayProgress = Math.round(journeyProgress);

  // Calculate per-round score (0-100 scale based on this round's performance)
  const progressGained = cumulativeProgress - previousProgress;
  const maxScorePerRound = 100 / totalRounds; // Max possible score for one round
  const roundScore = ((progressGained / maxScorePerRound) * 10).toFixed(2); // Scale to 0-10
  const roundScoreClamped = Math.max(0, Math.min(10, roundScore)); // Ensure 0-100 range

  // Check if robot has passed the goal
  const hasPassedGoal = journeyProgress >= 75;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Journey animation - animate from previousProgress to cumulativeProgress
  useEffect(() => {
    if (showJourney) {
      const duration = 2000; // 2 seconds for the journey animation
      const steps = 60; // 60 steps for smooth animation
      const progressDelta = cumulativeProgress - previousProgress;

      if (Math.abs(progressDelta) < 0.01 && wasSuccessful) {
        setJourneyProgress(cumulativeProgress);
        setAnimatedRoundScore(roundScoreClamped);
        const timer = setTimeout(onComplete, 2500);
        return () => clearTimeout(timer);
      }

      const increment = progressDelta / steps;
      const scoreIncrement = roundScoreClamped / steps;
      let current = previousProgress;
      let currentScore = 0;
      let stepCount = 0;

      const timer = setInterval(() => {
        stepCount++;
        current += increment;
        currentScore += scoreIncrement;

        if (
          stepCount >= steps ||
          (progressDelta > 0 && current >= cumulativeProgress) ||
          (progressDelta < 0 && current <= cumulativeProgress)
        ) {
          setJourneyProgress(cumulativeProgress);
          setAnimatedRoundScore(roundScoreClamped);
          clearInterval(timer);
          // Auto-close after animation + delay
          setTimeout(onComplete, 1500);
        } else {
          setJourneyProgress(current);
          setAnimatedRoundScore(currentScore.toFixed(2));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [
    showJourney,
    cumulativeProgress,
    previousProgress,
    onComplete,
    roundScoreClamped,
  ]);

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
            <div
              style={{
                fontSize: "2.5rem",
                color: wasSuccessful ? "#16a34a" : "#dc2626",
                marginTop: "0.5rem",
                marginBottom: "0.25rem",
                fontWeight: "bold",
              }}
            >
              {animatedRoundScore} miles
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "#6b7280",
                marginTop: "0.25rem",
              }}
            >
              Overall Progress: {displayProgress}%
            </div>
            {hasPassedGoal && (
              <div
                style={{
                  fontSize: "1.25rem",
                  color: "#16a34a",
                  marginTop: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                🎯 Goal Reached!
              </div>
            )}
          </div>

          {/* Map Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              minWidth: "900px",
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

              {/* Continuous road path */}
              <path
                d="M 15 35 Q 20 45, 25 55 T 32 60 T 40 62 T 48 60 T 55 55 T 62 48 T 68 40 T 73 32 T 78 25 T 82 20"
                stroke="#9ca3af"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />

              {/* Road center line (dashed) */}
              <path
                d="M 15 35 Q 20 45, 25 55 T 32 60 T 40 62 T 48 60 T 55 55 T 62 48 T 68 40 T 73 32 T 78 25 T 82 20"
                stroke="#ffffff"
                strokeWidth="0.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="2 2"
                opacity="0.8"
              />

              {/* Goal marker at 75% */}
              <g transform={`translate(${goalPosition.x}, ${goalPosition.y})`}>
                {/* Flag pole */}
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-8"
                  stroke="#16a34a"
                  strokeWidth="0.3"
                />
                {/* Flag */}
                <path
                  d="M 0 -8 L 3 -7 L 3 -5 L 0 -6 Z"
                  fill={hasPassedGoal ? "#16a34a" : "#22c55e"}
                  stroke="#16a34a"
                  strokeWidth="0.2"
                />
                {/* Base circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="1.2"
                  fill="none"
                  stroke={hasPassedGoal ? "#16a34a" : "#22c55e"}
                  strokeWidth="0.3"
                  strokeDasharray="0.5 0.5"
                />
              </g>
              {/* Repair Shop - only shown on failed rounds */}
              {!wasSuccessful && (
                <g
                  transform={`translate(${repairShopPosition.x}, ${repairShopPosition.y})`}
                >
                  <image
                    href="/RepairShopLogo.svg"
                    x="-4"
                    y="-8"
                    width="10"
                    height="10"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              )}

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
            {journeyProgress >= 100
              ? "🎉 Journey Complete!"
              : hasPassedGoal
                ? "🎯 Goal achieved! Keep going!"
                : wasSuccessful
                  ? `Round complete!`
                  : "Try again next round!"}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundTransition;
