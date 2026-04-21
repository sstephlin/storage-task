import React, { useState, useEffect, useRef } from "react";
import "../styles/PrelimQuestions.css";

/**
 * PlatformQuestion
 * Shown before instructions/training begins.
 * Asks the participant what platform they used to access the task.
 *
 * Props:
 *   onComplete(answer: string) — called when participant submits
 */
const PrelimQuestion = ({ onComplete }) => {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Small delay so the mount animation finishes before focus
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    if (!answer.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
      return;
    }
    setSubmitted(true);
    setTimeout(() => onComplete(answer.trim()), 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const cardClass = ["pq-card", submitted ? "pq-card--submitted" : ""]
    .filter(Boolean)
    .join(" ");

  const inputWrapClass = ["pq-input-wrap", shake ? "pq-input-wrap--shake" : ""]
    .filter(Boolean)
    .join(" ");

  const btnClass = [
    "pq-btn",
    answer.trim() ? "pq-btn--active" : "pq-btn--disabled",
  ].join(" ");

  return (
    <div className="pq-overlay">
      <div className={cardClass}>
        {/* Step indicator */}
        <div className="pq-steps">
          <span className="pq-step pq-step--active" />
        </div>

        {/* Icon */}
        <div className="pq-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect
              x="2"
              y="5"
              width="28"
              height="18"
              rx="3"
              stroke="#374151"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M10 23 L8 27 M22 23 L24 27 M8 27 H24"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="6" y="9" width="8" height="6" rx="1" fill="#e5e7eb" />
            <rect x="18" y="9" width="6" height="2" rx="0.5" fill="#e5e7eb" />
            <rect x="18" y="13" width="4" height="2" rx="0.5" fill="#e5e7eb" />
          </svg>
        </div>

        <p className="pq-eyebrow">Before you begin</p>
        <h1 className="pq-heading">Quick question</h1>
        <p className="pq-body">
          What platform did you use to access this task?
        </p>

        <div className={inputWrapClass}>
          <textarea
            ref={inputRef}
            className="pq-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your answer here"
            rows={3}
          />
          <p className="pq-hint">Press Enter or click Continue to proceed.</p>
        </div>

        <button className={btnClass} onClick={handleSubmit}>
          Continue
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PrelimQuestion;
