import React, { useState, useEffect, useRef } from "react";
import Vial from "./components/Vial";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";
import "./styles/VialGame.css";

const VialGame = () => {
  // Randomly determine game version at start (50% chance for each)
  const [hasBucket] = useState(() => Math.random() < 0.5);

  const [vial1Level, setVial1Level] = useState(100);
  const [vial2Level, setVial2Level] = useState(100);
  const [bucket2Level, setBucket2Level] = useState(0);
  const [gameRunning, setGameRunning] = useState(true);
  const [gameMessage, setGameMessage] = useState(
    "Keep both vials from emptying!"
  );
  const [showOverflow, setShowOverflow] = useState(false);

  const gameLoopRef = useRef(null);

  // Game constants
  const DRAIN_RATE = 0.5; // Percentage points per 100ms
  const ADD_AMOUNT = 15; // Amount added per click
  const MAX_LEVEL = 100;
  const GAME_SPEED = 100; // milliseconds

  // Start game loop
  useEffect(() => {
    if (gameRunning) {
      gameLoopRef.current = setInterval(() => {
        // Drain both vials
        setVial1Level((prev) => Math.max(0, prev - DRAIN_RATE));
        setVial2Level((prev) => Math.max(0, prev - DRAIN_RATE));
      }, GAME_SPEED);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameRunning]);

  // Handle vial 2 overflow (only if bucket exists)
  useEffect(() => {
    if (hasBucket && vial2Level > MAX_LEVEL) {
      const overflow = vial2Level - MAX_LEVEL;
      setBucket2Level((prev) => Math.min(100, prev + overflow));
      setVial2Level(MAX_LEVEL);
      setShowOverflow(true);
    } else if (!hasBucket && vial2Level > MAX_LEVEL) {
      // Without bucket, cap at MAX_LEVEL without overflow
      setVial2Level(MAX_LEVEL);
      setShowOverflow(false);
    } else {
      setShowOverflow(false);
    }
  }, [vial2Level, hasBucket]);

  // Check for game over
  useEffect(() => {
    if (vial1Level <= 0 || vial2Level <= 0) {
      setGameRunning(false);
      setGameMessage("Game Over! A vial emptied!");
    }
  }, [vial1Level, vial2Level]);

  const addLiquid = (vialNumber) => {
    if (!gameRunning) return;

    if (vialNumber === 1) {
      setVial1Level((prev) => Math.min(MAX_LEVEL, prev + ADD_AMOUNT));
    } else if (vialNumber === 2) {
      if (hasBucket) {
        setVial2Level((prev) => prev + ADD_AMOUNT); // Allow overflow with bucket
      } else {
        setVial2Level((prev) => Math.min(MAX_LEVEL, prev + ADD_AMOUNT)); // Cap without bucket
      }
    }
  };

  const emptyBucket = () => {
    if (!gameRunning || bucket2Level === 0 || !hasBucket) return;

    setVial2Level((prev) => prev + bucket2Level);
    setBucket2Level(0);
  };

  const restartGame = () => {
    setVial1Level(100);
    setVial2Level(100);
    setBucket2Level(0);
    setGameRunning(true);
    setGameMessage("Keep both vials from emptying!");
    setShowOverflow(false);
    // Note: hasBucket remains the same, determined at component mount
  };

  return (
    <div className="vial-game">
      <h1>Two Vials Game</h1>

      <GameStatus message={gameMessage} isGameOver={!gameRunning} />

      <div className="game-container">
        <div className="vial-setup">
          <div className="liquid-level">Vial 1: {Math.round(vial1Level)}%</div>
          <Vial level={vial1Level} hasSpout={false} showOverflow={false} />
        </div>

        <div className="vial-setup">
          <div className="liquid-level">Vial 2: {Math.round(vial2Level)}%</div>
          <div className="vial-and-bucket">
            <Vial
              level={vial2Level}
              hasSpout={hasBucket}
              showOverflow={showOverflow}
              bucketLevel={bucket2Level}
            />
            {hasBucket && (
              <div className="bucket-label">
                Bucket: {Math.round(bucket2Level)}%
              </div>
            )}
          </div>
        </div>
      </div>

      <GameControls
        onAddVial1={() => addLiquid(1)}
        onAddVial2={() => addLiquid(2)}
        onEmptyBucket={emptyBucket}
        onRestart={restartGame}
        gameRunning={gameRunning}
        bucketLevel={bucket2Level}
        hasBucket={hasBucket}
      />

      <div className="instructions">
        <p>
          <strong>How to play:</strong> Both vials constantly drain at the same
          rate.
          {hasBucket ? (
            <>
              {" "}
              Vial 2 has a spout that causes it to overflow into the bucket when
              full. Add liquid to keep both vials from emptying completely.
              Empty the bucket to return liquid to Vial 2.{" "}
            </>
          ) : (
            <>
              {" "}
              Add liquid to keep both vials from emptying completely. Vial
              levels are capped at 100%.{" "}
            </>
          )}
          The game ends when either vial reaches 0%!
        </p>
      </div>
    </div>
  );
};

export default VialGame;
