import React, { useState, useEffect, useRef } from "react";
import Vial from "./components/Vial";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";
import RoundTransition from "./components/RoundTransition";
import Tutorial from "./instructions";
import {
  GAME_PARAMS,
  GAME_MESSAGES,
  INSTRUCTIONS,
  generateRoundSequence,
} from "./params";
import { logButtonPress, logVialLevels, logRoundStart } from "./logging";
import "./styles/VialGame.css";

const VialGame = ({ userId }) => {
  const [showTutorial, setShowTutorial] = useState(true); // Start with tutorial
  const [roundSequence] = useState(() => generateRoundSequence());

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket1Level, setBucket1Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL
  );
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL
  );
  const [gameRunning, setGameRunning] = useState(false); // Start as false until tutorial exits
  const [gameMessage, setGameMessage] = useState(GAME_MESSAGES.PLAYING);
  const [messageType, setMessageType] = useState("playing");

  // Round management
  const [currentRound, setCurrentRound] = useState(0);
  const currentRoundConfig = roundSequence[currentRound];
  const currentDrainRate = currentRoundConfig?.drainRate || 0.5;
  const numBuckets = currentRoundConfig?.numBuckets || 0;
  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(
    GAME_PARAMS.ROUND_DURATION
  );
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [roundWasSuccessful, setRoundWasSuccessful] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  const gameLoopRef = useRef(null);
  const roundTimerRef = useRef(null);
  const vialLoggerRef = useRef(null);
  const keyLocked = useRef(false);

  const vial1HasBucket = numBuckets === 2;
  const vial2HasBucket = numBuckets >= 1;

  const vial1Paused = useRef(false);
  const vial2Paused = useRef(false);

  const gameStateRef = useRef({
    vial1Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    vial2Level: GAME_PARAMS.INITIAL_VIAL_LEVEL,
    bucket1Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
    bucket2Level: GAME_PARAMS.INITIAL_BUCKET_LEVEL,
    numBuckets: 0,
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

  useEffect(() => {
    gameStateRef.current = {
      vial1Level,
      vial2Level,
      bucket1Level,
      bucket2Level,
      numBuckets,
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
    numBuckets,
    vial1HasBucket,
    vial2HasBucket,
    gameRunning,
    currentRound,
    score,
    roundTimeRemaining,
    currentDrainRate,
    roundWasSuccessful,
  ]);

  // Handle tutorial exit
  const handleTutorialExit = () => {
    setShowTutorial(false);
    setGameRunning(true); // Start game after tutorial
    // Log the start of round 0
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
      keyLocked.current = true;

      const getCurrentState = () => ({ ...gameStateRef.current });

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          logButtonPress("add_vial_1", getCurrentState());
          vial1Paused.current = true; // temporarily pause drain
          setVial1Level((prev) =>
            Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
          );
          setTimeout(() => {
            vial1Paused.current = false; // resume drain shortly after
          }, 200); // adjust delay as needed
          break;

        case "ArrowRight":
          event.preventDefault();
          logButtonPress("add_vial_2", getCurrentState());
          vial2Paused.current = true;
          setVial2Level((prev) =>
            Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
          );
          setTimeout(() => {
            vial2Paused.current = false;
          }, 200);
          break;
        case "ArrowUp":
          event.preventDefault();
          if (
            gameStateRef.current.numBuckets === 2 &&
            gameStateRef.current.bucket1Level > 0
          ) {
            logButtonPress("empty_bucket_1", getCurrentState());
            setVial1Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            setBucket1Level((prev) =>
              Math.max(0, prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
            );
          } else if (
            gameStateRef.current.numBuckets === 1 &&
            gameStateRef.current.bucket2Level > 0
          ) {
            logButtonPress("empty_bucket_2", getCurrentState());
            setVial2Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            setBucket2Level((prev) =>
              Math.max(0, prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
            );
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (
            gameStateRef.current.numBuckets === 2 &&
            gameStateRef.current.bucket2Level > 0
          ) {
            logButtonPress("empty_bucket_2", getCurrentState());
            setVial2Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            setBucket2Level((prev) =>
              Math.max(0, prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT)
            );
          }
          break;
        default:
          break;
      }
      setTimeout(() => {
        keyLocked.current = false;
      }, 300);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRoundTransition, gameRunning, showTutorial]);

  // Game loop
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      gameLoopRef.current = setInterval(() => {
        setVial1Level((prev) => {
          // Skip draining if paused due to adding
          if (vial1Paused.current) return prev;

          const newLevel1 = Math.max(0, prev - currentDrainRate);

          // Fill bucket only when draining (not adding)
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

  // Check for round completion
  useEffect(() => {
    if (roundTimeRemaining === 0 && gameRunning && !isRoundTransition) {
      completeRound();
    }
  }, [roundTimeRemaining, gameRunning, isRoundTransition]);

  // Logging interval
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      vialLoggerRef.current = setInterval(() => {
        logVialLevels(gameStateRef.current);
      }, 100);
    } else {
      clearInterval(vialLoggerRef.current);
    }

    return () => clearInterval(vialLoggerRef.current);
  }, [gameRunning, isRoundTransition]);

  // Check for round failure
  useEffect(() => {
    if (
      (vial1Level <= 0 ||
        vial2Level <= 0 ||
        vial1Level >= GAME_PARAMS.MAX_LEVEL ||
        vial2Level >= GAME_PARAMS.MAX_LEVEL) &&
      gameRunning &&
      !isRoundTransition
    ) {
      failRound();
    }
  }, [vial1Level, vial2Level, gameRunning, isRoundTransition]);

  const completeRound = () => {
    setScore((prev) => prev + 1);
    setRoundWasSuccessful(true);
    setIsRoundTransition(true);
    setGameRunning(false); // Pause game during transition

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
      setBucket1Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setGameRunning(true); // Resume game
      // Log the start of the new round after state updates
      setTimeout(() => {
        logRoundStart(currentRound + 1, gameStateRef.current);
      }, 100);
    }, GAME_PARAMS.TRANSITION_TIME);
  };

  const failRound = () => {
    setRoundWasSuccessful(false);
    setIsRoundTransition(true);
    setGameRunning(false); // Pause game during transition

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
      setBucket1Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setGameRunning(true); // Resume game
      // Log the start of the new round after state updates
      setTimeout(() => {
        logRoundStart(currentRound + 1, gameStateRef.current);
      }, 100);
    }, GAME_PARAMS.TRANSITION_TIME);
  };

  const toggleGameVersion = () => {
    logButtonPress("toggle_version", { ...gameStateRef.current });
    console.warn(
      "toggleGameVersion may not work correctly with round sequence"
    );
  };

  // Show tutorial if active
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
            />
          )}
          <h1>Two Vials Game</h1>

          <div className="game-info">
            <div className="score-display">Score: {score}</div>
            <div className="round-display">
              Round: {currentRound + 1} / {GAME_PARAMS.MAX_ROUNDS}
            </div>
            <div className="timer-display">Time: {roundTimeRemaining}s</div>
          </div>

          <GameStatus message={gameMessage} messageType={messageType} />

          <div className="game-container">
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
          </div>
          <GameControls
            onAddVial1={() => {}}
            onAddVial2={() => {}}
            onEmptyBucket={() => {}}
            onToggleVersion={toggleGameVersion}
            gameRunning={gameRunning && !isRoundTransition}
            bucketLevel={bucket2Level}
            hasBucket={numBuckets >= 1}
          />
          <div className="instructions">
            <p>
              <strong>{INSTRUCTIONS.INTRO}</strong> {INSTRUCTIONS.COMMON}
            </p>
            <p className="keyboard-controls">
              <strong>Controls:</strong> {INSTRUCTIONS.CONTROLS_BASE}
              {numBuckets === 1 && INSTRUCTIONS.CONTROLS_WITH_BUCKET}
              {numBuckets === 2 &&
                " Use ↑ to empty Vial 1's bucket, ↓ to empty Vial 2's bucket."}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VialGame;
