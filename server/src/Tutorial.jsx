import React from "react";
import InstructionsTutorial from "./instructions";
import "./instructions.css";

/**
 * Tutorial wrapper component that displays the tutorial slides before the game
 * This is shown as a separate phase after login and before training/main game
 */
const Tutorial = ({ onComplete }) => {
  return <InstructionsTutorial onExit={onComplete} />;
};

export default Tutorial;
