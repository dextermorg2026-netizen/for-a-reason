const SubjectCard = ({ subject, onClick }) => {
    const difficultyClass =
      subject.difficulty.toLowerCase();
  
    return (
      <div
        className="glass-card subject-card"
        onClick={onClick}
      >
        <h3>{subject.title}</h3>
        <p className="muted">
          {subject.description}
        </p>
  
        <span
          className={`difficulty-tag ${difficultyClass}`}
        >
          {subject.difficulty}
        </span>
  
        {subject.completed && (
          <span className="completed-badge">
            ✔ Completed
          </span>
        )}
  
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${subject.progress}%` }}
          />
        </div>
      </div>
    );
  };
  
  export default SubjectCard;