import React, { useState, useEffect, useRef } from "react";
import Robot from "./Robot";
import RoundTransition from "./RoundTransition";
import Tutorial from "./instructions";
import GasStationIndicator from "./GasStationIndicator";
import {
  logButtonPress,
  logRoundStart,
  logRoundEnd,
  logGasStationToggle,
} from "../data/logging";
import { PRODUCTION_MODE } from "../data/participantConfig";
import {
  GAME_PARAMS,
  VERSION_CONFIG,
  generateGameSequences,
  VERSION_BUTTON_DELAYS,
  VERSION_DEPRIVATION_CONFIG,
  VERSION_VELOCITIES,
} from "../data/params";
import {
  playOverheatSound,
  playPowerDownSound,
  playSuccessSound,
} from "./sounds";
import "../styles/VialGame.css";

const VialGame = ({
  userId,
  gameVersion,
  onComplete,
  isPaused = false,
  // Training mode props
  isTrainingMode = false,
  trainingParams = null,
  onRoundComplete = null,
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const versionConfig = VERSION_CONFIG[gameVersion];
  const buttonDelay = VERSION_BUTTON_DELAYS[gameVersion];
  const deprivationConfig = VERSION_DEPRIVATION_CONFIG[gameVersion];

  // Use training parameters if in training mode
  const maxRounds = isTrainingMode
    ? trainingParams.MAX_ROUNDS
    : GAME_PARAMS.MAX_ROUNDS;
  const roundDuration = isTrainingMode
    ? trainingParams.ROUND_DURATION
    : GAME_PARAMS.ROUND_DURATION;
  const velocityConfig = VERSION_VELOCITIES[gameVersion];

  // Generate all sequences based on version and mode
  const [gameSequences] = useState(() =>
    isTrainingMode && trainingParams?.sequences
      ? trainingParams.sequences
      : generateGameSequences(gameVersion, maxRounds, velocityConfig),
  );

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket1Level, setBucket1Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL,
  );
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL,
  );
  const [gameRunning, setGameRunning] = useState(false);
  const [isAddingDisabled, setIsAddingDisabled] = useState(false);

  // Round management
  const [currentRound, setCurrentRound] = useState(0);
  const currentDrainRate = gameSequences.velocitySequence[currentRound] || 1;
  const currentBucketConfig = gameSequences.bucketSequence[currentRound] || {
    vial1: 0,
    vial2: 0,
  };
  const currentPhase = gameSequences.phaseSequence[currentRound] || "abundance";

  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(roundDuration);
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [roundWasSuccessful, setRoundWasSuccessful] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  // Performance tracking for robot movement
  const [cumulativeProgress, setCumulativeProgress] = useState(0);
  const [previousRoundProgress, setPreviousRoundProgress] = useState(0);

  // Robot animation states
  const [isOverheated, setIsOverheated] = useState(false);
  const [isPoweredDown, setIsPoweredDown] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showingAnimation, setShowingAnimation] = useState(false);

  const gameLoopRef = useRef(null);
  const roundTimerRef = useRef(null);
  const keyLocked = useRef(false);
  const disableTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const cumulativeProgressRef = useRef(0);
  const distanceSamplesRef = useRef([]);
  const isAddingDisabledRef = useRef([false]);

  // Bucket assignment
  const vial1HasBucket = currentBucketConfig.vial1 === 1;
  const vial2HasBucket = currentBucketConfig.vial2 === 1;

  const vial1Paused = useRef(false);
  const vial2Paused = useRef(false);
  const setAddingDisabled = (val) => {
    isAddingDisabledRef.current = val;
    setIsAddingDisabled(val);
  };
  const [frozenAddingDisabled, setFrozenAddingDisabled] = useState(false);
  const isAbundancePhase = currentPhase === "abundance";

  useEffect(() => {
    if (isPaused) {
      setGameRunning(false);
    } else if (!isRoundTransition && !showingAnimation) {
      setGameRunning(true);
    }
  }, [isPaused, isRoundTransition, showingAnimation]);

  // used in debugging mode
  const handleTutorialExit = () => {
    setShowTutorial(false);
    setGameRunning(true);
  };

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (
      window.AudioContext || window.webkitAudioContext
    )();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-start game when tutorial is skipped (only in debugging mode)
  useEffect(() => {
    if (!showTutorial && !gameRunning && currentRound === 0) {
      setGameRunning(true);
      logRoundStart(
        0,
        {
          numVials: versionConfig.numVials,
          vial1HasBucket: vial1HasBucket,
          vial2HasBucket: vial2HasBucket,
          velocity: currentDrainRate,
          setpoint: GAME_PARAMS.OPTIMAL_LEVEL,
          phase: currentPhase,
          initialVial1Level: vial1Level,
          initialVial2Level: vial2Level,
          initialBucket1Level: bucket1Level,
          initialBucket2Level: bucket2Level,
          isTrainingMode: isTrainingMode,
          gameVersion: gameVersion,
        },
        isTrainingMode,
      );
      logGasStationToggle(!isAddingDisabledRef.current, isTrainingMode, true);
    }
  }, [showTutorial]);

  const handleAddVial = (vialNum, event, getCurrentState) => {
    const setVial = vialNum === 1 ? setVial1Level : setVial2Level;
    const vialPausedRef = vialNum === 1 ? vial1Paused : vial2Paused;
    event.preventDefault();
    keyLocked.current = true;
    logButtonPress(
      vialNum === 1 ? "add_vial_1" : "add_vial_2",
      {
        ...getCurrentState(),
        velocity: currentDrainRate,
        setpoint: GAME_PARAMS.OPTIMAL_LEVEL,
        gasStationActive: !isAddingDisabledRef.current,
      },
      isTrainingMode,
      isAddingDisabledRef.current ? 0 : GAME_PARAMS.ADD_AMOUNT,
    );
    if (!isAddingDisabledRef.current) {
      vialPausedRef.current = true;
      setVial((prev) =>
        Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT),
      );
      setTimeout(() => {
        vialPausedRef.current = false;
      }, 100);
    }
    setTimeout(() => {
      keyLocked.current = false;
    }, buttonDelay);
  };
  const handleEmptyBucket = (vialNum, event, getCurrentState) => {
    const bucketLevel = vialNum === 1 ? bucket1Level : bucket2Level;
    const setVial = vialNum === 1 ? setVial1Level : setVial2Level;
    const setBucket = vialNum === 1 ? setBucket1Level : setBucket2Level;
    const currentVialLevel = vialNum === 1 ? vial1Level : vial2Level;
    const actionName = vialNum === 1 ? "empty_bucket_1" : "empty_bucket_2";

    event.preventDefault();
    keyLocked.current = true;

    const maxAddAmount = GAME_PARAMS.OPTIMAL_LEVEL - currentVialLevel;
    const amountToAdd =
      maxAddAmount > 0
        ? Math.min(maxAddAmount, bucketLevel, GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
        : 0;

    logButtonPress(
      actionName,
      {
        ...getCurrentState(),
        velocity: currentDrainRate,
        setpoint: GAME_PARAMS.OPTIMAL_LEVEL,
        gasStationActive: !isAddingDisabledRef.current,
      },
      isTrainingMode,
      +amountToAdd.toFixed(2),
    );

    if (amountToAdd > 0) {
      setVial((prev) => prev + amountToAdd);
      setBucket((prev) => Math.max(0, prev - amountToAdd));
    }

    setTimeout(() => {
      keyLocked.current = false;
    }, buttonDelay);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (
        isRoundTransition ||
        !gameRunning ||
        showTutorial ||
        showingAnimation ||
        isPaused
      )
        return;
      if (event.repeat) return;
      if (keyLocked.current) return;

      const getCurrentState = () => ({
        vial1Level,
        vial2Level,
        bucket1Level,
        bucket2Level,
        currentRound,
        score,
        roundTimeRemaining,
        currentDrainRate,
        velocity: currentDrainRate,
        roundWasSuccessful,
        setpoint: GAME_PARAMS.OPTIMAL_LEVEL,
        addAmount: GAME_PARAMS.ADD_AMOUNT,
        isAddingDisabled: isAddingDisabledRef.current,
        gasStationActive: !isAddingDisabledRef.current,
      });

      switch (event.key) {
        case "ArrowLeft":
          handleAddVial(1, event, getCurrentState);
          break;
        case "ArrowRight":
          if (versionConfig.numVials !== 2) return;
          handleAddVial(2, event, getCurrentState);
          break;
        case "ArrowUp":
          if (vial1HasBucket) handleEmptyBucket(1, event, getCurrentState);
          else if (vial2HasBucket && versionConfig.numVials === 2)
            handleEmptyBucket(2, event, getCurrentState);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isRoundTransition,
    gameRunning,
    showTutorial,
    showingAnimation,
    isPaused,
    vial1Level,
    vial2Level,
    vial1HasBucket,
    vial2HasBucket,
    bucket1Level,
    bucket2Level,
    versionConfig.numVials,
    buttonDelay,
  ]);

  const tickVial = (prev, isPausedRef, hasbucket, setBucket) => {
    if (isPausedRef.current) return prev;
    const newLevel = Math.max(0, prev - currentDrainRate);

    if (hasbucket && newLevel < prev) {
      if (prev > GAME_PARAMS.OPTIMAL_LEVEL) {
        setBucket((bucketPrev) => Math.min(100, bucketPrev + currentDrainRate));
      }
    }
    return newLevel;
  };
  // Game loop with distance tracking
  useEffect(() => {
    if (gameRunning && !isRoundTransition && !showingAnimation && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        setVial1Level((prev) =>
          tickVial(prev, vial1Paused, vial1HasBucket, setBucket1Level),
        );

        if (versionConfig.numVials === 2) {
          setVial2Level((prev) =>
            tickVial(prev, vial2Paused, vial2HasBucket, setBucket2Level),
          );
        }

        const vial1Distance = Math.abs(vial1Level - GAME_PARAMS.OPTIMAL_LEVEL);
        const vial2Distance =
          versionConfig.numVials === 2
            ? Math.abs(vial2Level - GAME_PARAMS.OPTIMAL_LEVEL)
            : 0;
        const avgDistance =
          versionConfig.numVials === 2
            ? (vial1Distance + vial2Distance) / 2
            : vial1Distance;
        distanceSamplesRef.current = [
          ...distanceSamplesRef.current,
          avgDistance,
        ];
      }, GAME_PARAMS.GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [
    gameRunning,
    isRoundTransition,
    showingAnimation,
    isPaused,
    vial1Level,
    vial2Level,
    vial1HasBucket,
    vial2HasBucket,
    currentDrainRate,
    versionConfig.numVials,
  ]);

  // Round timer
  useEffect(() => {
    if (gameRunning && !isRoundTransition && !showingAnimation && !isPaused) {
      roundTimerRef.current = setInterval(() => {
        setRoundTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(roundTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(roundTimerRef.current);
    }
    return () => clearInterval(roundTimerRef.current);
  }, [gameRunning, isRoundTransition, showingAnimation, isPaused]);

  useEffect(() => {
    if (
      roundTimeRemaining === 0 &&
      gameRunning &&
      !isRoundTransition &&
      !showingAnimation
    ) {
      advanceRound(true); // round completed successfully
    }
  }, [roundTimeRemaining, , gameRunning, isRoundTransition, showingAnimation]);

  // Gas station control based on phase
  useEffect(() => {
    if (!versionConfig.hasPhases) {
      setAddingDisabled(false);
      return;
    }
    if (isAbundancePhase) {
      setAddingDisabled(false);
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
        disableTimerRef.current = null;
      }
    } else {
      if (gameRunning && !isRoundTransition && !showingAnimation) {
        const scheduleNextDisable = () => {
          const timeUntilDisable =
            Math.random() *
              (deprivationConfig.maxTimeUntilDisable -
                deprivationConfig.minTimeUntilDisable) +
            deprivationConfig.minTimeUntilDisable;
          disableTimerRef.current = setTimeout(() => {
            const disableDuration =
              Math.random() *
                (deprivationConfig.maxDisableDuration -
                  deprivationConfig.minDisableDuration) +
              deprivationConfig.minDisableDuration;
            setAddingDisabled(true);
            disableTimerRef.current = setTimeout(() => {
              setAddingDisabled(false);
              scheduleNextDisable();
            }, disableDuration);
          }, timeUntilDisable);
        };
        if (disableTimerRef.current) {
          clearTimeout(disableTimerRef.current);
        }
        scheduleNextDisable();
      } else {
        if (disableTimerRef.current) {
          clearTimeout(disableTimerRef.current);
          disableTimerRef.current = null;
        }
        setAddingDisabled(false);
      }
    }
    return () => {
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
        disableTimerRef.current = null;
      }
    };
  }, [
    gameRunning,
    isRoundTransition,
    showingAnimation,
    isAbundancePhase,
    versionConfig.hasPhases,
    deprivationConfig,
  ]);

  //logging gas station
  useEffect(() => {
    if (!gameRunning || isRoundTransition || showingAnimation) return;
    logGasStationToggle(!isAddingDisabledRef.current, isTrainingMode);
  }, [isAddingDisabled]);

  // Check for round failure
  useEffect(() => {
    if (
      !gameRunning ||
      isRoundTransition ||
      roundTimeRemaining === 0 ||
      showingAnimation
    )
      return;

    const vial1Failed = vial1Level <= 0 || vial1Level >= GAME_PARAMS.MAX_LEVEL;
    const vial2Failed =
      versionConfig.numVials === 2 &&
      (vial2Level <= 0 || vial2Level >= GAME_PARAMS.MAX_LEVEL);

    if (vial1Failed || vial2Failed) {
      const failureType =
        vial1Level >= GAME_PARAMS.MAX_LEVEL ||
        vial2Level >= GAME_PARAMS.MAX_LEVEL
          ? "overheat"
          : "powerdown";
      advanceRound(false, failureType);
    }
  }, [
    vial1Level,
    vial2Level,
    gameRunning,
    isRoundTransition,
    roundTimeRemaining,
    showingAnimation,
  ]);

  useEffect(() => {
    if (showingAnimation) {
      setFrozenAddingDisabled(isAddingDisabledRef.current);
    }
  }, [showingAnimation]);

  // helper to compute the performance ratio for successful rounds
  const computePerformanceRatio = () => {
    const optimalAverage = 0; // may manipulate later
    const worst_avg = Math.max(
      GAME_PARAMS.OPTIMAL_LEVEL,
      100 - GAME_PARAMS.OPTIMAL_LEVEL,
    );
    const avgDistance =
      distanceSamplesRef.current.length > 0
        ? distanceSamplesRef.current.reduce((sum, d) => sum + d, 0) /
          distanceSamplesRef.current.length
        : (optimalAverage + worst_avg) / 2;
    const performanceRatio = Math.min(
      1,
      Math.max(
        0,
        1 - (avgDistance - optimalAverage) / (worst_avg - optimalAverage),
      ),
    );
    return performanceRatio;
  };

  //helper to log start of next round and gas station setting
  const logNextRound = (nextRound) => {
    const nextDrainRate = gameSequences.velocitySequence[nextRound] || 1;
    const nextBucketConfig = gameSequences.bucketSequence[nextRound] || {
      vial1: 0,
      vial2: 0,
    };
    const nextPhase = gameSequences.phaseSequence[nextRound] || "abundance";

    logRoundStart(
      nextRound,
      {
        numVials: versionConfig.numVials,
        vial1HasBucket: nextBucketConfig.vial1 === 1,
        vial2HasBucket: nextBucketConfig.vial2 === 1,
        velocity: nextDrainRate,
        setpoint: GAME_PARAMS.OPTIMAL_LEVEL,
        phase: nextPhase,
        initialVial1Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
        initialVial2Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
        initialBucket1Level: bucket1Level,
        initialBucket2Level: bucket2Level,
        isTrainingMode,
        gameVersion: gameVersion,
      },
      isTrainingMode,
    );
  };

  // helper to reset all vars before starting next round
  const startNextRound = (nextRound) => {
    setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setCurrentRound(nextRound);
    setRoundTimeRemaining(roundDuration);
    setIsRoundTransition(false);
    setGameRunning(true);
    logNextRound(nextRound);
  };

  const advanceRound = (wasSuccessful, failureType = null) => {
    const stepSize = 100 / GAME_PARAMS.MAX_ROUNDS;
    const newProgress = wasSuccessful
      ? cumulativeProgressRef.current + stepSize * computePerformanceRatio() // calc performance ratio for successful rounds only
      : Math.max(0, cumulativeProgressRef.current - stepSize);

    // log round end
    logRoundEnd(wasSuccessful, isTrainingMode, newProgress);

    //round end animation
    if (wasSuccessful) {
      setScore((prev) => prev + 1);
      setIsCelebrating(true);
      playSuccessSound(audioContextRef.current);
    } else {
      if (failureType === "overheat") {
        setIsOverheated(true);
        playOverheatSound(audioContextRef.current);
      } else {
        setIsPoweredDown(true);
        playPowerDownSound(audioContextRef.current);
      }
    }

    // reset distance samples for next round,
    setRoundWasSuccessful(wasSuccessful);
    setShowingAnimation(true);
    setGameRunning(false);
    distanceSamplesRef.current = [];

    const nextRound = currentRound + 1;
    const isLastRound = nextRound >= maxRounds;

    setTimeout(() => {
      setIsOverheated(false);
      setIsPoweredDown(false);
      setIsCelebrating(false);
      setShowingAnimation(false);
      setPreviousRoundProgress(cumulativeProgressRef.current);
      cumulativeProgressRef.current = newProgress;
      setCumulativeProgress(newProgress);
      if (isTrainingMode && onRoundComplete) onRoundComplete(wasSuccessful);

      if (isLastRound) {
        setGameComplete(true);
        if (onComplete) {
          onComplete({
            finalScore: score + (wasSuccessful ? 1 : 0),
            totalRounds: maxRounds,
            cumulativeProgress: newProgress,
          });
        }
        return;
      }
      setIsRoundTransition(true);
      setTimeout(() => startNextRound(nextRound), GAME_PARAMS.TRANSITION_TIME);
    }, 2000);
  };

  if (gameComplete && isTrainingMode) {
    return null;
  }

  return (
    <div className="vial-game" data-training-mode={isTrainingMode}>
      {gameComplete ? (
        <div className="game-complete-screen">
          <h1>
            {isTrainingMode ? "Training Complete!" : "Thank You for Playing!"}
          </h1>
          <div className="completion-stats">
            <h2>Game Complete</h2>
            {!isTrainingMode && (
              <p className="thank-you-message">
                Thank you for participating in this experiment. Your data has
                been recorded. You will soon be redirected to a Qualtrics survey
                to complete your experiment.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {isRoundTransition && !isCelebrating && (
            <RoundTransition
              roundNumber={score}
              wasSuccessful={roundWasSuccessful}
              onComplete={() => {}}
              totalRounds={GAME_PARAMS.MAX_ROUNDS}
              score={score}
              cumulativeProgress={cumulativeProgress}
              previousProgress={previousRoundProgress}
              isTrainingMode={isTrainingMode}
              mainGameTotalRounds={GAME_PARAMS.MAX_ROUNDS}
            />
          )}
          <h1>
            {isTrainingMode && "PRACTICE: "}
            {"Keep BleeBlop's Gloop at the Ideal Level!"}
          </h1>

          <div className="game-info">
            {!PRODUCTION_MODE && (
              <>
                <div className="score-display">Score: {score}</div>
                <div className="round-display">
                  Round: {currentRound + 1} / {maxRounds}
                </div>
                <div className="timer-display">Time: {roundTimeRemaining}s</div>
                <div className="velocity-display">
                  Velocity: {currentDrainRate.toFixed(1)}
                </div>
                <div className="progress-display">
                  Progress: {Math.round(cumulativeProgress)}%
                </div>
              </>
            )}
          </div>

          <div
            className="game-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "40px",
            }}
          >
            <Robot
              vial1Level={vial1Level}
              vial2Level={vial2Level}
              isOverheated={isOverheated}
              isPoweredDown={isPoweredDown}
              isCelebrating={isCelebrating}
              numVials={versionConfig.numVials}
              vial1HasBucket={vial1HasBucket}
              vial2HasBucket={vial2HasBucket}
              bucket1Level={bucket1Level}
              bucket2Level={bucket2Level}
              isTrainingMode={isTrainingMode}
              trainingColors={
                isTrainingMode ? trainingParams.VIAL_COLORS : null
              }
            />
            {versionConfig.hasPhases && (
              <GasStationIndicator
                isActive={
                  showingAnimation
                    ? !frozenAddingDisabled
                    : !isAddingDisabledRef.current
                }
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VialGame;
