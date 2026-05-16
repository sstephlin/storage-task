import React, { useState, useEffect, useRef } from "react";
import VialGame from "./VialGame";
import Tutorial from "./instructions";
import "./styles/TrainingPhase.css";
import { PARTIAL_COMPLETION_CODES } from "./params";
import { logTrainingResult } from "./logging";

export const TRAINING_PARAMS = {
  MAX_ROUNDS: 1,
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
    one_vial_always_bucket_simple: {
      SLOW: 1.2,
      MEDIUM: 1.4,
      FAST: 1.6,
    },
    one_vial_always_bucket_simple_fast: {
      SLOW: 2.2,
      MEDIUM: 2.4,
      FAST: 2.6,
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

const makeRounds = (velocities, bucket, phases) =>
  velocities.map((velocity, i) => ({
    velocity,
    bucket,
    phase: Array.isArray(phases) ? phases[i] : phases,
  }));

const TRAINING_ROUND_TEMPLATES = {
  one_vial_alternating: [
    // bucket rounds
    ...makeRounds(
      [
        ...Array(2).fill(TRAINING_PARAMS.VELOCITIES.one_vial_alternating.SLOW),
        ...Array(2).fill(
          TRAINING_PARAMS.VELOCITIES.one_vial_alternating.MEDIUM,
        ),
        ...Array(1).fill(TRAINING_PARAMS.VELOCITIES.one_vial_alternating.FAST),
      ],
      { vial1: 1, vial2: 0 },
      "abundance",
    ),
    // no bucket rounds
    ...makeRounds(
      [
        ...Array(2).fill(TRAINING_PARAMS.VELOCITIES.one_vial_alternating.SLOW),
        ...Array(2).fill(
          TRAINING_PARAMS.VELOCITIES.one_vial_alternating.MEDIUM,
        ),
        ...Array(1).fill(TRAINING_PARAMS.VELOCITIES.one_vial_alternating.FAST),
      ],
      { vial1: 0, vial2: 0 },
      "abundance",
    ),
  ],

  one_vial_always_bucket: makeRounds(
    [
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.SLOW,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.MEDIUM,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.FAST,
      TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket.FAST,
    ],
    { vial1: 1, vial2: 0 },
    [
      "abundance",
      "abundance",
      "deprivation",
      "deprivation",
      "abundance",
      "abundance",
      "deprivation",
      "deprivation",
      "abundance",
      "deprivation",
    ],
  ),

  one_vial_always_bucket_simple: makeRounds(
    [
      ...Array(4).fill(
        TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
      ),
      ...Array(3).fill(
        TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
      ),
      ...Array(3).fill(
        TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
      ),
    ],
    { vial1: 1, vial2: 0 },
    "abundance",
  ),

  one_vial_always_bucket_simple_fast: makeRounds(
    [
      ...Array(4).fill(
        TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.SLOW,
      ),
      ...Array(3).fill(
        TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.MEDIUM,
      ),
      ...Array(3).fill(
        TRAINING_PARAMS.VELOCITIES.one_vial_always_bucket_simple.FAST,
      ),
    ],
    { vial1: 1, vial2: 0 },
    "abundance",
  ),
};

//build and shuffle training sequence settings
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
  onInstructionsDisqualified,
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
  const [disqualifyCountdown, setDisqualifyCountdown] = useState(5);
  const [codeConfirmed, setCodeConfirmed] = useState(false);

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

  // const handleTrainingEnd = () => {
  //   setIsTraining(false);

  //   const results = roundResultsRef.current;
  //   const successCount = results.filter((r) => r).length;
  //   const totalRecorded = results.length;

  //   // Guard against no data
  //   if (totalRecorded === 0) {
  //     logTrainingResult(false, 0, 0);
  //     setShowDisqualified(true);
  //     return;
  //   }

  //   const successRate = successCount / totalRecorded; // ← use actual length

  //   if (successRate >= TRAINING_PARAMS.REQUIRED_SURVIVAL_RATE) {
  //     setTrainingComplete(true);
  //   } else {
  //     setShowDisqualified(true);
  //     setTimeout(() => {
  //       if (onDisqualified) onDisqualified();
  //     }, 5000);
  //   }
  // };
  const handleTrainingEnd = () => {
    setIsTraining(false);
    const results = roundResultsRef.current;
    const successCount = results.filter((r) => r).length;
    const totalRecorded = results.length;

    if (totalRecorded === 0) {
      logTrainingResult(false, 0, 0);
      setShowDisqualified(true);
      return;
    }

    const successRate = successCount / totalRecorded;
    const passed = successRate >= TRAINING_PARAMS.REQUIRED_SURVIVAL_RATE;
    logTrainingResult(passed, successCount, TRAINING_PARAMS.MAX_ROUNDS);

    if (passed) {
      setTrainingComplete(true);
    } else {
      setShowDisqualified(true);
      setTimeout(() => {
        if (onDisqualified) onDisqualified();
      }, 5000);
    }
  };

  const handleStartMainGame = () => {
    onComplete();
  };

  useEffect(() => {
    if (!showDisqualified) return;

    const interval = setInterval(() => {
      setDisqualifyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showDisqualified]);
  if (showTutorial) {
    return (
      <Tutorial
        onExit={handleTutorialComplete}
        gameVersion={gameVersion}
        userId={userId}
        onDisqualified={onInstructionsDisqualified}
      />
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
            {onDisqualified && (
              <p style={{ marginTop: "16px", color: "#666", fontSize: "16px" }}>
                Redirecting in <strong>{disqualifyCountdown}</strong> second
                {disqualifyCountdown !== 1 ? "s" : ""}…
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (trainingComplete) {
    const partialCode = PARTIAL_COMPLETION_CODES[gameVersion];

    return (
      <div className="training-complete">
        <div className="training-complete-content">
          <h2>Great Job!</h2>
          <div className="results-summary">
            <p className="ready-message">Now we can move to the main game!</p>
          </div>

          {partialCode && (
            <div className="partial-code-box">
              <p className="partial-code-warning">
                The game will begin now. We ask that you complete the full task
                and the completion survey. If you must exit the task before
                completion, you <strong>MUST</strong> use the code below to
                avoid being penalized and to be compensated for your time.
                Please save this code in case this occurs.
              </p>
              <div className="partial-code-display">{partialCode}</div>
              <div className="partial-code-confirm">
                <input
                  type="checkbox"
                  id="code-confirm"
                  checked={codeConfirmed}
                  onChange={(e) => setCodeConfirmed(e.target.checked)}
                />
                <label htmlFor="code-confirm">
                  I understand that I need this code if I exit early, and I have
                  saved it.
                </label>
              </div>
            </div>
          )}

          <button
            className="start-main-btn"
            onClick={handleStartMainGame}
            disabled={partialCode && !codeConfirmed}
          >
            Click here to start the main game
          </button>
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
