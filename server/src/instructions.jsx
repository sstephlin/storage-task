import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./instructions.css";

// Set to false for production, true for debugging (disables timer)
const DEBUG_MODE = true;

// Define all tutorial slides here
const TUTORIAL_SLIDES = [
  {
    id: 1,
    title: "Welcome to the Maintenance Task!",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 2,
    title: "This is BleeBlop",
    content: "",
    image: "Picture1.png",
    showButtons: false,
  },
  {
    id: 3,
    title: "Bleeblop's Goal is to Reach Robonia",
    content: "",
    image: null,
    showButtons: false,
  },
  {
    id: 4,
    title: "But his journey there won't be easy…",
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
      "Your Job is to keep BleeBlop's gloop and glop levels at the ideal height",
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
  const [canProceed, setCanProceed] = useState(DEBUG_MODE);
  const totalSlides = TUTORIAL_SLIDES.length;
  const slide = TUTORIAL_SLIDES[currentSlide];

  const goNext = () => {
    if (!canProceed) return;

    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
      setCanProceed(DEBUG_MODE);
    } else {
      onExit();
    }
  };

  const goPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "ArrowRight" || e.key === "Enter") {
      if (canProceed) {
        goNext();
      }
    } else if (e.key === "ArrowLeft") {
      goPrevious();
    } else if (e.key === "Escape") {
      onExit();
    }
  };

  // Timer effect for each slide
  React.useEffect(() => {
    if (DEBUG_MODE) {
      setCanProceed(true);
      return;
    }

    setCanProceed(false);
    const timer = setTimeout(() => {
      setCanProceed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, canProceed]);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-container">
        <button
          className="tutorial-exit"
          onClick={onExit}
          title="Exit Tutorial (ESC)"
        >
          <X size={24} />
        </button>

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

        <div className="tutorial-content">
          <h1 className="tutorial-title">{slide.title}</h1>

          {slide.image && (
            <div className="tutorial-image">
              <img src={slide.image} alt={slide.title} />
            </div>
          )}

          <div className="tutorial-text">
            {Array.isArray(slide.content)
              ? slide.content.map((line, i) => <p key={i}>{line}</p>)
              : slide.content
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

        <div className="tutorial-navigation">
          <button
            className="nav-button prev"
            onClick={goPrevious}
            disabled={currentSlide === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button
            className="nav-button next"
            onClick={goNext}
            disabled={!canProceed}
          >
            {currentSlide === totalSlides - 1 ? "Start Game" : "Next"}
            {currentSlide < totalSlides - 1 && <ChevronRight size={20} />}
          </button>
        </div>

        <div className="keyboard-hints">
          <span>← → to navigate</span>
          <span>ESC to exit</span>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
