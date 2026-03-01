const TopicTheoryCard = ({ topic, onClick }) => {
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
        <h3 className="topic-title">
          {topic.title}
        </h3>
  
        <p className="muted topic-description">
          {topic.theoryDescription}
        </p>
  
        {topic.theoryCompleted && (
          <span className="completed-badge">
            ✔ Completed
          </span>
        )}
      </div>
    );
  };
  
  export default TopicTheoryCard;