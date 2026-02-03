import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./instructions.css";

// Set to false for production, true for debugging (disables timer and quiz validation)
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
    image: "mov1.mov",
    showButtons: false,
  },
  {
    id: 3,
    title: "Bleeblop's Goal is to Reach Robonia",
    content: "",
    image: "mov6.mov",
    showButtons: false,
  },
  {
    id: 4,
    title: "But their journey there won't be easy…",
    content: "",
    image: "Picture5.png",
    showButtons: false,
  },
  {
    id: 5,
    title:
      "For Bleeblop to move most efficiently, his gloop and glep levels need to be at a certain point",
    content: "",
    image: "Picture6.png",
    showButtons: false,
  },
  {
    id: 6,
    title: "These levels will naturally drain overtime, though…",
    content: "",
    image: "Picture7.png",
    showButtons: false,
  },
  {
    id: 7,
    title:
      "So, you will need to add to BleeBlop's gloop and glep levels to keep them at the ideal height!",
    content: "",
    image: "Picture8.png",
    showButtons: false,
  },
  {
    id: 8,
    title: "If either or both of them max out…",
    content: "",
    image: "Picture9.png",
    showButtons: false,
  },
  {
    id: 9,
    title: "Bleeblop will Overheat",
    content: "",
    image: "Picture10.png",
    showButtons: false,
  },
  {
    id: 10,
    title: "If either or both of them empty…",
    content: "",
    image: "Picture11.png",
    showButtons: false,
  },
  {
    id: 11,
    title: "Bleeblop will run out of power",
    content: "",
    image: "Picture12.png",
    showButtons: false,
  },
  {
    id: 12,
    title:
      "Your Job is to keep BleeBlop's gloop and glep levels at the ideal height so that BleeBlop can get to Robonia as fast as possible!",
    content: "",
    image: "Picture8.png",
    showButtons: false,
  },
  {
    id: 13,
    title: "Quick Check: Where is BeeBlop trying to go?",
    content: "",
    type: "quiz",
    quiz: {
      options: [
        { id: "a", text: "To Mars", correct: false },
        { id: "b", text: "To Robonia", correct: true },
        { id: "c", text: "To Providence, RI", correct: false },
        {
          id: "d",
          text: "Out on the town",
          correct: false,
        },
        {
          id: "e",
          text: "Disneyland",
          correct: false,
        },
      ],
      returnToSlide: 3, // If wrong, return to slide explaining overheating
      explanation: "Correct!",
    },
    showButtons: false,
  },
  {
    id: 14,
    title:
      "Quick Check: What happens to BleeBlop's gloop and glep containters over time?",
    content: "",
    type: "quiz",
    quiz: {
      options: [
        { id: "a", text: "They drain", correct: true },
        { id: "b", text: "Nothing", correct: false },
        { id: "c", text: "They fill", correct: false },
        {
          id: "d",
          text: "The gloop container fills, but the glep container drains",
          correct: false,
        },
        {
          id: "e",
          text: "The gloop container fills, and nothing happens to the other",
          correct: false,
        },
      ],
      returnToSlide: 5, // If wrong, return to slide explaining overheating
      explanation: "Correct!",
    },
    showButtons: false,
  },
  {
    id: 15,
    title:
      "Quick Check: What happens if one/both of Bleeblop's containers max out?",
    content: "",
    type: "quiz",
    quiz: {
      options: [
        {
          id: "a",
          text: "Bleeblop moves faster/as fast as possible",
          correct: false,
        },
        { id: "b", text: "Bleepblop overheats", correct: true },
        { id: "c", text: "Bleeblop slows down/stops", correct: false },
        {
          id: "d",
          text: "Nothing",
          correct: false,
        },
      ],
      returnToSlide: 8, // If wrong, return to slide explaining overheating
      explanation: "Correct!",
    },
    showButtons: false,
  },
  {
    id: 16,
    title:
      "Quick Check: What happens if one/both of Bleeblop's containers empty?",
    content: "",
    type: "quiz",
    quiz: {
      options: [
        {
          id: "a",
          text: "Bleeblop moves faster/as fast as possible",
          correct: false,
        },
        { id: "b", text: "Bleepblop slows down/stops", correct: false },
        { id: "c", text: "Bleeblop runs out of power", correct: true },
        {
          id: "d",
          text: "Nothing",
          correct: false,
        },
      ],
      returnToSlide: 10, // If wrong, return to slide explaining overheating
      explanation: "Correct!",
    },
    showButtons: false,
  },
  {
    id: 17,
    title: "Quick Check: When does BleeBlop move the fastest?",
    content: "",
    type: "quiz",
    quiz: {
      options: [
        {
          id: "a",
          text: "When their glep levels are at the ideal height",
          correct: false,
        },
        {
          id: "b",
          text: "When both their gloop and glep levels are high",
          correct: false,
        },
        {
          id: "c",
          text: "When both their gloop and glep levels are at the ideal height",
          correct: true,
        },
        {
          id: "d",
          text: "When their gloop levels are high",
          correct: false,
        },
      ],
      returnToSlide: 12, // If wrong, return to slide explaining overheating
      explanation: "Correct!",
    },
    showButtons: false,
  },
  {
    id: 18,
    title: "Awesome! Here's how you can help BleeBlop:",
    content: "",
    image: "Picture8.png",
    showButtons: false,
  },
  {
    id: 19,
    title: "Use the left arrow key to add to the left gloop container",
    content: "",
    image: "Picture19.png",
    showButtons: false,
  },
  {
    id: 20,
    title: "and the right arrow key to add to the right glep container",
    content: "",
    image: "Picture20.png",
    showButtons: false,
  },
  {
    id: 21,
    title: "Sometimes, Bleeblop will have an extra container for their glep",
    content: "",
    image: "Picture21.png",
    showButtons: false,
  },
  {
    id: 22,
    title:
      "When BleeBlop has more than the ideal amount of glep, the glep that naturally drains will fill this container",
    content: "",
    image: "mov3.mov",
    showButtons: false,
  },
  {
    id: 23,
    title:
      "When BleeBlop has more than the ideal amount of glep, the glep that naturally drains will fill this container",
    content:
      "IMPORTANT: this only happens if Bleeblop has more than the ideal level of glep",
    image: "mov3.mov",
    showButtons: false,
  },
  {
    id: 24,
    title:
      "If their glep is below the ideal level, the drained glep is simply lost",
    content: "",
    image: "mov4.mov",
    showButtons: false,
  },
  {
    id: 25,
    title:
      "You can use the up arrow to dump some stored glep into the main glep container",
    content: "",
    image: "Picture25.png",
    showButtons: false,
  },
  {
    id: 26,
    title: "To summarize…",
    content: [
      " - Use the left arrow key to add gloop to the left container",
      " - Use the right arrow key to add glep to the right container",
      " - Use the up arrow key to add your stored glep to the right container",
    ],
    image: null,
    showButtons: false,
  },
  {
    id: 27,
    title:
      "Every day, BleeBlop will move towards Robonia, but how far BleeBlop gets will depend on you",
    content: "",
    image: "Picture5.png",
    showButtons: false,
  },
  {
    id: 28,
    title:
      "The closer you can keep Bleeblop's gloop and glep levels to their ideals, the faster BleeBlop will progress towards Robonia",
    content: "",
    image: "Picture5.png",
    showButtons: false,
  },
  {
    id: 29,
    title: "BleeBlop's Gloop and Glep levels will reset each day",
    content: "",
    image: "Picture6.png",
    showButtons: false,
  },
  {
    id: 30,
    title:
      "But you'll get to keep whatever glep you've stored (even if it isn't accessible that day)",
    content: "",
    image: "Picture21.png",
    showButtons: false,
  },
  {
    id: 31,
    title:
      "Overheating or running out of power will cause Bleeblop to go backwards to the last repair shop that they passed",
    content: "",
    image: "Picture31.png",
    showButtons: false,
  },
  {
    id: 32,
    title:
      "If you are able to get Bleeblop to Robonia before the task ends, you will receive a $5 bonus!",
    content: "",
    image: "Picture32.png",
    showButtons: false,
  },
  {
    id: 33,
    title: "Ready to Go? Any Questions?",
    content: "",
    image: "Picture6.png",
    showButtons: false,
  },
];

