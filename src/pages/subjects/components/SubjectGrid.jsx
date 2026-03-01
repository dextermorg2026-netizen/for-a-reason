import SubjectCard from "./SubjectCard";

const SubjectGrid = ({ subjects, onSelect }) => {
  return (
    <div className="grid-3 subject-grid">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          onClick={() => onSelect(subject.id)}
        />
      ))}
    </div>
  );
};

export default SubjectGrid;