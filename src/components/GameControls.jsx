import React from "react";
import { BUTTON_LABELS } from "../params";
import "../styles/GameControls.css";

const GameControls = ({
  onAddVial1,
  onAddVial2,
  onEmptyBucket,
  onRestart,
  onToggleVersion,
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
        {BUTTON_LABELS.ADD_VIAL_1}
      </button>

      <button
        className="add-liquid"
        onClick={onAddVial2}
        disabled={!gameRunning}
      >
        {BUTTON_LABELS.ADD_VIAL_2}
      </button>

      {hasBucket && (
        <button
          className="empty-bucket"
          onClick={onEmptyBucket}
          disabled={bucketLevel === 0 || !gameRunning}
        >
          {BUTTON_LABELS.EMPTY_BUCKET}
        </button>
      )}

      <button className="restart" onClick={onRestart}>
        {BUTTON_LABELS.RESTART}
      </button>

      <button className="toggle-version" onClick={onToggleVersion}>
        {hasBucket
          ? BUTTON_LABELS.TOGGLE_WITH_BUCKET
          : BUTTON_LABELS.TOGGLE_WITHOUT_BUCKET}
      </button>
    </div>
  );
};

export default GameControls;
