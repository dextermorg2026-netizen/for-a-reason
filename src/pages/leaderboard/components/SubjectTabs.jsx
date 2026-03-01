const SubjectTabs = ({
    subjects,
    selectedSubject,
    setSelectedSubject,
    loadingSubjects,
  }) => {
    return (
      <div className="subject-tabs">
        {loadingSubjects ? (
          <div className="glass-card subject-status-card">
            Loading subjects…
          </div>
        ) : subjects.length === 0 ? (
          <div className="glass-card subject-status-card">
            No subjects available.
          </div>
        ) : (
          subjects.map((subject) => {
            const isActive = selectedSubject === subject.id;
  
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`subject-button ${
                  isActive ? "active" : ""
                }`}
              >
                {subject.name}
              </button>
            );
          })
        )}
      </div>
    );
  };
  
  export default SubjectTabs;