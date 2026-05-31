import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./styles/instructions.css";
import { getTutorialSlides, getSlideIndexById } from "./tutorialSlides";
import { logTutorialSlideChange, logTutorialQuizAnswer } from "./logging";

// Set to false for production, true for debugging (disables timer and quiz validation)
const DEBUG_MODE = true;

// ─── Timing constants ────────────────────────────────────────────────────────
const SLIDE_IDLE_LIMIT_MS = 3 * 60 * 1000; // 3 min per slide
const SLIDE_WARNING_GRACE_MS = 30 * 1000; // 30-sec grace after warning
const TOTAL_TIME_LIMIT_MS = 27 * 60 * 1000; // 27 min overall

// ─── Warning modal ────────────────────────────────────────────────────────────
const WarningModal = ({ secondsLeft, onDismiss }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.75)",
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "40px 48px",
        maxWidth: "480px",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <h2 style={{ color: "#c0392b", marginBottom: "12px", fontSize: "22px" }}>
        Are you still there?
      </h2>
      <p
        style={{
          color: "#444",
          fontSize: "16px",
          lineHeight: "1.6",
          marginBottom: "8px",
        }}
      >
        You've been on this slide for a while. You must continue within:
      </p>
      <p
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#c0392b",
          margin: "12px 0",
        }}
      >
        {secondsLeft}s
      </p>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
        If time runs out you will be removed from the study.
      </p>
      <button
        onClick={onDismiss}
        style={{
          background: "#2ecc71",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "12px 32px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        I'm here — continue
      </button>
    </div>
  </div>
);

// ─── Total-time-expired modal ─────────────────────────────────────────────────
const TimeExpiredModal = ({ secondsLeft }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.85)",
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "40px 48px",
        maxWidth: "480px",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⌛</div>
      <h2 style={{ color: "#c0392b", marginBottom: "12px", fontSize: "22px" }}>
        Time Limit Reached
      </h2>
      <p
        style={{
          color: "#444",
          fontSize: "16px",
          lineHeight: "1.6",
          marginBottom: "8px",
        }}
      >
        The instructions phase has a 27-minute time limit, which has been
        reached. You will not be able to continue with this study.
      </p>
      <p style={{ color: "#888", fontSize: "14px", marginTop: "20px" }}>
        Redirecting in <strong>{secondsLeft}</strong> second
        {secondsLeft !== 1 ? "s" : ""}…
      </p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const Tutorial = ({ onExit, gameVersion, userId, onDisqualified }) => {
  const TUTORIAL_SLIDES = React.useMemo(() => {
    return getTutorialSlides(gameVersion);
  }, [gameVersion]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [canProceed, setCanProceed] = useState(DEBUG_MODE);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState(null);
  const [groupAttempts, setGroupAttempts] = useState({});
  const [showResultOverlay, setShowResultOverlay] = useState(null);
  const [groupQuizIndex, setGroupQuizIndex] = useState(0);
  const [groupHadError, setGroupHadError] = useState(false);
  const [disqualifyCountdown, setDisqualifyCountdown] = useState(5);
  const [isFading, setIsFading] = useState(false);

  // ── Timer state ──
  const [showSlideWarning, setShowSlideWarning] = useState(false);
  const [slideWarningSecondsLeft, setSlideWarningSecondsLeft] = useState(30);
  const [showTimeExpired, setShowTimeExpired] = useState(false);
  const [timeExpiredCountdown, setTimeExpiredCountdown] = useState(5);

  const slideIdleTimerRef = useRef(null);
  const slideGraceTimerRef = useRef(null);
  const slideGraceTickRef = useRef(null);
  const totalTimeTimerRef = useRef(null);
  const totalTimeTickRef = useRef(null);
  const isDisqualifiedRef = useRef(false); // sync ref so timers don't fire after disqualify

  const totalSlides = TUTORIAL_SLIDES.length;
  const imageCache = useRef({});

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const clearSlideTimers = () => {
    clearTimeout(slideIdleTimerRef.current);
    clearTimeout(slideGraceTimerRef.current);
    clearInterval(slideGraceTickRef.current);
    slideIdleTimerRef.current = null;
    slideGraceTimerRef.current = null;
    slideGraceTickRef.current = null;
  };

  const triggerDisqualify = React.useCallback((reason = "quiz_attempts") => {
    if (isDisqualifiedRef.current) return;
    isDisqualifiedRef.current = true;
    clearSlideTimers();
    clearTimeout(totalTimeTimerRef.current);
    clearInterval(totalTimeTickRef.current);
    setDisqualifyReason(reason);
    setIsDisqualified(true);
  }, []);

  // Start (or restart) the per-slide idle timer.
  const startSlideTimer = React.useCallback(() => {
    if (isDisqualifiedRef.current || DEBUG_MODE) return;
    clearSlideTimers();
    setShowSlideWarning(false);

    slideIdleTimerRef.current = setTimeout(() => {
      if (isDisqualifiedRef.current) return;

      // Show warning modal and start 30-sec grace countdown
      setSlideWarningSecondsLeft(30);
      setShowSlideWarning(true);

      let remaining = 30;
      slideGraceTickRef.current = setInterval(() => {
        remaining -= 1;
        setSlideWarningSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(slideGraceTickRef.current);
        }
      }, 1000);

      slideGraceTimerRef.current = setTimeout(() => {
        // Grace period expired — disqualify
        setShowSlideWarning(false);
        triggerDisqualify("idle_timeout");
      }, SLIDE_WARNING_GRACE_MS);
    }, SLIDE_IDLE_LIMIT_MS);
  }, [triggerDisqualify]);

  // Dismiss the slide warning (user clicked "I'm here")
  const handleDismissSlideWarning = () => {
    clearSlideTimers();
    setShowSlideWarning(false);
    startSlideTimer(); // fresh 3-min timer from now
  };

  // ── Overall 27-min timer (mount / unmount only) ───────────────────────────
  React.useEffect(() => {
    if (DEBUG_MODE) return;

    let secondsLeft = 5;

    totalTimeTimerRef.current = setTimeout(() => {
      if (isDisqualifiedRef.current) return;
      clearSlideTimers();
      setShowTimeExpired(true);

      totalTimeTickRef.current = setInterval(() => {
        secondsLeft -= 1;
        setTimeExpiredCountdown(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(totalTimeTickRef.current);
          triggerDisqualify("total_timeout");
        }
      }, 1000);
    }, TOTAL_TIME_LIMIT_MS);

    return () => {
      clearTimeout(totalTimeTimerRef.current);
      clearInterval(totalTimeTickRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Per-slide timer: restart whenever currentSlide changes ───────────────
  React.useEffect(() => {
    startSlideTimer();
    return () => clearSlideTimers();
  }, [currentSlide]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Slide helpers ─────────────────────────────────────────────────────────

  const changeSlideTo = (newIndex) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setGroupQuizIndex(0);
      setGroupHadError(false);
      setCanProceed(DEBUG_MODE);
      setSelectedAnswers({});
      setQuizFeedback(null);
      setTimeout(() => setIsFading(false), 50);
    }, 750);
  };

  const slide = React.useMemo(() => {
    const s = TUTORIAL_SLIDES[currentSlide];
    if (s?.type === "quizGroup") {
      return { ...s.quizzes[groupQuizIndex], _group: s };
    }
    return s;
  }, [TUTORIAL_SLIDES, currentSlide, groupQuizIndex]);

  const logSlideChange = (newSlideIndex, direction) => {
    const targetSlide = TUTORIAL_SLIDES[newSlideIndex];
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
    const delay = type === "incorrect" ? 4000 : 2000;
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
      logSlideChange(currentSlide + 1, "next");
      changeSlideTo(currentSlide + 1);
    } else {
      onExit();
    }
  };

  const goPrevious = () => {
    if (currentSlide > 0) {
      logSlideChange(currentSlide - 1, "prev");
      changeSlideTo(currentSlide - 1);
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

    const attemptKey = group ? group.id : slide.id;
    const attemptNumber = (quizAttempts[attemptKey] || 0) + 1;

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
                showOverlayThenRedirect("exit", () =>
                  triggerDisqualify("quiz_group_attempts"),
                );
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
              showOverlayThenRedirect("exit", () =>
                triggerDisqualify("quiz_group_attempts"),
              );
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
          setTimeout(() => triggerDisqualify("quiz_attempts"), 2500);
        } else {
          const attemptsRemaining = 3 - newAttempts;
          setQuizFeedback({
            type: "error",
            message: `Not quite right. Let's review that information again. (${attemptsRemaining} attempt${attemptsRemaining !== 1 ? "s" : ""} remaining)`,
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

  React.useEffect(() => {
    if (!isDisqualified) return;
    const interval = setInterval(() => {
      setDisqualifyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onDisqualified) onDisqualified();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDisqualified, onDisqualified]);

  React.useEffect(() => {
    const allGifs = TUTORIAL_SLIDES.filter((slide) =>
      slide.image?.endsWith(".gif"),
    ).map((slide) => slide.image);
    allGifs.forEach((src) => {
      if (!imageCache.current[src]) {
        const img = new Image();
        img.src = src;
        imageCache.current[src] = img;
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    logSlideChange(0, "initial");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Disqualified screen ───────────────────────────────────────────────────
  const DISQUALIFY_MESSAGES = {
    quiz_attempts: {
      heading: "Maximum Attempts Reached",
      body: "You have used all of your allowed attempts on a comprehension question and will not be able to continue with this study.",
    },
    quiz_group_attempts: {
      heading: "Maximum Attempts Reached",
      body: "You have used all of your allowed attempts on the comprehension questions and will not be able to continue with this study.",
    },
    idle_timeout: {
      heading: "Session Timed Out",
      body: "You were inactive on a slide for too long. Participants must progress through the instructions within the allowed time limits.",
    },
    total_timeout: {
      heading: "Time Limit Reached",
      body: "The instructions phase has a 27-minute time limit, which has been reached. You will not be able to continue with this study.",
    },
  };

  if (isDisqualified) {
    const hasRedirect = !!onDisqualified;
    const msg =
      DISQUALIFY_MESSAGES[disqualifyReason] ??
      DISQUALIFY_MESSAGES.quiz_attempts;
    return (
      <div className="tutorial-overlay">
        <div className="tutorial-container">
          <div
            className={`tutorial-content ${isFading ? "fading" : ""}`}
            style={{ textAlign: "center", padding: "40px" }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
            <h1
              className="tutorial-title"
              style={{ color: "#e74c3c", marginBottom: "20px" }}
            >
              {msg.heading}
            </h1>
            <div
              className="tutorial-text"
              style={{ fontSize: "18px", lineHeight: "1.6" }}
            >
              <p>{msg.body}</p>
              <p>You will not be able to continue with this study.</p>
              {hasRedirect ? (
                <p style={{ marginTop: "30px", color: "#666" }}>
                  Redirecting in <strong>{disqualifyCountdown}</strong> second
                  {disqualifyCountdown !== 1 ? "s" : ""}…
                </p>
              ) : (
                <p style={{ marginTop: "30px", color: "#666" }}>
                  Please close this window and contact the researcher if you
                  have any questions.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="tutorial-overlay">
      {/* Per-slide idle warning */}
      {showSlideWarning && (
        <WarningModal
          secondsLeft={slideWarningSecondsLeft}
          onDismiss={handleDismissSlideWarning}
        />
      )}

      {/* Overall time-expired modal */}
      {showTimeExpired && (
        <TimeExpiredModal secondsLeft={timeExpiredCountdown} />
      )}

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
                className={`progress-dot ${index === currentSlide ? "active" : ""} ${index < currentSlide ? "completed" : ""}`}
              />
            ))}
          </div>
          <div className="progress-text">
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>

        <div className={`tutorial-content ${isFading ? "fading" : ""}`}>
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
              {quizAttempts[slide.id] === 3 &&
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

              {slide.multiSelect && (
                <div
                  style={{
                    color: "#c0392b",
                    fontWeight: "700",
                    fontSize: "18px",
                    marginBottom: "10px",
                  }}
                >
                  ★ Select all that apply
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
      </div>
    </div>
  );
};

export default Tutorial;
