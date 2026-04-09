import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./instructions.css";
import { getTutorialSlides, getSlideIndexById } from "./tutorialSlides";
import { PRODUCTION_MODE } from "./participantConfig";
import { logTutorialSlideChange, logTutorialQuizAnswer } from "./logging";

// Set to false for production, true for debugging (disables timer and quiz validation)
const DEBUG_MODE = true;

const Tutorial = ({ onExit, gameVersion }) => {
  const TUTORIAL_SLIDES = React.useMemo(() => {
    return getTutorialSlides(gameVersion);
  }, [gameVersion]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [canProceed, setCanProceed] = useState(DEBUG_MODE);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [groupAttempts, setGroupAttempts] = useState({});
  const [showResultOverlay, setShowResultOverlay] = useState(null);

  const [groupQuizIndex, setGroupQuizIndex] = useState(0);
  const [groupHadError, setGroupHadError] = useState(false);

  const totalSlides = TUTORIAL_SLIDES.length;

  const slide = React.useMemo(() => {
    const s = TUTORIAL_SLIDES[currentSlide];
    if (s?.type === "quizGroup") {
      return { ...s.quizzes[groupQuizIndex], _group: s };
    }
    return s;
  }, [TUTORIAL_SLIDES, currentSlide, groupQuizIndex]);

  // ─── Helper: log slide navigation ──────────────────────────────────────────
  const logSlideChange = (newSlideIndex, direction) => {
    const targetSlide = TUTORIAL_SLIDES[newSlideIndex];
    // A slide is a quiz slide if it's type "quiz" or a "quizGroup"
    const isQuizSlide =
      targetSlide?.type === "quiz" || targetSlide?.type === "quizGroup";

    logTutorialSlideChange({
      slideIndex: newSlideIndex,
      slideId: targetSlide?.id ?? String(newSlideIndex),
      isQuizSlide,
      direction,
      gameVersion,
    });
  };

  const showOverlayThenRedirect = (type, redirectFn) => {
    if (type === "exit") {
      redirectFn();
      return;
    }
    setShowResultOverlay(type);
    const delay = type === "incorrect" ? 6000 : 2000;
    setTimeout(() => {
      setShowResultOverlay(null);
      redirectFn();
    }, delay);
  };

  const goNext = () => {
    if (!canProceed) return;

    if (slide.type === "quiz" && !DEBUG_MODE) {
      const isCorrect = validateQuizAnswers();
      if (!isCorrect) return;
    }

    if (currentSlide < totalSlides - 1) {
      const nextIndex = currentSlide + 1;
      logSlideChange(nextIndex, "next");
      setCurrentSlide(nextIndex);
      setGroupQuizIndex(0);
      setGroupHadError(false);
      setCanProceed(DEBUG_MODE);
      setSelectedAnswers({});
      setQuizFeedback(null);
    } else {
      onExit();
    }
  };

  const goPrevious = () => {
    if (currentSlide > 0) {
      const prevIndex = currentSlide - 1;
      logSlideChange(prevIndex, "prev");
      setCurrentSlide(prevIndex);
      setGroupQuizIndex(0);
      setGroupHadError(false);
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

    const isCorrect =
      correctAnswers.length === userAnswers.length &&
      correctAnswers.every((id) => userAnswers.includes(id));

    const group = slide._group;
    const isLastInGroup = group
      ? groupQuizIndex === group.quizzes.length - 1
      : false;

    // ── Determine attempt number for this quiz ────────────────────────────────
    const attemptKey = group ? group.id : slide.id;
    const attemptNumber = (quizAttempts[attemptKey] || 0) + 1;

    // ── Log the answer ────────────────────────────────────────────────────────
    logTutorialQuizAnswer({
      quizId: slide.id,
      slideId: group ? group.id : slide.id,
      selectedIds: userAnswers,
      isCorrect,
      attemptNumber,
      gameVersion,
    });

    if (group) {
      if (isCorrect) {
        setQuizFeedback({
          type: "success",
          message: quiz.explanation || "Correct!",
        });
        setTimeout(() => {
          setQuizFeedback(null);
          setSelectedAnswers({});

          if (isLastInGroup) {
            setGroupQuizIndex(0);
            setGroupHadError(false);

            if (groupHadError) {
              const prevAttempts = groupAttempts[group.id] || 0;
              const newAttempts = prevAttempts + 1;
              setGroupAttempts((prev) => ({
                ...prev,
                [group.id]: newAttempts,
              }));

              if (newAttempts >= 2) {
                showOverlayThenRedirect("exit", () => setIsDisqualified(true));
              } else {
                showOverlayThenRedirect("incorrect", () => {
                  const returnIndex = getSlideIndexById(
                    TUTORIAL_SLIDES,
                    group.returnToSlide,
                  );
                  logSlideChange(returnIndex, "redirect-incorrect");
                  setCurrentSlide(returnIndex);
                });
              }
            } else {
              showOverlayThenRedirect("correct", () => {
                const nextIndex = currentSlide + 1;
                logSlideChange(nextIndex, "redirect-correct");
                setCurrentSlide(nextIndex);
              });
            }
          } else {
            setGroupQuizIndex((i) => i + 1);
          }
        });
      } else {
        setGroupHadError(true);
        setQuizFeedback({
          type: "error",
          message: "Not quite right. Let's keep going.",
        });
        setTimeout(() => {
          setQuizFeedback(null);
          setSelectedAnswers({});

          if (isLastInGroup) {
            setGroupQuizIndex(0);
            setGroupHadError(false);

            const prevAttempts = groupAttempts[group.id] || 0;
            const newAttempts = prevAttempts + 1;
            setGroupAttempts((prev) => ({ ...prev, [group.id]: newAttempts }));

            if (newAttempts >= 2) {
              showOverlayThenRedirect("exit", () => setIsDisqualified(true));
            } else {
              showOverlayThenRedirect("incorrect", () => {
                const returnIndex = getSlideIndexById(
                  TUTORIAL_SLIDES,
                  group.returnToSlide,
                );
                logSlideChange(returnIndex, "redirect-incorrect");
                setCurrentSlide(returnIndex);
              });
            }
          } else {
            setGroupQuizIndex((i) => i + 1);
          }
        });
      }

      return isCorrect;
    } else {
      // Non-group quiz
      if (isCorrect) {
        setQuizFeedback({
          type: "success",
          message: quiz.explanation || "Correct!",
        });
        setTimeout(() => {
          setQuizFeedback(null);
          setSelectedAnswers({});
          goNext();
        }, 1500);
        return true;
      } else {
        const currentAttempts = quizAttempts[slide.id] || 0;
        const newAttempts = currentAttempts + 1;
        setQuizAttempts((prev) => ({ ...prev, [slide.id]: newAttempts }));

        if (newAttempts >= 3) {
          setQuizFeedback({
            type: "error",
            message:
              "You have reached the maximum number of attempts. You will not be able to continue with the study.",
          });
          setTimeout(() => setIsDisqualified(true), 2500);
        } else {
          const attemptsRemaining = 3 - newAttempts;
          setQuizFeedback({
            type: "error",
            message: `Not quite right. Let's review that information again. (${attemptsRemaining} attempt${
              attemptsRemaining !== 1 ? "s" : ""
            } remaining)`,
          });
          setTimeout(() => {
            const returnIndex = getSlideIndexById(
              TUTORIAL_SLIDES,
              quiz.returnToSlide,
            );
            logSlideChange(returnIndex, "redirect-incorrect");
            setCurrentSlide(returnIndex);
            setSelectedAnswers({});
            setQuizFeedback(null);
          }, 2500);
        }
        return false;
      }
    }
  };

  const handleCheckboxChange = (optionId) => {
    if (slide.multiSelect) {
      setSelectedAnswers((prev) => ({ ...prev, [optionId]: !prev[optionId] }));
    } else {
      setSelectedAnswers({ [optionId]: true });
    }
    setQuizFeedback(null);
  };

  const handleKeyPress = (e) => {
    if (slide.type === "quiz") return;
    if (e.key === "ArrowRight" || e.key === "Enter") {
      if (canProceed) goNext();
    } else if (e.key === "ArrowLeft") {
      goPrevious();
    } else if (e.key === "Escape") {
      if (DEBUG_MODE) onExit();
    }
  };

  React.useEffect(() => {
    if (DEBUG_MODE || slide.type === "quiz") {
      setCanProceed(true);
      return;
    }
    setCanProceed(false);
    const timer = setTimeout(() => setCanProceed(true), 2000);
    return () => clearTimeout(timer);
  }, [currentSlide, slide.type]);

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, canProceed, slide.type]);

  // Log the initial slide (slide 0) when the tutorial first mounts
  React.useEffect(() => {
    logSlideChange(0, "initial");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      {showResultOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.85)",
          }}
        >
          <img
            src={
              showResultOverlay === "correct"
                ? "quiz-correct.png"
                : showResultOverlay === "incorrect"
                  ? "quiz-wrong.png"
                  : "exit-slide.png"
            }
            alt="Result"
            style={{
              maxHeight: "40vh",
              maxWidth: "50vw",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <div className="tutorial-container">
        {DEBUG_MODE && (
          <button
            className="tutorial-exit"
            onClick={() => onExit?.()}
            title="Exit Tutorial (ESC)"
          >
            <X size={24} />
          </button>
        )}

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
          {slide.title && <h1 className="tutorial-title">{slide.title}</h1>}

          {slide.image && (
            <div
              className="tutorial-image"
              style={
                !slide.title && !slide.content
                  ? {
                      maxHeight: "80vh",
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }
                  : {}
              }
            >
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
                <img
                  src={slide.image}
                  alt={slide.title || "Tutorial slide"}
                  style={
                    !slide.title && !slide.content
                      ? {
                          maxHeight: "80vh",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }
                      : {}
                  }
                />
              )}
            </div>
          )}

          {slide.content && (
            <div className="tutorial-text">
              {Array.isArray(slide.content)
                ? slide.content.map((line, i) => <p key={i}>{line}</p>)
                : slide.content
                    .split("\n")
                    .map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}

          {slide.type === "quiz" && slide.quiz && (
            <div className="quiz-section">
              {quizAttempts[slide.id] === 2 &&
                !quizFeedback &&
                !slide._group && (
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

              {slide._group && (
                <div
                  style={{
                    color: "#888",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  Question {groupQuizIndex + 1} of {slide._group.quizzes.length}
                </div>
              )}

              <div className="quiz-options">
                {slide.quiz.options.map((option) => (
                  <label key={option.id} className="quiz-option">
                    <input
                      type="checkbox"
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
