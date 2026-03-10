import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserQuizAttempt } from "../../services/quizAttemptService";

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

const SubjectQuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadAttempts = async () => {
      try {
        const results = await Promise.all(
          levels.map(level =>
            getUserQuizAttempt(currentUser.uid, subjectId, level.id)
          )
        );

        const formatted = {};

        results.forEach((attempt, index) => {
          if (attempt) {
            formatted[levels[index].id] = attempt;
          }
        });

        setAttempts(formatted);
      } catch (err) {
        console.error("Failed loading attempts:", err);
      }

      setLoading(false);
    };

    loadAttempts();
  }, [currentUser, subjectId]);

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Choose Difficulty</h1>
        <p className="muted">Loading quizzes...</p>
      </div>
    );
  }

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
        {levels.map(level => {
          const attempt = attempts[level.id];
          const completed = Boolean(attempt);

          return (
            <div key={level.id} className="glass-card">
              <h3>{level.title}</h3>

              <p className="muted">{level.description}</p>

              {completed && (
                <div
                  style={{
                    marginTop: "10px",
                    color: "#22c55e",
                    fontWeight: 600
                  }}
                >
                  ✅ Completed
                </div>
              )}

              {completed && (
                <p style={{ marginTop: "5px" }}>
                  Score: {attempt.score} / {attempt.questions?.length || 25}
                </p>
              )}

              <button
                className="btn-primary"
                style={{ marginTop: "15px" }}
                onClick={() => {
                  if (completed) {
                    navigate("/quiz/result", {
                      state: {
                        score: attempt.score,
                        total: attempt.questions?.length || 25,
                        coinsEarned: attempt.coinsEarned,
                        questions: attempt.questions,
                        answers: attempt.answers,
                      },
                    });
                  } else {
                    navigate(`/quiz/${subjectId}/${level.id}`);
                  }
                }}
              >
                {completed ? "Review Answers" : "Start Quiz"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectQuizPage;