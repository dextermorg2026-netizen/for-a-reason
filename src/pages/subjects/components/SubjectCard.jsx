const SubjectCard = ({ subject, onClick }) => {
    const difficultyClass = subject.difficulty.toLowerCase();
  
    const isCompleted = subject.progress >= 100;
    const isInProgress = subject.progress > 0 && subject.progress < 100;
  
    const actionLabel = isInProgress
      ? "Continue"
      : isCompleted
      ? "Review"
      : "Start";
  
    const statusLabel = isCompleted
      ? "Completed"
      : isInProgress
      ? "In Progress"
      : "Not Started";
  
    const progressLabel = isCompleted
      ? "Fully completed"
      : isInProgress
      ? `${subject.progress}% complete`
      : "Ready to begin";
  
    return (
      <div
        className={`glass-card subject-card ${
          isCompleted ? "subject-completed" : ""
        }`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={0}
        role="button"
      >
        {/* Top Accent */}
        <div
          className={`subject-accent ${
            isCompleted
              ? "accent-complete"
              : isInProgress
              ? "accent-progress"
              : "accent-default"
          }`}
        />
  
        <div className="subject-content">
          {/* Header */}
          <div className="subject-header">
            <h3 className="subject-title">
              {subject.title}
            </h3>
  
            <span
              className={`difficulty-tag ${difficultyClass}`}
            >
              {subject.difficulty}
            </span>
          </div>
  
          {/* Description */}
          <p className="muted subject-description">
            {subject.description}
          </p>
  
          {/* Progress */}
          <div className="subject-progress-row">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${subject.progress}%`,
                }}
              />
            </div>
  
            <span className="progress-percent">
              {progressLabel}
            </span>
          </div>
  
          {/* Footer */}
          <div className="subject-footer">
            <span
              className={`status-badge ${
                isCompleted
                  ? "status-complete"
                  : isInProgress
                  ? "status-progress"
                  : "status-default"
              }`}
            >
              {statusLabel}
            </span>
  
            <span className="subject-action">
              {actionLabel} →
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  export default SubjectCard;