import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Subjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const subjects = [
    {
      id: 1,
      title: "Data Structures",
      difficulty: "Medium",
      progress: 70,
      completed: false,
      locked: false,
      description: "Arrays, Linked List, Stack, Queue",
    },
    {
      id: 2,
      title: "Algorithms",
      difficulty: "Hard",
      progress: 40,
      completed: false,
      locked: false,
      description: "Sorting, Searching, Recursion",
    },
    {
      id: 3,
      title: "Dynamic Programming",
      difficulty: "Hard",
      progress: 0,
      completed: false,
      locked: true,
      description: "Memoization & Tabulation",
    },
    {
      id: 4,
      title: "Graph Theory",
      difficulty: "Medium",
      progress: 100,
      completed: true,
      locked: false,
      description: "BFS, DFS, Shortest Path",
    },
  ];

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || subject.difficulty === filter;

    return matchesSearch && matchesFilter;
  });

  const continueSubject = subjects.find(
    (s) => s.progress > 0 && s.progress < 100
  );

  return (
    <div>
      <h1 className="page-title">Learning Roadmap</h1>
      <p className="page-subtitle">
        Structured progression to mastery
      </p>

      {/* ===== Continue Learning Section ===== */}
      {continueSubject && (
        <div className="glass-card" style={{ marginTop: "30px" }}>
          <h3>Continue Where You Left Off</h3>
          <p>{continueSubject.title}</p>

          <div
            style={{
              height: "6px",
              background: "#e5e7eb",
              borderRadius: "6px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                height: "6px",
                width: `${continueSubject.progress}%`,
                background:
                  "linear-gradient(90deg,#6366f1,#4f46e5)",
                borderRadius: "6px",
              }}
            />
          </div>

          <button
            className="btn-primary"
            style={{ marginTop: "15px" }}
            onClick={() =>
              navigate(`/subjects/${continueSubject.id}/topics`)
            }
          >
            Resume
          </button>
        </div>
      )}

      {/* ===== Search + Filter ===== */}
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "12px",
            border: "none",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            background: "rgba(255,255,255,0.06)",
            color: "white",
          }}
        >
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      {/* ===== Subject Grid ===== */}
      <div
        className="grid-3"
        style={{ marginTop: "40px" }}
      >
        {filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className="glass-card"
            style={{
              cursor: subject.locked
                ? "not-allowed"
                : "pointer",
              opacity: subject.locked ? 0.5 : 1,
              transition: "all 0.3s ease",
            }}
            onClick={() => {
              if (!subject.locked) {
                navigate(
                  `/subjects/${subject.id}/topics`
                );
              }
            }}
          >
            <h3>{subject.title}</h3>
            <p className="muted">
              {subject.description}
            </p>

            {/* Difficulty Tag */}
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                marginTop: "8px",
                background:
                  subject.difficulty === "Hard"
                    ? "#ef4444"
                    : subject.difficulty === "Medium"
                    ? "#f59e0b"
                    : "#10b981",
                color: "white",
              }}
            >
              {subject.difficulty}
            </span>

            {/* Completed Badge */}
            {subject.completed && (
              <span
                style={{
                  marginLeft: "10px",
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                ✔ Completed
              </span>
            )}

            {/* Locked Badge */}
            {subject.locked && (
              <span
                style={{
                  marginLeft: "10px",
                  color: "#ef4444",
                  fontWeight: 600,
                }}
              >
                🔒 Locked
              </span>
            )}

            {/* Progress Bar */}
            {!subject.locked && (
              <div
                style={{
                  height: "6px",
                  background: "#e5e7eb",
                  borderRadius: "6px",
                  marginTop: "15px",
                }}
              >
                <div
                  style={{
                    height: "6px",
                    width: `${subject.progress}%`,
                    background:
                      "linear-gradient(90deg,#6366f1,#4f46e5)",
                    borderRadius: "6px",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;