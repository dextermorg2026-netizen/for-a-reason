const SubjectCard = ({ subject, onClick }) => {
    const difficultyClass =
      subject.difficulty.toLowerCase();
  
    const actionLabel =
      subject.progress > 0 && subject.progress < 100
        ? "Continue"
        : subject.completed
        ? "Review"
        : "Start";
  
    return (
      <div
        className="glass-card subject-card"
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
        {/* Top Accent Bar */}
        <div className="subject-accent" />
  
        <div className="subject-content">
  
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
  
          <p className="muted subject-description">
            {subject.description}
          </p>
  
          <div className="subject-progress-row">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${subject.progress}%` }}
              />
            </div>
  
            <span className="progress-percent">
              {subject.progress}%
            </span>
          </div>
  
          <div className="subject-footer">
            {subject.completed && (
              <span className="completed-badge">
                ✔ Completed
              </span>
            )}
  
            <span className="subject-action">
              {actionLabel} →
            </span>
          </div>
  
        </div>
      </div>
    );
  };
  
  export default SubjectCard;