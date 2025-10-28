// import React from "react";
// import "../styles/InstructionsPage.css";

// const InstructionsPage = ({ onStart }) => {
//   return (
//     <div className="instructions-page">
//       <div className="instructions-container">
//         <h1>Two Vials Game</h1>
//         <h2>Instructions</h2>

//         <div className="instructions-content">
//           <section className="instruction-section">
//             <h3>🎯 Objective</h3>
//             <p>
//               Keep both vials from emptying for 30 seconds per round. Complete
//               32 rounds to finish the game.
//             </p>
//           </section>

//           <section className="instruction-section">
//             <h3>🎮 Controls</h3>
//             <div className="controls-list">
//               <div className="control-item">
//                 <span className="key">← Left Arrow</span>
//                 <span className="action">Add liquid to Vial 1</span>
//               </div>
//               <div className="control-item">
//                 <span className="key">→ Right Arrow</span>
//                 <span className="action">Add liquid to Vial 2</span>
//               </div>
//               <div className="control-item">
//                 <span className="key">↑ Up Arrow</span>
//                 <span className="action">
//                   Empty the bucket (when available)
//                 </span>
//               </div>
//             </div>
//             <p className="control-note">
//               <strong>Note:</strong> You must press the arrow key each time.
//               Holding down the key will not work.
//             </p>
//           </section>

//           <section className="instruction-section">
//             <h3>🔴🟢 Color Zones</h3>
//             <p>
//               <span className="zone-indicator red">Red Zone (0-69%):</span>
//               Liquid is below the optimal level
//             </p>
//             <p>
//               <span className="zone-indicator green">
//                 Green Zone (70-100%):
//               </span>
//               Liquid is in the optimal level
//             </p>
//             <p className="zone-note">
//               Keep your vials in the green zone for best performance!
//             </p>
//           </section>

//           <section className="instruction-section">
//             <h3>🪣 The Bucket (Some Rounds)</h3>
//             <p>
//               In some rounds, Vial 2 will have a bucket attached. When Vial 2
//               reaches 70%, excess liquid flows into the bucket through a pipe.
//             </p>
//             <p>
//               Once the bucket is full, Vial 2 can continue filling above 70%.
//               Use the Up Arrow to empty the bucket back into Vial 2.
//             </p>
//           </section>

//           <section className="instruction-section">
//             <h3>⚡ Game Variations</h3>
//             <p>
//               Each round may have different drain speeds and bucket
//               configurations. Adapt your strategy accordingly!
//             </p>
//           </section>

//           <section className="instruction-section">
//             <h3>✅ Scoring</h3>
//             <p>
//               You earn 1 point for each round you survive the full 30 seconds.
//               If a vial empties before time runs out, you get 0 points for that
//               round but continue to the next round.
//             </p>
//           </section>
//         </div>

//         <button className="start-button" onClick={onStart}>
//           Start Game
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InstructionsPage;
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./instructions.css";

// Define all tutorial slides here
const TUTORIAL_SLIDES = [
  {
    id: 1,
    title: "Welcome to the Maintenance Task!",
    content: "",
    image: null, // Path to image or gif, or null
    showButtons: false,
  },
  {
    id: 2,
    title: "This is BleeBlop",
    content: "",
    image: "Picture1.png",
    showButtons: false, // Enable interactive buttons on this slide
  },
  {
    id: 3,
    title: "Bleeblop’s Goal is to Reach Robonia",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 4,
    title: "But his journey there won’t be easy…",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 5,
    title:
      "For Bleeblop to survive, his gloop and glop levels need to be at a certain point ",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 6,
    title: "If either or both of them max out…",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 7,
    title: "Bleeblop will Overheat",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 8,
    title: "If either or both of them empty…",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 9,
    title: "Bleeblop will run out of power",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 10,
    title:
      "Your Job is to keep BleeBlop’s gloop and glop levels at the ideal height",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 11,
    title: "Use the left arrow key to add to the left container",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 12,
    title: "and the right arrow key to add to the right one",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 13,
    title: "Sometimes, Bleeblop will have an extra container for their glop",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 14,
    title:
      "This extra container will naturally fill as the main glop container drains",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 15,
    title:
      "But only when the glop levels are above the ideal level. If they are below the ideal level, the drained glop is simply lost",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 16,
    title:
      "Click the up arrow to dump some stored glob into the main glob container",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 17,
    title: "To summarize…",
    content: [
      "Use the left arrow key to add gloop to the left container",
      "Use the right arrow key to add glop to the right container",
      "Use the up arrow key to add your stored glop to the right container",
    ],
    image: null,
    showButtons: false,
  },
  {
    id: 18,
    title:
      "The closer you can keep Bleeblop's gloop and glop levels to their ideals, the faster they will progress towards Robonia",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 19,
    title:
      "Along the way, Bleeblop will pass several repair shops. If Bleeblop overheats or runs out of power, their journey will continue from the last repair shop they passed. ",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 20,
    title:
      "If you are able to get Bleeblop to Robonia, you will receive a 5$ bonus at the end of the task",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 21,
    title: "Ready to Go? Any Questions?",
    content: "",
    image: null,
    showButtons: false,
  },
];
const Tutorial = ({ onExit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = TUTORIAL_SLIDES.length;
  const slide = TUTORIAL_SLIDES[currentSlide];

  const goNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onExit(); // Exit tutorial on last slide
    }
  };

  const goPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "ArrowRight" || e.key === "Enter") {
      goNext();
    } else if (e.key === "ArrowLeft") {
      goPrevious();
    } else if (e.key === "Escape") {
      onExit();
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide]);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-container">
        {/* Exit button */}
        <button
          className="tutorial-exit"
          onClick={onExit}
          title="Exit Tutorial (ESC)"
        >
          <X size={24} />
        </button>

        {/* Progress indicator */}
        <div className="tutorial-progress">
          <div className="progress-dots">
            {TUTORIAL_SLIDES.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  index === currentSlide ? "active" : ""
                } ${index < currentSlide ? "completed" : ""}`}
              />
            ))}
          </div>
          <div className="progress-text">
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>

        {/* Slide content */}
        <div className="tutorial-content">
          <h1 className="tutorial-title">{slide.title}</h1>

          {slide.image && (
            <div className="tutorial-image">
              <img src={slide.image} alt={slide.title} />
            </div>
          )}

          <div className="tutorial-text">
            {Array.isArray(slide.content)
              ? // If content is an array, render each item as a paragraph
                slide.content.map((line, i) => <p key={i}>{line}</p>)
              : // If content is a string, split by newlines
                slide.content
                  .split("\n")
                  .map((line, i) => <p key={i}>{line}</p>)}
          </div>

          {slide.showButtons && (
            <div className="tutorial-demo-buttons">
              <button className="demo-button">← Add to Vial 1</button>
              <button className="demo-button">→ Add to Vial 2</button>
              <button className="demo-button">↑ Empty Bucket</button>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="tutorial-navigation">
          <button
            className="nav-button prev"
            onClick={goPrevious}
            disabled={currentSlide === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button className="nav-button next" onClick={goNext}>
            {currentSlide === totalSlides - 1 ? "Start Game" : "Next"}
            {currentSlide < totalSlides - 1 && <ChevronRight size={20} />}
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="keyboard-hints">
          <span>← → to navigate</span>
          <span>ESC to exit</span>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
