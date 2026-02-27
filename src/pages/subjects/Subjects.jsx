import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";

const DUMMY_SUBJECTS = [
  {
    id: "dummy-1",
    title: "Data Structures",
    difficulty: "Medium",
    progress: 70,
    completed: false,
    locked: false,
    description: "Arrays, Linked List, Stack, Queue",
  },
  {
    id: "dummy-2",
    title: "Algorithms",
    difficulty: "Hard",
    progress: 40,
    completed: false,
    locked: false,
    description: "Sorting, Searching, Recursion",
  },
  {
    id: "dummy-3",
    title: "Dynamic Programming",
    difficulty: "Hard",
    progress: 0,
    completed: false,
    locked: false,
    description: "Memoization & Tabulation",
  },
  {
    id: "dummy-4",
    title: "Graph Theory",
    difficulty: "Medium",
    progress: 100,
    completed: true,
    locked: false,
    description: "BFS, DFS, Shortest Path",
  },
];

const Subjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const normalizeDifficulty = (value) => {
      if (value == null) return "Medium";
      const raw = String(value).trim();
      if (!raw) return "Medium";
      const lower = raw.toLowerCase();
      if (lower === "easy" || lower === "medium" || lower === "hard") {
        return lower[0].toUpperCase() + lower.slice(1);
      }
      return raw;
    };

    const clampProgress = (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, n));
    };

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const rawSubjects = await getAllSubjects();
        const normalizedBackendSubjects = rawSubjects.map((s) => {
          const progress = clampProgress(s.progress ?? s.xpProgress ?? 0);
          const completed =
            typeof s.completed === "boolean" ? s.completed : progress >= 100;

          return {
            id: s.id,
            title: s.title ?? s.name ?? "Untitled Subject",
            difficulty: normalizeDifficulty(s.difficulty),
            progress,
            completed,
            locked: false,
            description:
              s.description ?? s.desc ?? "No description available",
          };
        });

        // Keep backend subjects first, then dummy subjects (helps while backend has few entries).
        // Avoid duplicates by title (case-insensitive).
        const backendTitles = new Set(
          normalizedBackendSubjects.map((s) => s.title.trim().toLowerCase())
        );
        const dummySubjects = DUMMY_SUBJECTS.filter(
          (s) => !backendTitles.has(s.title.trim().toLowerCase())
        );

        const merged = [...normalizedBackendSubjects, ...dummySubjects];

        if (mounted) setSubjects(merged);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load subjects.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSubjects = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch = subject.title.toLowerCase().includes(searchLower);
      return matchesSearch;
    });
  }, [subjects, search]);

  const continueSubject = subjects.find(
    (s) => s.progress > 0 && s.progress < 100
  );

  return (
    <div>
      <h1 className="page-title">Learning Roadmap</h1>
      <p className="page-subtitle">
        Structured progression to mastery
      </p>

      {loading && (
        <div className="glass-card" style={{ marginTop: "30px" }}>
          Loading subjects...
        </div>
      )}

      {!loading && error && (
        <div className="glass-card" style={{ marginTop: "30px", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* ===== Continue Learning Section ===== */}
      {!loading && !error && continueSubject && (
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

      {/* ===== Search ===== */}
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
      </div>

      {/* ===== Subject Grid ===== */}
      <div
        className="grid-3"
        style={{ marginTop: "40px" }}
      >
        {!loading && !error && filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className="glass-card"
            style={{
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate(`/subjects/${subject.id}/topics`)}
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

            {/* Progress Bar */}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;