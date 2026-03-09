import { useNavigate, useParams } from "react-router-dom";

const SubjectQuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const levels = [
    {
      id: "easy",
      title: "Easy",
      description: "Basic questions to test your fundamentals."
    },
    {
      id: "medium",
      title: "Medium",
      description: "Moderate difficulty questions."
    },
    {
      id: "hard",
      title: "Hard",
      description: "Advanced challenge questions."
    }
  ];

  return (
    <div>
      <h1 className="page-title">Choose Difficulty</h1>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gap: "20px",
        }}
      >
        {levels.map((level) => (
          <div key={level.id} className="glass-card">
            <h3>{level.title}</h3>

            <p className="muted">
              {level.description}
            </p>

            <button
              className="btn-primary"
              style={{ marginTop: "15px" }}
              onClick={() =>
                navigate(`/quiz/${subjectId}/${level.id}`)
              }
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectQuizPage;