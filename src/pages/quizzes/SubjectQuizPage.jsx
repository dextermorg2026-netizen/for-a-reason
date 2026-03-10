import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserQuizAttempt } from "../../services/quizAttemptService";

const levels = [
  {
    id: "easy",
    title: "Easy",
    description: "Basic questions to test your fundamentals.",
  },
  {
    id: "medium",
    title: "Medium",
    description: "Moderate difficulty questions.",
  },
  {
    id: "hard",
    title: "Hard",
    description: "Advanced challenge questions.",
  },
];

const SubjectQuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= LOAD USER ATTEMPTS ================= */

  useEffect(() => {
    const loadAttempts = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.all(
          levels.map((level) =>
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
        console.error("Failed loading quiz attempts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, [currentUser, subjectId]);

  /* ================= HANDLE REVIEW ================= */

  const handleReview = async (levelId) => {
    if (!currentUser) return;

    try {
      const freshAttempt = await getUserQuizAttempt(
        currentUser.uid,
        subjectId,
        levelId
      );

      if (!freshAttempt) return;

      navigate("/quiz/result", {
        state: {
          score: freshAttempt?.score ?? 0,
          total: freshAttempt?.questions?.length ?? 0,
          coinsEarned: freshAttempt?.coinsEarned ?? 0,
          questions: freshAttempt?.questions ?? [],
          answers: freshAttempt?.answers ?? {},
        },
      });
    } catch (err) {
      console.error("Failed loading review:", err);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Choose Difficulty</h1>
        <p className="muted">Loading quizzes...</p>
      </div>
    );
  }

  /* ================= PAGE ================= */

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
        {levels.map((level) => {
          const attempt = attempts[level.id];
          const completed = Boolean(attempt);

          return (
            <div key={level.id} className="glass-card">
              <h3>{level.title}</h3>

              <p className="muted">{level.description}</p>

              {/* COMPLETED BADGE */}
              {completed && (
                <div
                  style={{
                    marginTop: "10px",
                    color: "#22c55e",
                    fontWeight: 600,
                  }}
                >
                  ✅ Completed
                </div>
              )}

              {/* SCORE */}
              {completed && (
                <p style={{ marginTop: "5px" }}>
                  Score: {attempt?.score ?? 0} /{" "}
                  {attempt?.questions?.length ?? 25}
                </p>
              )}

              {/* BUTTON */}
              <button
                className="btn-primary"
                style={{ marginTop: "15px" }}
                onClick={() => {
                  if (!completed) {
                    navigate(`/quiz/${subjectId}/${level.id}`);
                  } else {
                    handleReview(level.id);
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