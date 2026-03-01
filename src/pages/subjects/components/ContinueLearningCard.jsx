const ContinueLearningCard = ({ subject, onResume }) => {
    return (
      <div className="glass-card continue-card">
        <h3>Continue Where You Left Off</h3>
        <p>{subject.title}</p>
  
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${subject.progress}%` }}
          />
        </div>
  
        <button
          className="btn-primary"
          onClick={onResume}
        >
          Resume
        </button>
      </div>
    );
  };
  
  export default ContinueLearningCard;