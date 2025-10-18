import React, { useState, useEffect, useRef } from "react";
import Vial from "./components/Vial";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";
import RoundTransition from "./components/RoundTransition";
import {
  GAME_PARAMS,
  GAME_MESSAGES,
  INSTRUCTIONS,
  generateRoundSequence,
} from "./params";
import { logButtonPress, logVialLevels } from "./logging";
import "./styles/VialGame.css";

const VialGame = ({ userId }) => {
  // Randomly determine initial game version
  // const [hasBucket, setHasBucket] = useState(
  //   () => Math.random() < GAME_PARAMS.RANDOM_VERSION_PROBABILITY
  // );
  const [roundSequence] = useState(() => generateRoundSequence());

  const [vial1Level, setVial1Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [vial2Level, setVial2Level] = useState(GAME_PARAMS.INITIAL_VIAL_LEVEL);
  const [bucket2Level, setBucket2Level] = useState(
    GAME_PARAMS.INITIAL_BUCKET_LEVEL
  );
  const [gameRunning, setGameRunning] = useState(true);
  const [gameMessage, setGameMessage] = useState(GAME_MESSAGES.PLAYING);
  const [messageType, setMessageType] = useState("playing");

  // Round management
  const [currentRound, setCurrentRound] = useState(0);
  const currentRoundConfig = roundSequence[currentRound];
  console.log(currentRound);
  console.log(currentRoundConfig);
  const [hasBucket, setHasBucket] = useState(
    () => currentRoundConfig?.hasBucket
  );
  const currentDrainRate = currentRoundConfig?.drainRate || 0.5;
  const [score, setScore] = useState(0);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(
    GAME_PARAMS.ROUND_DURATION
  );
  const [isRoundTransition, setIsRoundTransition] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const gameLoopRef = useRef(null);
  const roundTimerRef = useRef(null);
  const vialLoggerRef = useRef(null);
  const keyLocked = useRef(false);

  // Set game version in Firebase when component mounts or hasBucket changes
  // useEffect(() => {
  //   setGameVersion(hasBucket);
  // }, [hasBucket]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore key presses during round transitions
      if (isRoundTransition || !gameRunning) return;
      // ignore key presses if another key is being pressed
      if (event.repeat) return; // ⛔ Ignore hold repeats
      if (keyLocked.current) return;
      keyLocked.current = true;

      // Get current state for logging
      const getCurrentState = () => ({
        vial1Level,
        vial2Level,
        bucket2Level,
        hasBucket,
        gameRunning,
        currentRound,
        score,
        roundTimeRemaining,
      });

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (vial1Level < GAME_PARAMS.MAX_LEVEL) {
            logButtonPress("add_vial_1", getCurrentState());
            setVial1Level((prev) =>
              Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
            );
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          logButtonPress("add_vial_2", getCurrentState());
          if (hasBucket) {
            setVial2Level((prev) => prev + GAME_PARAMS.ADD_AMOUNT);
          } else {
            setVial2Level((prev) =>
              Math.min(GAME_PARAMS.MAX_LEVEL, prev + GAME_PARAMS.ADD_AMOUNT)
            );
          }
          break;
        case "ArrowUp":
          if (hasBucket && bucket2Level > 0) {
            event.preventDefault();
            logButtonPress("empty_bucket", getCurrentState());
            setVial2Level((prev) => prev + GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
            setBucket2Level((prev) => prev - GAME_PARAMS.EMPTY_BUCKET_AMOUNT);
          }
          break;
        default:
          break;
      }
      setTimeout(() => {
        keyLocked.current = false;
      }, 100); // Adjust if needed
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isRoundTransition,
    gameRunning,
    hasBucket,
    vial1Level,
    vial2Level,
    bucket2Level,
    currentRound,
    score,
    roundTimeRemaining,
  ]);

  // Start game loop
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      gameLoopRef.current = setInterval(() => {
        // Drain both vials
        setVial1Level((prev) => Math.max(0, prev - currentDrainRate));
        setVial2Level((prev) => Math.max(0, prev - currentDrainRate));
      }, GAME_PARAMS.GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameRunning, isRoundTransition]);

  // Round timer
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      roundTimerRef.current = setInterval(() => {
        setRoundTimeRemaining((prev) => {
          if (prev <= 1) {
            // Stop the timer and trigger round completion
            clearInterval(roundTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Update every second
    } else {
      clearInterval(roundTimerRef.current);
    }

    return () => clearInterval(roundTimerRef.current);
  }, [gameRunning, isRoundTransition]);

  // Check for round completion
  useEffect(() => {
    if (roundTimeRemaining === 0 && gameRunning && !isRoundTransition) {
      completeRound();
      setHasBucket(
        () => Math.random() < GAME_PARAMS.RANDOM_VERSION_PROBABILITY
      );
    }
  }, [roundTimeRemaining, gameRunning, isRoundTransition]);
  const gameStateRef = useRef();

  useEffect(() => {
    gameStateRef.current = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
      currentRound,
      score,
      roundTimeRemaining,
    };
  }, [
    vial1Level,
    vial2Level,
    bucket2Level,
    hasBucket,
    gameRunning,
    currentRound,
    score,
    roundTimeRemaining,
    // currentDrainRate,
  ]);

  // Logging interval
  useEffect(() => {
    if (gameRunning && !isRoundTransition) {
      vialLoggerRef.current = setInterval(() => {
        logVialLevels(gameStateRef.current); // Always latest values
      }, 100);
    } else {
      clearInterval(vialLoggerRef.current);
    }

    return () => clearInterval(vialLoggerRef.current);
  }, [gameRunning, isRoundTransition]);

  // // Vial level logger - logs every hundred second
  // useEffect(() => {
  //   if (gameRunning && !isRoundTransition) {
  //     vialLoggerRef.current = setInterval(() => {
  //       const currentState = {
  //         vial1Level,
  //         vial2Level,
  //         bucket2Level,
  //         hasBucket,
  //         gameRunning,
  //         currentRound,
  //         score,
  //         roundTimeRemaining,
  //       };
  //       logVialLevels(currentState);
  //     }, 100); // Log every second
  //   } else {
  //     clearInterval(vialLoggerRef.current);
  //   }
  //   // console.log(currentState);

  //   return () => clearInterval(vialLoggerRef.current);
  // }, [gameRunning, isRoundTransition]);

  // Handle vial 2 overflow (only if bucket exists)
  useEffect(() => {
    if (hasBucket && vial2Level > GAME_PARAMS.MAX_LEVEL) {
      // bucket not full
      if (bucket2Level < 100) {
        // Bucket has room - transfer excess to bucket
        const excess = vial2Level - GAME_PARAMS.MAX_LEVEL;
        const amountToTransfer = Math.min(excess, 100 - bucket2Level);

        if (amountToTransfer > 0) {
          setBucket2Level((prev) => Math.min(100, prev + amountToTransfer));
          setVial2Level(GAME_PARAMS.MAX_LEVEL);
        }
      }
      // If bucket is full, vial can continue filling above 70%
      // (no cap, just let it fill naturally)
      else if (vial2Level > GAME_PARAMS.MAX_LEVEL) {
        setVial2Level(GAME_PARAMS.MAX_LEVEL);
      }
    } else if (!hasBucket && vial2Level > GAME_PARAMS.MAX_LEVEL) {
      // Without bucket, cap at MAX_LEVEL
      setVial2Level(GAME_PARAMS.MAX_LEVEL);
    }
  }, [vial2Level, hasBucket, bucket2Level]);

  // Check for round failure (vial emptied)
  useEffect(() => {
    if (
      (vial1Level <= 0 || vial2Level <= 0) &&
      gameRunning &&
      !isRoundTransition
    ) {
      failRound();
    }
  }, [vial1Level, vial2Level, gameRunning, isRoundTransition]);

  const completeRound = () => {
    // Player survived the round!
    setScore((prev) => prev + 1);
    setIsRoundTransition(true);
    setGameMessage(GAME_MESSAGES.ROUND_COMPLETE);
    setMessageType("round-complete");

    // Check if this was the final round
    if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
      // Game is complete after 20 rounds
      setTimeout(() => {
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    // Reset vials and bucket for next round
    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
    }, GAME_PARAMS.TRANSITION_TIME); // 2 second pause between rounds
  };

  const failRound = () => {
    // Player failed the round (vial emptied), but continue to next round
    setIsRoundTransition(true);
    setGameMessage(GAME_MESSAGES.GAME_OVER);
    setMessageType("round-failed");

    // Check if this was the final round
    if (currentRound + 1 >= GAME_PARAMS.MAX_ROUNDS) {
      // Game is complete after 20 rounds
      setTimeout(() => {
        setGameComplete(true);
        setGameRunning(false);
      }, 2000);
      return;
    }

    // Reset vials and bucket for next round (no score increase)
    setTimeout(() => {
      setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
      setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
      setCurrentRound((prev) => prev + 1);
      setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
      setGameMessage(GAME_MESSAGES.PLAYING);
      setMessageType("playing");
      setIsRoundTransition(false);
      setGameRunning(true);
    }, 2000); // 2 second pause before next round
  };

  const restartGame = () => {
    // Log button press before state update
    const currentState = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
      currentRound,
      score,
      roundTimeRemaining,
    };
    logButtonPress("restart", currentState);

    setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
    setGameRunning(true);
    setGameMessage(GAME_MESSAGES.PLAYING);
    setMessageType("playing");
    setCurrentRound(0);
    setScore(0);
    setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
    setIsRoundTransition(false);
    setGameComplete(false);
  };

  const toggleGameVersion = () => {
    // Log button press before state update
    const currentState = {
      vial1Level,
      vial2Level,
      bucket2Level,
      hasBucket,
      gameRunning,
      currentRound,
      score,
      roundTimeRemaining,
    };
    logButtonPress("toggle_version", currentState);

    setHasBucket((prev) => !prev);
    // Reset game state when switching versions
    setVial1Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setVial2Level(GAME_PARAMS.INITIAL_VIAL_LEVEL);
    setBucket2Level(GAME_PARAMS.INITIAL_BUCKET_LEVEL);
    setGameRunning(true);
    setGameMessage(GAME_MESSAGES.PLAYING);
    setMessageType("playing");
    setCurrentRound(0);
    setScore(0);
    setRoundTimeRemaining(GAME_PARAMS.ROUND_DURATION);
    setIsRoundTransition(false);
    setGameComplete(false);
  };

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
              round={currentRound + 1}
              message={gameMessage} // "Round Complete", "Game Over", etc.
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
              <Vial level={vial1Level} hasSpout={false} bucketLevel={0} />
            </div>

            <div className="vial-setup">
              <div className="liquid-level">
                Vial 2: {Math.round(vial2Level)}%
              </div>
              <div className="vial-and-bucket">
                <Vial
                  level={vial2Level}
                  hasSpout={hasBucket}
                  bucketLevel={bucket2Level}
                />
              </div>
            </div>
          </div>

          <GameControls
            onAddVial1={() => {}}
            onAddVial2={() => {}}
            onEmptyBucket={() => {}}
            onRestart={restartGame}
            onToggleVersion={toggleGameVersion}
            gameRunning={gameRunning && !isRoundTransition}
            bucketLevel={bucket2Level}
            hasBucket={hasBucket}
          />

          <div className="instructions">
            <p>
              <strong>{INSTRUCTIONS.INTRO}</strong> {INSTRUCTIONS.COMMON}
            </p>
            <p className="keyboard-controls">
              <strong>Controls:</strong> {INSTRUCTIONS.CONTROLS_BASE}
              {hasBucket && INSTRUCTIONS.CONTROLS_WITH_BUCKET}
            </p>
            <p>
              {hasBucket ? (
                <>{INSTRUCTIONS.WITH_BUCKET}</>
              ) : (
                <>{INSTRUCTIONS.WITHOUT_BUCKET}</>
              )}{" "}
              {INSTRUCTIONS.ENDING}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VialGame;
