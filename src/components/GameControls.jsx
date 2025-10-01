import React from "react";
import "../styles/GameControls.css";

const GameControls = ({
  onAddVial1,
  onAddVial2,
  onEmptyBucket,
  onRestart,
  gameRunning,
  bucketLevel,
  hasBucket,
}) => {
  return (
    <div className="controls">
      <button
        className="add-liquid"
        onClick={onAddVial1}
        disabled={!gameRunning}
      >
        Add to Vial 1
      </button>

      <button
        className="add-liquid"
        onClick={onAddVial2}
        disabled={!gameRunning}
      >
        Add to Vial 2
      </button>

      {hasBucket && (
        <button
          className="empty-bucket"
          onClick={onEmptyBucket}
          disabled={bucketLevel === 0 || !gameRunning}
        >
          Empty Bucket
        </button>
      )}

      <button className="restart" onClick={onRestart}>
        Restart Game
      </button>
    </div>
  );
};

export default GameControls;
