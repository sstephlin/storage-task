import React, { useCallback, useEffect, useRef, useState } from "react";
import Robot from "./Robot";
import RoundTransition from "./RoundTransition";
import GasStationIndicator from "./GasStationIndicator";
import { logRoundEnd } from "../data/logging";
import { PRODUCTION_MODE } from "../data/participantConfig";
import {
  GAME_PARAMS,
  VERSION_CONFIG,
  VERSION_BUTTON_DELAYS,
  VERSION_DEPRIVATION_CONFIG,
  VERSION_VELOCITIES,
} from "../data/params";
import { generateGameSequences } from "../data/gameSequences";
import { useAudioContext } from "../hooks/useAudioContext";
import { useGasStationControl } from "../hooks/useGasStationControl";
import { useVialControls } from "../hooks/useVialControls";
import { useVialGameLoop } from "../hooks/useVialGameLoop";
import {
  getFailureType,
  getNextProgress,
  getRoundSettings,
  logRoundStartFromSequences,
} from "../utils/vialGameLogic";
import {
  playOverheatSound,
  playPowerDownSound,
  playSuccessSound,
} from "./sounds";
import "../styles/VialGame.css";

const VialGame = ({
  gameVersion,
  onComplete,
  isTrainingMode = false,
  trainingParams = null,
  onRoundComplete = null,
}) => {
  const showTutorial = false;
  const versionConfig = VERSION_CONFIG[gameVersion];
  const buttonDelay = VERSION_BUTTON_DELAYS[gameVersion];
  const deprivationConfig = VERSION_DEPRIVATION_CONFIG[gameVersion];

  const maxRounds = isTrainingMode
    ? trainingParams.MAX_ROUNDS
    : GAME_PARAMS.MAX_ROUNDS;
  const roundDuration = isTrainingMode
    ? trainingParams.ROUND_DURATION
    : GAME_PARAMS.ROUND_DURATION;
  const velocityConfig = VERSION_VELOCITIES[gameVersion];

  const [gameSequences] = useState(() =>
    isTrainingMode && trainingParams?.sequences
      ? trainingParams.sequences
      : generateGameSequences(gameVersion, maxRounds, velocityConfig),
  );
  console.log("Game Sequences:", gameSequences);

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket1Level, setBucket1Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL,
  );
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL,
  );
  const [gameRunning, setGameRunning] = useState(false);

  const [currentRound, setCurrentRound] = useState(null);
  const roundIndex = currentRound ?? 0;
  const currentSettings = getRoundSettings(gameSequences, roundIndex);
  const {
    drainRate: currentDrainRate,
    bucketConfig: currentBucketConfig,
    phase: currentPhase,
  } = getRoundSettings(gameSequences, currentRound);

  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(roundDuration);
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [roundWasSuccessful, setRoundWasSuccessful] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  const [cumulativeProgress, setCumulativeProgress] = useState(0);
  const [previousRoundProgress, setPreviousRoundProgress] = useState(0);

  const [isOverheated, setIsOverheated] = useState(false);
  const [isPoweredDown, setIsPoweredDown] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showingAnimation, setShowingAnimation] = useState(false);

  const roundTimerRef = useRef(null);
  const keyLocked = useRef(false);
  const audioContextRef = useAudioContext();
  const cumulativeProgressRef = useRef(0);
  const distanceSamplesRef = useRef([]);
  const vial1Paused = useRef(false);
  const vial2Paused = useRef(false);
  const vial1LevelRef = useRef(vial1Level);
  const vial2LevelRef = useRef(vial2Level);
  const bucket1LevelRef = useRef(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
  const bucket2LevelRef = useRef(GAME_PARAMS.INITIAL_BUCKET_LEVEL);

  const vial1HasBucket = currentBucketConfig.vial1 === 1;
  const vial2HasBucket = currentBucketConfig.vial2 === 1;
  const isAbundancePhase = currentPhase === "abundance";

  const { isAddingDisabledRef, frozenAddingDisabled } = useGasStationControl({
    hasPhases: versionConfig.hasPhases,
    isAbundancePhase,
    deprivationConfig,
    gameRunning,
    isRoundTransition,
    showingAnimation,
    isTrainingMode,
    roundKey: currentRound,
  });

  // call to useEffect for vial controls, like key press
  useVialControls({
    isEnabled:
      !isRoundTransition && gameRunning && !showTutorial && !showingAnimation,
    keyLocked,
    buttonDelay,
    numVials: versionConfig.numVials,
    vial1HasBucket,
    vial2HasBucket,
    vial1Paused,
    vial2Paused,
    vial1Level,
    vial2Level,
    bucket1Level,
    bucket2Level,
    currentRound,
    score,
    roundTimeRemaining,
    currentDrainRate,
    roundWasSuccessful,
    isAddingDisabledRef,
    isTrainingMode,
    setVial1Level,
    setVial2Level,
    setBucket1Level,
    setBucket2Level,
  });

  // call to useEffect for game loop, which handles vial level ticking and distance sampling
  useVialGameLoop({
    isActive: gameRunning && !isRoundTransition && !showingAnimation,
    currentDrainRate,
    numVials: versionConfig.numVials,
    vial1Level,
    vial2Level,
    vial1LevelRef,
    vial2LevelRef,
    vial1HasBucket,
    vial2HasBucket,
    vial1Paused,
    vial2Paused,
    setVial1Level,
    setVial2Level,
    setBucket1Level,
    setBucket2Level,
    distanceSamplesRef,
  });

  // helper to start a round
  const startRound = useCallback(
    (roundIndex, { resetVials = false } = {}) => {
      console.log("Starting round", roundIndex);
      if (resetVials) {
        setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
        setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      }

      setCurrentRound(roundIndex);
      setRoundTimeRemaining(roundDuration);
      setIsRoundTransition(false);
      setGameRunning(true);

      logRoundStartFromSequences({
        roundIndex,
        gameSequences,
        versionConfig,
        bucket1Level: bucket1LevelRef.current,
        bucket2Level: bucket2LevelRef.current,
        isTrainingMode,
        gameVersion,
      });
    },
    [gameSequences, gameVersion, isTrainingMode, roundDuration, versionConfig],
  );

  // useEffect to start the first round automatically if not showing tutorial
  useEffect(() => {
    if (showTutorial || currentRound !== null) return;
    startRound(0);
  }, [showTutorial, currentRound, startRound]);

  // start game loop when round starts
  useEffect(() => {
    if (!isRoundTransition && !showingAnimation) {
      setGameRunning(true);
    }
  }, [isRoundTransition, showingAnimation]);

  // helper to advance round with success/failure and handle all the related state changes and logging.
  // check for game completion
  const advanceRound = useCallback(
    (wasSuccessful, failureType = null) => {
      const newProgress = getNextProgress({
        wasSuccessful,
        currentProgress: cumulativeProgressRef.current,
        distanceSamples: distanceSamplesRef.current,
      });

      logRoundEnd(wasSuccessful, isTrainingMode, newProgress);

      if (wasSuccessful) {
        setScore((prev) => prev + 1);
        setIsCelebrating(true);
        playSuccessSound(audioContextRef.current);
      } else if (failureType === "overheat") {
        setIsOverheated(true);
        playOverheatSound(audioContextRef.current);
      } else {
        setIsPoweredDown(true);
        playPowerDownSound(audioContextRef.current);
      }

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

        if (isTrainingMode && onRoundComplete) {
          onRoundComplete(wasSuccessful);
        }

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
        setTimeout(() => {
          startRound(nextRound, {
            resetVials: true,
          });
        }, GAME_PARAMS.TRANSITION_TIME);
      }, 2000);
    },
    [
      audioContextRef,
      currentRound,
      isTrainingMode,
      maxRounds,
      onComplete,
      onRoundComplete,
      score,
      startRound,
    ],
  );

  // useEffect to decrement round timer
  useEffect(() => {
    if (gameRunning && !isRoundTransition && !showingAnimation) {
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
      clearInterval(roundTimerRef.current); // if the game is not longer running and is instead transitioning, clear the interval
    }

    return () => clearInterval(roundTimerRef.current); // cleans up before executing a new effect, prevents interval from running in the background
  }, [gameRunning, isRoundTransition, showingAnimation]);

  // useEffect to check for round ending conditions (success)
  useEffect(() => {
    if (
      roundTimeRemaining === 0 &&
      gameRunning &&
      !isRoundTransition &&
      !showingAnimation
    ) {
      advanceRound(true);
    }
  }, [
    advanceRound,
    gameRunning,
    isRoundTransition,
    roundTimeRemaining,
    showingAnimation,
  ]);

  // useEffect to check for round ending conditions (failure)
  useEffect(() => {
    if (
      !gameRunning ||
      isRoundTransition ||
      roundTimeRemaining === 0 ||
      showingAnimation
    ) {
      return;
    }

    const failureType = getFailureType({
      vial1Level,
      vial2Level,
      numVials: versionConfig.numVials,
    });

    if (failureType) {
      advanceRound(false, failureType);
    }
  }, [
    advanceRound,
    gameRunning,
    isRoundTransition,
    roundTimeRemaining,
    showingAnimation,
    versionConfig.numVials,
    vial1Level,
    vial2Level,
  ]);
  // sync vial levels to refs
  useEffect(() => {
    vial1LevelRef.current = vial1Level;
  }, [vial1Level]);
  useEffect(() => {
    vial2LevelRef.current = vial2Level;
  }, [vial2Level]);

  // sync bucket levels to refs
  useEffect(() => {
    bucket1LevelRef.current = bucket1Level;
  }, [bucket1Level]);
  useEffect(() => {
    bucket2LevelRef.current = bucket2Level;
  }, [bucket2Level]);

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
            {isTrainingMode &&
              "PRACTICE: Keep BleeBlop's Gloop at the Ideal Level!"}
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
              hasPhases={versionConfig.hasPhases}
              gasStationActive={
                showingAnimation
                  ? !frozenAddingDisabled
                  : !isAddingDisabledRef.current
              }
            />
            {/* {versionConfig.hasPhases && (
              <GasStationIndicator
                isActive={
                  showingAnimation
                    ? !frozenAddingDisabled
                    : !isAddingDisabledRef.current
                }
              />
            )} */}
          </div>
        </>
      )}
    </div>
  );
};

export default VialGame;
