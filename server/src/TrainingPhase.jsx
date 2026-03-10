import React, { useState, useEffect } from "react";
import VialGame from "./VialGame";
import Tutorial from "./instructions"; // Import your Tutorial wrapper
import "./styles/TrainingPhase.css";

// Training-specific parameters
export const TRAINING_PARAMS = {
  MAX_ROUNDS: 10,
  ROUND_DURATION: 10,
  REQUIRED_SURVIVAL_RATE: 0.5, // Must survive 50% of rounds

  // Slower velocities for training
  VELOCITIES: {
    one_vial_alternating: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    one_vial_always_bucket: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    two_vials_single_bucket: {
      SLOW: 1.4,
      MEDIUM: 1.5,
      FAST: 1.6,
    },
    two_vials_phases: {
      SLOW: 1.4,
      MEDIUM: 1.5,
      FAST: 1.6,
    },
  },

  // Training uses different vial colors
  VIAL_COLORS: {
    primary: "#a78bfa", // Purple instead of blue
    secondary: "#34d399", // Green instead of red
    optimal: "#fbbf24", // Amber for optimal zone
    danger: "#f87171", // Light red for danger
  },
};

const TrainingPhase = ({
  userId,
  gameVersion,
  onComplete,
  versionConfig,
  onDisqualified,
}) => {
  const [showTutorial, setShowTutorial] = useState(true); // Start with tutorial
  const [trainingAttempt, setTrainingAttempt] = useState(1);
  const [showIntro, setShowIntro] = useState(false); // Will show after tutorial
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [showDisqualified, setShowDisqualified] = useState(false);
  console.log("TrainingPhase received gameVersion:", gameVersion);

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setShowIntro(true); // Show training intro after tutorial
  };

  const handleStartTraining = () => {
    setShowIntro(false);
    setIsTraining(true);
    setRoundResults([]);
  };

  const REMINDER_BANK = {
    core: ["Try not to let the vials overflow or empty completely."],

    controls: {
      oneVial: ["Use ← to add to the vial."],
      twoVials: ["Use ← / → to add to the left / right vial."],
      bucketGeneral: ["Use ↑ to empty the bucket when it's available."],
    },

    bucketBehavior: {
      alternating: [
        "The bucket may not always be available—take advantage when it's available.",
      ],
    },

    phases: [
      "During deprivation phases, plan ahead before availability changes.",
      "Stabilize both vials early at the start of each phase.",
    ],
  };

  const getTrainingReminders = (versionConfig) => {
    if (!versionConfig)
      return ["Stay steady and keep the vials in a safe range."];

    const reminders = [];

    // Always include core
    reminders.push(...REMINDER_BANK.core);

    // Controls based on number of vials
    reminders.push(
      ...(versionConfig.numVials === 2
        ? REMINDER_BANK.controls.twoVials
        : REMINDER_BANK.controls.oneVial),
    );

    // Bucket control hint
    reminders.push(...REMINDER_BANK.controls.bucketGeneral);

    // Bucket-behavior-specific strategy
    const behavior = versionConfig.bucketBehavior;
    if (REMINDER_BANK.bucketBehavior[behavior]) {
      reminders.push(...REMINDER_BANK.bucketBehavior[behavior]);
    }

    // Phase-specific tips
    if (versionConfig.hasPhases) {
      reminders.push(...REMINDER_BANK.phases);
    }

    return reminders.slice(0, 6);
  };

  const handleRoundComplete = (wasSuccessful) => {
    const newResults = [...roundResults, wasSuccessful];
    setRoundResults(newResults);

    // Generate feedback
    const feedback = generateRoundFeedback(wasSuccessful, newResults.length);
    setCurrentFeedback(feedback);
    setShowFeedback(true);

    // Hide feedback after 3 seconds
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  const handleTrainingEnd = () => {
    setIsTraining(false);

    const successCount = roundResults.filter((r) => r).length;
    const successRate = successCount / TRAINING_PARAMS.MAX_ROUNDS;

    if (successRate >= TRAINING_PARAMS.REQUIRED_SURVIVAL_RATE) {
      setTrainingComplete(true);
    } else {
      // Failed training - disqualify permanently
      setShowDisqualified(true);

      // Notify parent component after showing disqualification message
      setTimeout(() => {
        if (onDisqualified) {
          onDisqualified();
        }
      }, 5000); // Give them 5 seconds to read the message
    }
  };

  const handleStartMainGame = () => {
    onComplete();
  };

  const generateRoundFeedback = (wasSuccessful, roundNumber) => {
    if (!wasSuccessful) {
      const failureMessages = [
        "Round failed! Remember to keep vials in the optimal zone.",
      ];
      return failureMessages[
        Math.floor(Math.random() * failureMessages.length)
      ];
    } else {
      const successMessages = [`Great job! Round ${roundNumber} complete!`];
      return successMessages[
        Math.floor(Math.random() * successMessages.length)
      ];
    }
  };

  // Show tutorial first
  if (showTutorial) {
    return (
      <Tutorial onExit={handleTutorialComplete} gameVersion={gameVersion} />
    );
  }

  // Training intro screen (after tutorial)
  if (showIntro) {
    const reminders = getTrainingReminders(versionConfig);

    return (
      <div className="training-intro">
        <div className="training-intro-content">
          <h1>Practice Time!</h1>
          <div className="training-info">
            <div className="reminder-box">
              <h3>Quick Reminders:</h3>
              <ul>
                {reminders.map((text, idx) => (
                  <li key={idx}>{text}</li>
                ))}
              </ul>
            </div>
          </div>

          <button className="start-training-btn" onClick={handleStartTraining}>
            Start Training
          </button>
        </div>
      </div>
    );
  }

  // Training failed - disqualification screen (PERMANENT)
  if (showDisqualified) {
    const successCount = roundResults.filter((r) => r).length;

    return (
      <div className="training-retry">
        <div className="training-retry-content">
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
          <h2>Training Not Completed</h2>

          <div className="results-summary">
            <p className="score-display">
              You survived <strong>{successCount}</strong> out of{" "}
              <strong>{TRAINING_PARAMS.MAX_ROUNDS}</strong> practice rounds
            </p>
            <p className="requirement">
              You needed to survive at least <strong>half the rounds</strong> to
              proceed to the main game.
            </p>
            <p style={{ marginTop: "30px", color: "#666", fontSize: "16px" }}>
              Unfortunately, you will not be able to continue with this study.
              Thank you for your time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Training success screen
  if (trainingComplete) {
    return (
      <div className="training-complete">
        <div className="training-complete-content">
          <h2>Great Job!</h2>
          <div className="results-summary">
            <p className="ready-message">Now we can move to the main game!</p>
            <button className="start-main-btn" onClick={handleStartMainGame}>
              Click here to start the main game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active training - render VialGame with training parameters
  if (isTraining) {
    return (
      <div className="training-active">
        {showFeedback && (
          <div className="training-feedback">{currentFeedback}</div>
        )}

        <VialGame
          userId={userId}
          gameVersion={gameVersion}
          onComplete={handleTrainingEnd}
          isPaused={false}
          isTrainingMode={true}
          trainingParams={TRAINING_PARAMS}
          onRoundComplete={handleRoundComplete}
        />
      </div>
    );
  }

  return null;
};

export default TrainingPhase;
