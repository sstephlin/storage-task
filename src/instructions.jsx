import React from "react";
import "../styles/InstructionsPage.css";

const InstructionsPage = ({ onStart }) => {
  return (
    <div className="instructions-page">
      <div className="instructions-container">
        <h1>Two Vials Game</h1>
        <h2>Instructions</h2>

        <div className="instructions-content">
          <section className="instruction-section">
            <h3>🎯 Objective</h3>
            <p>
              Keep both vials from emptying for 30 seconds per round. Complete
              32 rounds to finish the game.
            </p>
          </section>

          <section className="instruction-section">
            <h3>🎮 Controls</h3>
            <div className="controls-list">
              <div className="control-item">
                <span className="key">← Left Arrow</span>
                <span className="action">Add liquid to Vial 1</span>
              </div>
              <div className="control-item">
                <span className="key">→ Right Arrow</span>
                <span className="action">Add liquid to Vial 2</span>
              </div>
              <div className="control-item">
                <span className="key">↑ Up Arrow</span>
                <span className="action">
                  Empty the bucket (when available)
                </span>
              </div>
            </div>
            <p className="control-note">
              <strong>Note:</strong> You must press the arrow key each time.
              Holding down the key will not work.
            </p>
          </section>

          <section className="instruction-section">
            <h3>🔴🟢 Color Zones</h3>
            <p>
              <span className="zone-indicator red">Red Zone (0-69%):</span>
              Liquid is below the optimal level
            </p>
            <p>
              <span className="zone-indicator green">
                Green Zone (70-100%):
              </span>
              Liquid is in the optimal level
            </p>
            <p className="zone-note">
              Keep your vials in the green zone for best performance!
            </p>
          </section>

          <section className="instruction-section">
            <h3>🪣 The Bucket (Some Rounds)</h3>
            <p>
              In some rounds, Vial 2 will have a bucket attached. When Vial 2
              reaches 70%, excess liquid flows into the bucket through a pipe.
            </p>
            <p>
              Once the bucket is full, Vial 2 can continue filling above 70%.
              Use the Up Arrow to empty the bucket back into Vial 2.
            </p>
          </section>

          <section className="instruction-section">
            <h3>⚡ Game Variations</h3>
            <p>
              Each round may have different drain speeds and bucket
              configurations. Adapt your strategy accordingly!
            </p>
          </section>

          <section className="instruction-section">
            <h3>✅ Scoring</h3>
            <p>
              You earn 1 point for each round you survive the full 30 seconds.
              If a vial empties before time runs out, you get 0 points for that
              round but continue to the next round.
            </p>
          </section>
        </div>

        <button className="start-button" onClick={onStart}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default InstructionsPage;
