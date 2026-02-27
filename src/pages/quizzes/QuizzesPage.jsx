import { useNavigate } from "react-router-dom";

const QuizzesPage = () => {
  const navigate = useNavigate();

  const subjects = [
    { id: "dsa", name: "Data Structures" },
    { id: "algorithms", name: "Algorithms" },
    { id: "dp", name: "Dynamic Programming" },
  ];

  return (
    <div>
      <h1 className="page-title">Quizzes</h1>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gap: "20px",
        }}
      >
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="glass-card"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/quizzes/${subject.id}`)
            }
          >
            <h3>{subject.name}</h3>
            <p className="muted">
              Attempt quizzes for this subject
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesPage;