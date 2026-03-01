const TopicQuizCard = ({ topic, onClick }) => {
    const difficultyClass =
      topic.difficulty.toLowerCase();
  
    return (
      <div
        className="glass-card topic-card"
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
        <div className="topic-quiz-header">
          <h3 className="topic-title">
            {topic.title} Quiz
          </h3>
  
          <span
            className={`difficulty-tag ${difficultyClass}`}
          >
            {topic.difficulty}
          </span>
        </div>
  
        <p className="muted topic-quiz-desc">
          Attempt topic-based questions
        </p>
      </div>
    );
  };
  
  export default TopicQuizCard;