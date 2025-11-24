import React, { useState, useEffect, useRef } from "react";
import Vial from "./components/Vial";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";
import RoundTransition from "./components/RoundTransition";
import Tutorial from "./instructions";
import GasStationIndicator from "./components/GasStationIndicator";
import {
  GAME_PARAMS,
  GAME_MESSAGES,
  INSTRUCTIONS,
  getGameVersion,
  VERSION_CONFIG,
  generateGameSequences,
} from "./params";
import { logButtonPress, logRoundStart } from "./logging";
import "./styles/VialGame.css";

const VialGame = ({ userId }) => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameVersion] = useState(() => getGameVersion());
  const versionConfig = VERSION_CONFIG[gameVersion];
  console.log("Assigned game version:", gameVersion, versionConfig);

  // Generate all sequences based on version
  const [gameSequences] = useState(() =>
    generateGameSequences(gameVersion, GAME_PARAMS.MAX_ROUNDS)
  );

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket1Level, setBucket1Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL
  );
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL
  );
  const [gameRunning, setGameRunning] = useState(false);
  const [gameMessage, setGameMessage] = useState(GAME_MESSAGES.PLAYING);
  const [messageType, setMessageType] = useState("playing");
  const [isAddingDisabled, setIsAddingDisabled] = useState(false);

  // Round management
  const [currentRound, setCurrentRound] = useState(0);
  const currentDrainRate = gameSequences.velocitySequence[currentRound] || 0.5;
  const currentBucketConfig = gameSequences.bucketSequence[currentRound] || {
    vial1: 0,
    vial2: 0,
  };
  const currentPhase = gameSequences.phaseSequence[currentRound] || "abundance";

  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(
    GAME_PARAMS.ROUND_DURATION
  );
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [roundWasSuccessful, setRoundWasSuccessful] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  const gameLoopRef = useRef(null);
  const roundTimerRef = useRef(null);
  const keyLocked = useRef(false);
  const disableTimerRef = useRef(null);

  // Bucket assignment
  const vial1HasBucket = currentBucketConfig.vial1 === 1;
  const vial2HasBucket = currentBucketConfig.vial2 === 1;

  const vial1Paused = useRef(false);
  const vial2Paused = useRef(false);

  const gameStateRef = useRef({
    vial1Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    vial2Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    bucket1Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
    bucket2Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
    vial1HasBucket: false,
    vial2HasBucket: false,
    gameRunning: false,
    currentRound: 0,
    score: 0,
    roundTimeRemaining: GAME_PARAMS.ROUND_DURATION,
    currentDrainRate: 0.5,
    velocity: 0,
    roundWasSuccessful: true,
    setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
  });

  const isAbundancePhase = currentPhase === "abundance";

  useEffect(() => {
    gameStateRef.current = {
      vial1Level,
      vial2Level,
      bucket1Level,
      bucket2Level,
      vial1HasBucket,
      vial2HasBucket,
      gameRunning,
      currentRound,
      score,
      roundTimeRemaining,
      currentDrainRate,
      velocity: currentDrainRate,
      roundWasSuccessful,
      setpoint: GAME_PARAMS.OPTIMAL_ZONE_MAX,
    };
  }, [
    vial1Level,
    vial2Level,
    bucket1Level,
    bucket2Level,
    vial1HasBucket,
    vial2HasBucket,
    gameRunning,
    currentRound,
    score,
    roundTimeRemaining,
    currentDrainRate,
    roundWasSuccessful,
  ]);

  const handleTutorialExit = () => {
    setShowTutorial(false);
    setGameRunning(true);
    setTimeout(() => {
      logRoundStart(0, gameStateRef.current);
    }, 100);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isRoundTransition || !gameRunning || showTutorial) return;
      if (event.repeat) return;
      if (keyLocked.current) return;

      const getCurrentState = () => ({ ...gameStateRef.current });

      switch (event.key) {
        case "ArrowLeft":
          if (isAddingDisabled) return;
          event.preventDefault();
          keyLocked.current = true;
          logButtonPress("add_vial_1", getCurrentState());
          vial1Paused.current = true;
          setVial1Level((prev) =>
            Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
          );
          setTimeout(() => {
            vial1Paused.current = false;
          }, 100);
          setTimeout(() => {
            keyLocked.current = false;
          }, 200);
          break;

        case "ArrowRight":
          if (versionConfig.numVials !== 2 || isAddingDisabled) return;
          event.preventDefault();
          keyLocked.current = true;
          logButtonPress("add_vial_2", getCurrentState());
          vial2Paused.current = true;
          setVial2Level((prev) =>
            Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
          );
          setTimeout(() => {
            vial2Paused.current = false;
          }, 100);
          setTimeout(() => {
            keyLocked.current = false;
          }, 200);
          break;

        case "ArrowUp":
          event.preventDefault();
          keyLocked.current = true;
          if (vial1HasBucket && bucket1Level > 0) {
            logButtonPress("empty_bucket_1", getCurrentState());
            setVial1Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            setBucket1Level((prev) =>
              Math.max(0, prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
            );
          } else if (
            vial2HasBucket &&
            bucket2Level > 0 &&
            versionConfig.numVials === 2
          ) {
            logButtonPress("empty_bucket_2", getCurrentState());
            setVial2Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            setBucket2Level((prev) =>
              Math.max(0, prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
            );
          }
          setTimeout(() => {
            keyLocked.current = false;
          }, 300);
          break;

        case "ArrowDown":
          if (versionConfig.numVials !== 2) return;
          event.preventDefault();
          keyLocked.current = true;
          if (vial2HasBucket && bucket2Level > 0) {
            logButtonPress("empty_bucket_2", getCurrentState());
            setVial2Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            setBucket2Level((prev) =>
              Math.max(0, prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
            );
          }
          setTimeout(() => {
            keyLocked.current = false;
          }, 100);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isRoundTransition,
    gameRunning,
    showTutorial,
    isAddingDisabled,
    vial1HasBucket,
    vial2HasBucket,
    bucket1Level,
    bucket2Level,
    versionConfig.numVials,
  ]);

  // Game loop
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      gameLoopRef.current = setInterval(() => {
        setVial1Level((prev) => {
          if (vial1Paused.current) return prev;
          const newLevel1 = Math.max(0, prev - currentDrainRate);

          if (
            vial1HasBucket &&
            newLevel1 < prev &&
            prev > GAME_PARAMS.OPTIMAL_ZONE_MAX &&
            prev <= GAME_PARAMS.DANGER_UPPER &&
            newLevel1 >= GAME_PARAMS.OPTIMAL_ZONE_MAX
          ) {
            setBucket1Level((bucketPrev) =>
              Math.min(100, bucketPrev + currentDrainRate)
            );
          }

          return newLevel1;
        });

        if (versionConfig.numVials === 2) {
          setVial2Level((prev) => {
            if (vial2Paused.current) return prev;
            const newLevel2 = Math.max(0, prev - currentDrainRate);

            if (
              vial2HasBucket &&
              newLevel2 < prev &&
              prev > GAME_PARAMS.OPTIMAL_ZONE_MAX &&
              prev <= GAME_PARAMS.DANGER_UPPER &&
              newLevel2 >= GAME_PARAMS.OPTIMAL_ZONE_MAX
            ) {
              setBucket2Level((bucketPrev) =>
                Math.min(100, bucketPrev + currentDrainRate)
              );
            }

            return newLevel2;
          });
        }
      }, GAME_PARAMS.GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [
    gameRunning,
    isRoundTransition,
    vial1HasBucket,
    vial2HasBucket,
    currentDrainRate,
    versionConfig.numVials,
  ]);

  // Round timer
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
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
  }, [gameRunning, isRoundTransition]);

  useEffect(() => {
    if (roundTimeRemaining === 0 && gameRunning && !isRoundTransition) {
      completeRound();
    }
  }, [roundTimeRemaining, gameRunning, isRoundTransition]);

  // Gas station control based on phase
  useEffect(() => {
    if (!versionConfig.hasPhases) {
      setIsAddingDisabled(false);
      return;
    }

    if (isAbundancePhase) {
      setIsAddingDisabled(false);
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
        disableTimerRef.current = null;
      }
    } else {
      // Deprivation phase: Random disable intervals
      if (gameRunning && !isRoundTransition) {
        const scheduleNextDisable = () => {
          // Wait 2-8 seconds before next disable
          const timeUntilDisable = Math.random() * 6000 + 2000;

          disableTimerRef.current = setTimeout(() => {
            // Disable for 2-4 seconds
            const disableDuration = Math.random() * 2000 + 2000;

            setIsAddingDisabled(true);

            disableTimerRef.current = setTimeout(() => {
              setIsAddingDisabled(false);
              scheduleNextDisable();
            }, disableDuration);
          }, timeUntilDisable);
        };

        // Clear any existing timer and start fresh
        if (disableTimerRef.current) {
          clearTimeout(disableTimerRef.current);
        }
        scheduleNextDisable();
      } else {
        if (disableTimerRef.current) {
          clearTimeout(disableTimerRef.current);
          disableTimerRef.current = null;
        }
        setIsAddingDisabled(false);
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
    isAbundancePhase,
    versionConfig.hasPhases,
  ]);

  // Check for round failure
  useEffect(() => {
    // Add check to prevent running during transition or when time is up
    if (!gameRunning || isRoundTransition || roundTimeRemaining === 0) {
      return;
    }

    const checkVial1 = vial1Level <= 0 || vial1Level >= GAME_PARAMS.MAX_LEVEL;
    const checkVial2 =
      versionConfig.numVials === 2 &&
      (vial2Level <= 0 || vial2Level >= GAME_PARAMS.MAX_LEVEL);

    if (checkVial1 || checkVial2) {
      failRound();
    }
  }, [
    vial1Level,
    vial2Level,
    gameRunning,
    isRoundTransition,
    roundTimeRemaining, // Add this dependency
    versionConfig.numVials,
  ]);

  const completeRound = () => {
    setScore((prev) => prev + 1);
    setRoundWasSuccessful(true);
    setIsRoundTransition(true);
    setGameRunning(false);

    if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
      setTimeout(() => {
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setGameRunning(true);
    }, GAME_PARAMS.TRANSITION_TIME);
  };

  const failRound = () => {
    setRoundWasSuccessful(false);
    setIsRoundTransition(true);
    setGameRunning(false);

    if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
      setTimeout(() => {
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setGameRunning(true);
    }, GAME_PARAMS.TRANSITION_TIME);
  };

  if (showTutorial) {
    return <Tutorial onExit={handleTutorialExit} />;
  }

  return (
    <div className="vial-game">
      {gameComplete ? (
        <div className="game-complete-screen">
          <h1>Thank You for Playing!</h1>
          <div className="completion-stats">
            <h2>Game Complete</h2>
            <p className="completion-message">
              You completed all {GAME_PARAMS.MAX_ROUNDS} rounds!
            </p>
            <p className="thank-you-message">
              Thank you for participating in this experiment. Your data has been
              recorded.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isRoundTransition && (
            <RoundTransition
              roundNumber={currentRound + 1}
              wasSuccessful={roundWasSuccessful}
              onComplete={() => {}}
              totalRounds={GAME_PARAMS.MAX_ROUNDS}
              score={score}
            />
          )}
          <h1>{versionConfig.name}</h1>

          <div className="game-info">
            <div className="score-display">Score: {score}</div>
            <div className="round-display">
              Round: {currentRound + 1} / {GAME_PARAMS.MAX_ROUNDS}
            </div>
            <div className="timer-display">Time: {roundTimeRemaining}s</div>
            <div className="velocity-display">
              Velocity: {currentDrainRate.toFixed(1)}
            </div>
            {versionConfig.hasPhases && (
              <div
                className="phase-display"
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  backgroundColor: isAbundancePhase ? "#86efac" : "#fca5a5",
                  color: isAbundancePhase ? "#166534" : "#991b1b",
                }}
              >
                Phase: {isAbundancePhase ? "🌟 Abundance" : "⚠️ Deprivation"}
              </div>
            )}
          </div>

          <GameStatus message={gameMessage} messageType={messageType} />

          <div className="game-container">
            {versionConfig.numVials >= 1 && (
              <div className="vial-setup">
                <div className="liquid-level">
                  Vial 1: {Math.round(vial1Level)}%
                </div>
                <Vial
                  level={vial1Level}
                  numBuckets={vial1HasBucket ? 1 : 0}
                  bucketLevel={bucket1Level}
                  liquidColor="#d665e5ff"
                />
              </div>
            )}

            {versionConfig.hasPhases && (
              <GasStationIndicator isActive={!isAddingDisabled} />
            )}

            {versionConfig.numVials === 2 && (
              <div className="vial-setup">
                <div className="liquid-level">
                  Vial 2: {Math.round(vial2Level)}%
                </div>
                <div className="vial-and-bucket">
                  <Vial
                    level={vial2Level}
                    numBuckets={vial2HasBucket ? 1 : 0}
                    bucketLevel={bucket2Level}
                  />
                </div>
              </div>
            )}
          </div>
          <GameControls
            onAddVial1={() => {}}
            onAddVial2={() => {}}
            onEmptyBucket={() => {}}
            gameRunning={gameRunning && !isRoundTransition}
            bucketLevel={bucket2Level}
            hasBucket={vial1HasBucket || vial2HasBucket}
          />
          <div className="instructions">
            <p>
              <strong>{INSTRUCTIONS.INTRO}</strong> {INSTRUCTIONS.COMMON}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VialGame;