const Tutorial = ({ onExit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canProceed, setCanProceed] = useState(DEBUG_MODE);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [isDisqualified, setIsDisqualified] = useState(false);
  const totalSlides = TUTORIAL_SLIDES.length;
  const slide = TUTORIAL_SLIDES[currentSlide];

  const goNext = () => {
    if (!canProceed) return;

    // If this is a quiz slide, validate answers
    if (slide.type === "quiz" && !DEBUG_MODE) {
      const isCorrect = validateQuizAnswers();
      if (!isCorrect) {
        return; // Don't proceed if wrong
      }
    }

    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
      setCanProceed(DEBUG_MODE);
      setSelectedAnswers({});
      setQuizFeedback(null);
    } else {
      onExit();
    }
  };

  const goPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setSelectedAnswers({});
      setQuizFeedback(null);
    }
  };

  const validateQuizAnswers = () => {
    const quiz = slide.quiz;
    const correctAnswers = quiz.options
      .filter((opt) => opt.correct)
      .map((opt) => opt.id);

    const userAnswers = Object.keys(selectedAnswers).filter(
      (key) => selectedAnswers[key],
    );

    // Check if all correct answers are selected and no incorrect ones
    const isCorrect =
      correctAnswers.length === userAnswers.length &&
      correctAnswers.every((id) => userAnswers.includes(id));

    if (isCorrect) {
      setQuizFeedback({
        type: "success",
        message: quiz.explanation || "Correct!",
      });
      setTimeout(() => {
        goNext();
      }, 1500);
      return true;
    } else {
      // Track attempts for this slide
      const currentAttempts = quizAttempts[slide.id] || 0;
      const newAttempts = currentAttempts + 1;

      setQuizAttempts((prev) => ({
        ...prev,
        [slide.id]: newAttempts,
      }));

      if (newAttempts >= 3) {
        // Failed 3 times - disqualify
        setQuizFeedback({
          type: "error",
          message:
            "You have reached the maximum number of attempts. You will not be able to continue with the study.",
        });
        setTimeout(() => {
          setIsDisqualified(true);
        }, 2500);
        return false;
      } else {
        // Show feedback with attempt count
        const attemptsRemaining = 3 - newAttempts;
        setQuizFeedback({
          type: "error",
          message: `Not quite right. Let's review that information again. (${attemptsRemaining} attempt${
            attemptsRemaining !== 1 ? "s" : ""
          } remaining)`,
        });
        setTimeout(() => {
          setCurrentSlide(quiz.returnToSlide);
          setSelectedAnswers({});
          setQuizFeedback(null);
        }, 2500);
        return false;
      }
    }
  };

  const handleCheckboxChange = (optionId) => {
    // Use radio button logic - only one selection at a time
    setSelectedAnswers({ [optionId]: true });
    setQuizFeedback(null);
  };

  const handleKeyPress = (e) => {
    // Don't allow keyboard navigation for quiz slides
    if (slide.type === "quiz") return;

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
    if (DEBUG_MODE || slide.type === "quiz") {
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

  // Show disqualification screen
  if (isDisqualified) {
    return (
      <div className="tutorial-overlay">
        <div className="tutorial-container">
          <div
            className="tutorial-content"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
            <h1
              className="tutorial-title"
              style={{ color: "#e74c3c", marginBottom: "20px" }}
            >
              Study Participation Ended
            </h1>
            <div
              className="tutorial-text"
              style={{ fontSize: "18px", lineHeight: "1.6" }}
            >
              <p>
                Unfortunately, you have reached the maximum number of attempts
                for the comprehension questions.
              </p>
              <p>You will not be able to continue with this study.</p>
              <p style={{ marginTop: "30px", color: "#666" }}>
                Please close this window and contact the researcher if you have
                any questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-container">
        <button
          className="tutorial-exit"
          onClick={() => {
            console.log("Tutorial: exit button clicked, onExit=", onExit);
            if (typeof onExit === "function") onExit();
          }}
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
              {slide.image.endsWith(".mov") ||
              slide.image.endsWith(".mp4") ||
              slide.image.endsWith(".webm") ? (
                <video
                  src={slide.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ maxWidth: "100%", height: "100%" }}
                />
              ) : (
                <img src={slide.image} alt={slide.title} />
              )}
            </div>
          )}

          <div className="tutorial-text">
            {Array.isArray(slide.content)
              ? slide.content.map((line, i) => <p key={i}>{line}</p>)
              : slide.content
                  .split("\n")
                  .map((line, i) => <p key={i}>{line}</p>)}
          </div>

          {/* Quiz section */}
          {slide.type === "quiz" && slide.quiz && (
            <div className="quiz-section">
              {quizAttempts[slide.id] === 2 && !quizFeedback && (
                <div
                  className="quiz-warning"
                  style={{
                    background: "#fff3cd",
                    border: "2px solid #ffc107",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                    color: "#856404",
                    fontSize: "15px",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  ⚠️ Warning: This is your final attempt. An incorrect answer
                  will end your participation in the study.
                </div>
              )}
              <div className="quiz-options">
                {slide.quiz.options.map((option) => (
                  <label key={option.id} className="quiz-option">
                    <input
                      type="radio"
                      name={`quiz-${slide.id}`}
                      checked={selectedAnswers[option.id] || false}
                      onChange={() => handleCheckboxChange(option.id)}
                      disabled={quizFeedback !== null}
                    />
                    <span className="quiz-option-text">{option.text}</span>
                  </label>
                ))}
              </div>

              {quizFeedback && (
                <div className={`quiz-feedback ${quizFeedback.type}`}>
                  {quizFeedback.message}
                </div>
              )}

              <button
                className="quiz-submit-button"
                onClick={validateQuizAnswers}
                disabled={
                  Object.values(selectedAnswers).filter(Boolean).length === 0 ||
                  quizFeedback !== null
                }
              >
                Submit Answer
              </button>
            </div>
          )}

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
            disabled={!canProceed || slide.type === "quiz"}
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
