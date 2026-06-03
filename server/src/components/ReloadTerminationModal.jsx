import React from "react";

const ReloadTerminationModal = ({ countdown, hasRedirect }) => (
  <div className="reload-overlay">
    <div className="reload-card">
      <h2 className="reload-title">Experiment Terminated</h2>
      <p className="reload-text">
        This page was reloaded, which is not allowed during the experiment. Your
        session has been terminated. You will be redirected shortly.
      </p>
      {hasRedirect ? (
        <p className="reload-countdown">
          Redirecting in <strong>{countdown}</strong> second
          {countdown !== 1 ? "s" : ""}...
        </p>
      ) : (
        <p className="reload-fallback">
          Please close this window and contact the researcher.
        </p>
      )}
    </div>
  </div>
);

export default ReloadTerminationModal;
