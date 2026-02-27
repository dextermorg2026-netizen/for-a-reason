import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Topics = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  // 🔹 Dummy Data (Replace later with backend)
  const [topics] = useState([
    {
      id: "arrays",
      title: "Arrays",
      theoryDescription: "Introduction to arrays, operations & problems",
      difficulty: "Easy",
      theoryCompleted: true,
    },
    {
      id: "linked-list",
      title: "Linked List",
      theoryDescription: "Singly & doubly linked list concepts",
      difficulty: "Medium",
      theoryCompleted: false,
    },
    {
      id: "trees",
      title: "Trees",
      theoryDescription: "Binary trees, BST & traversals",
      difficulty: "Hard",
      theoryCompleted: false,
    },
  ]);

  return (
    <div>
      <h1 className="page-title">Subject Structure</h1>
      <p className="page-subtitle">
        Learn theory or jump straight into practice
      </p>

      {/* ================= THEORY SECTION ================= */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>
          📘 Theory Section
        </h2>

        {topics.map((topic) => (
          <div
            key={topic.id}
            className="glass-card"
            style={{ marginBottom: "20px", cursor: "pointer" }}
            onClick={() =>
              navigate(`/resources?topic=${topic.id}`)
            }
          >
            <h3>{topic.title}</h3>

            <p className="muted">
              {topic.theoryDescription}
            </p>

            {topic.theoryCompleted && (
              <span
                style={{
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                ✔ Completed
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ================= QUIZ SECTION ================= */}
      <div style={{ marginTop: "60px" }}>
        <h2 style={{ marginBottom: "20px" }}>
          🧠 Practice Quiz
        </h2>

        {topics.map((topic) => (
          <div
            key={topic.id}
            className="glass-card"
            style={{ marginBottom: "20px", cursor: "pointer" }}
            onClick={() =>
              navigate(`/quiz/${topic.id}`)
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>{topic.title} Quiz</h3>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  background:
                    topic.difficulty === "Hard"
                      ? "#ef4444"
                      : topic.difficulty === "Medium"
                      ? "#f59e0b"
                      : "#10b981",
                  color: "white",
                }}
              >
                {topic.difficulty}
              </span>
            </div>

            <p className="muted" style={{ marginTop: "6px" }}>
              Attempt topic-based questions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Topics;