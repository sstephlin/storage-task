import React, { useState, useEffect, useRef } from "react";
import VialGame from "./VialGame";
import Tutorial from "./instructions";
import "./styles/TrainingPhase.css";

export const TRAINING_PARAMS = {
  MAX_ROUNDS: 10,
  ROUND_DURATION: 10,
  REQUIRED_SURVIVAL_RATE: 0.5,

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

  VIAL_COLORS: {
    primary: "#a78bfa",
    secondary: "#34d399",
    optimal: "#fbbf24",
    danger: "#f87171",
  },
};
const TRAINING_ROUND_TEMPLATES = {
  one_vial_alternating: [
    // bucket
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.SLOW,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.MEDIUM,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.SLOW,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.MEDIUM,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.FAST,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },

    // no bucket
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.SLOW,
      bucket: { vial1: 0, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.MEDIUM,
      bucket: { vial1: 0, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.SLOW,
      bucket: { vial1: 0, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.MEDIUM,
      bucket: { vial1: 0, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_alternating.FAST,
      bucket: { vial1: 0, vial2: 0 },
      phase: "abundance",
    },
  ],
  one_vial_always_bucket: [
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      bucket: { vial1: 1, vial2: 0 },
      phase: "deprivation",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      bucket: { vial1: 1, vial2: 0 },
      phase: "deprivation",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      bucket: { vial1: 1, vial2: 0 },
      phase: "deprivation",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      bucket: { vial1: 1, vial2: 0 },
      phase: "deprivation",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.FAST,
      bucket: { vial1: 1, vial2: 0 },
      phase: "abundance",
    },
    {
      velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.FAST,
      bucket: { vial1: 1, vial2: 0 },
      phase: "deprivation",
    },
  ],
  one_vial_always_bucket_simple: [
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
  ],
  one_vial_always_bucket_simple_fast: [
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
    // {
    //   velocity: TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
    //   bucket: { vial1: 1, vial2: 0 },
    //   phase: "abundance",
    // },
  ],
  two_vials_single_bucket: [
    // { velocity: 1.4, bucket: { vial1: 1, vial2: 0 }, phase: "abundance" },
  ],
  two_vials_phases: [
    // { velocity: 1.4, bucket: { vial1: 1, vial2: 0 }, phase: "abundance" },
  ],
};
const buildTrainingSequences = (gameVersion) => {
  const templates = TRAINING_ROUND_TEMPLATES[gameVersion] ?? [];
  const shuffled = [...templates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    velocitySequence: shuffled.map((r) => r.velocity),
    bucketSequence: shuffled.map((r) => r.bucket),
    phaseSequence: shuffled.map((r) => r.phase),
  };
};

const TrainingPhase = ({
  userId,
  gameVersion,
  onComplete,
  versionConfig,
  onDisqualified,
}) => {
  const [showTutorial, setShowTutorial] = useState(true);
  // const [trainingAttempt, setTrainingAttempt] = useState(1);
  const [showIntro, setShowIntro] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const roundResultsRef = useRef([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [showDisqualified, setShowDisqualified] = useState(false);
  const [trainingSequences] = useState(() =>
    buildTrainingSequences(gameVersion),
  );

  console.log("TrainingPhase received gameVersion:", gameVersion);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setShowIntro(true);
  };

  const handleStartTraining = () => {
    setShowIntro(false);
    setIsTraining(true);
    setRoundResults([]);
    roundResultsRef.current = [];
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
    reminders.push(...REMINDER_BANK.core);
    reminders.push(
      ...(versionConfig.numVials === 2
        ? REMINDER_BANK.controls.twoVials
        : REMINDER_BANK.controls.oneVial),
    );
    reminders.push(...REMINDER_BANK.controls.bucketGeneral);

    const behavior = versionConfig.bucketBehavior;
    if (REMINDER_BANK.bucketBehavior[behavior]) {
      reminders.push(...REMINDER_BANK.bucketBehavior[behavior]);
    }
    if (versionConfig.hasPhases) {
      reminders.push(...REMINDER_BANK.phases);
    }

    return reminders.slice(0, 6);
  };

  const generateRoundFeedback = (wasSuccessful, roundNumber) => {
    if (!wasSuccessful) {
      return "Round failed! Remember to keep vials in the optimal zone.";
    } else {
      return `Great job! Round ${roundNumber} complete!`;
    }
  };

  const handleRoundComplete = (wasSuccessful) => {
    const newResults = [...roundResultsRef.current, wasSuccessful];
    roundResultsRef.current = newResults;
    setRoundResults(newResults);
    console.log(
      "handleRoundComplete called:",
      wasSuccessful,
      "| ref now:",
      roundResultsRef.current,
    );

    const feedback = generateRoundFeedback(wasSuccessful, newResults.length);
    setCurrentFeedback(feedback);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  const handleTrainingEnd = () => {
    setIsTraining(false);
    console.log(
      "handleTrainingEnd | ref:",
      roundResultsRef.current,
      "| state:",
      roundResults,
    );

    const successCount = roundResultsRef.current.filter((r) => r).length;
    const successRate = successCount / TRAINING_PARAMS.MAX_ROUNDS;

    if (successRate >= TRAINING_PARAMS.REQUIRED_SURVIVAL_RATE) {
      setTrainingComplete(true);
    } else {
      setShowDisqualified(true);
      setTimeout(() => {
        if (onDisqualified) {
          onDisqualified();
        }
      }, 5000);
    }
  };

  const handleStartMainGame = () => {
    onComplete();
  };

  if (showTutorial) {
    return (
      <Tutorial onExit={handleTutorialComplete} gameVersion={gameVersion} />
    );
  }

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

  if (showDisqualified) {
    const successCount = roundResultsRef.current.filter((r) => r).length;
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
          trainingParams={{ ...TRAINING_PARAMS, sequences: trainingSequences }}
          onRoundComplete={handleRoundComplete}
        />
      </div>
    );
  }

  return null;
};

export default TrainingPhase;
