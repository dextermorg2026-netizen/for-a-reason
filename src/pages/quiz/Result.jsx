import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    score = 0,
    total = 0,
    coinsEarned = 0,
    questions = [],
    answers = {},
  } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      navigate("/subjects", { replace: true });
    }
  }, [location.state, navigate]);

  if (!location.state) {
    // let the redirect above run
    return null;
  }

  if (!questions.length) {
    return (
      <div>
        <h1 className="page-title">Quiz Completed 🎉</h1>

        <div className="page-card" style={{ marginTop: "2rem" }}>
          <h2>Score: {score} / {total}</h2>

          <h3 style={{ marginTop: "10px" }}>
            🪙 Coins earned: {coinsEarned}
          </h3>

          <p style={{ marginTop: "16px" }}>
            We don’t have detailed question data saved for this attempt,
            so a question-by-question review isn’t available.
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: "30px" }}
          onClick={() => navigate("/quizzes")}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Quiz Completed 🎉</h1>

      {/* ================= RESULT SUMMARY ================= */}

      <div className="page-card" style={{ marginTop: "2rem" }}>
        <h2>Score: {score} / {total}</h2>

        <h3 style={{ marginTop: "10px" }}>
          🪙 Coins earned: {coinsEarned}
        </h3>

        <p style={{ marginTop: "10px", fontSize: "14px" }}>
          🟢 Correct Answer &nbsp;&nbsp; 🔴 Your Wrong Answer
        </p>
      </div>

      {/* ================= ANSWER REVIEW ================= */}

      <div style={{ marginTop: "30px" }}>
        {questions.map((q, questionIndex) => {
          const userAnswer = answers[q.id];

          return (
            <div
              key={q.id}
              className="page-card"
              style={{ marginBottom: "20px" }}
            >
              {/* Question */}
              <h3>
                {questionIndex + 1}. {q.question}
              </h3>

              {/* Options */}
              <div style={{ marginTop: "12px" }}>
                {q.options.map((option, index) => {
                  let background = "white";
                  let textColor = "black";

                  // correct answer
                  if (index === q.correctAnswer) {
                    background = "#22c55e";
                    textColor = "white";
                  }

                  // wrong answer chosen
                  if (
                    index === userAnswer &&
                    userAnswer !== q.correctAnswer
                  ) {
                    background = "#ef4444";
                    textColor = "white";
                  }

                  return (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "6px",
                        background: background,
                        color: textColor,
                        border: "1px solid #ddd",
                      }}
                    >
                      {option}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <p
                  style={{
                    marginTop: "12px",
                    fontStyle: "italic",
                    color: "#555",
                  }}
                >
                  Explanation: {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= BUTTON ================= */}

      <button
        className="btn-primary"
        style={{ marginTop: "30px" }}
        onClick={() => navigate("/subjects")}
      >
        Back to Subjects
      </button>
    </div>
  );
};

export default Result;