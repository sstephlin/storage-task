import React from "react";
import "../styles/GameStatus.css";

const GameStatus = ({ message, isGameOver }) => {
  return (
    <div className={`game-status ${isGameOver ? "game-over" : ""}`}>
      {message}
    </div>
  );
};

export default GameStatus;
