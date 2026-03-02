const ContinueLearningCard = ({ subject, onResume }) => {
    const progressLabel =
      subject.progress >= 100
        ? "Completed"
        : `${subject.progress}% complete`;
  
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
          {subject.title}
        </p>
  
        <div className="progress-bar continue-progress">
          <div
            className="progress-fill"
            style={{ width: `${subject.progress}%` }}
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