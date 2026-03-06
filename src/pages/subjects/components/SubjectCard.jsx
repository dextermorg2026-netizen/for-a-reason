const SubjectCard = ({ subject, onClick }) => {

  const progress = subject?.progress ?? 0;

  const isCompleted = progress >= 100;
  const isInProgress = progress > 0 && progress < 100;

  const actionLabel = isInProgress
    ? "Continue"
    : isCompleted
    ? "Review"
    : "Start";

  const statusLabel = isCompleted
    ? "Completed"
    : isInProgress
    ? `${progress}% complete`
    : "Ready to begin";

  return (
    <div
      className="glass-card subject-card"
      onClick={onClick}
      tabIndex={0}
      role="button"
    >

      {/* Top Accent */}
      <div className="subject-accent" />

      <div className="subject-content">

        {/* Title */}
        <h3 className="subject-title">
          {subject?.title || "Untitled Subject"}
        </h3>

        {/* Status */}
        <p className="subject-status">
          {statusLabel}
        </p>

        {/* Action */}
        <div className="subject-footer">
          <span className="subject-action">
            {actionLabel} →
          </span>
        </div>

      </div>

    </div>
  );
};

export default SubjectCard;