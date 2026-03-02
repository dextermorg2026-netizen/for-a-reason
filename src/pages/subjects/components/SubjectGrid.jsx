import SubjectCard from "./SubjectCard";

const SubjectGrid = ({ subjects, onSelect }) => {
  if (!subjects.length) {
    return (
      <div className="empty-state subjects-empty">
        <div className="empty-icon">📚</div>
        <p className="empty-state-title">
          No subjects available yet
        </p>
        <p className="empty-state-subtitle">
          New learning paths will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-3 subject-grid">
      {subjects.map((subject, index) => (
        <div
          key={subject.id}
          className="subject-grid-item"
          style={{
            animationDelay: `${index * 60}ms`,
          }}
        >
          <SubjectCard
            subject={subject}
            onClick={() => onSelect(subject.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default SubjectGrid;