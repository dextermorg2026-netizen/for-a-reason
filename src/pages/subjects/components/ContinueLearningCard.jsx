const ContinueLearningCard = ({ subject, onResume }) => {
  const progress = subject?.progress ?? 0;

  const progressLabel =
    progress >= 100
      ? "Completed"
      : `${progress}% complete`;

  return (
    <div className="glass-card continue-card">

      <div className="continue-header">
        <h3 className="continue-title">
          Continue Learning
        </h3>

        <span className="continue-progress-label">
          {progressLabel}
        </span>
      </div>

      <p className="continue-subject">
        {subject?.title || "Untitled Subject"}
      </p>

      <div className="progress-bar continue-progress">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="continue-footer">

        <span className="continue-meta">
          Pick up where you left off
        </span>

        <button
          className="btn-primary continue-btn"
          onClick={onResume}
        >
          Resume →
        </button>

      </div>

    </div>
  );
};

export default ContinueLearningCard;