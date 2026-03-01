import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";
import { getLastAttemptedSubject } from "../../services/statsService";
import { useAuth } from "../../context/AuthContext";

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
  const { currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const normalizeDifficulty = (value) => {
      if (!value) return "Medium";
      const lower = String(value).toLowerCase();
      if (["easy", "medium", "hard"].includes(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return value;
    };

    const clampProgress = (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, n));
    };

    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const rawSubjects = await getAllSubjects();

        let last = null;
        if (currentUser?.uid) {
          last = await getLastAttemptedSubject(currentUser.uid);
        }

        const normalizedBackendSubjects = (rawSubjects || []).map((s) => {
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

        const backendTitles = new Set(
          normalizedBackendSubjects.map((s) =>
            s.title.trim().toLowerCase()
          )
        );

        const dummySubjects = DUMMY_SUBJECTS.filter(
          (s) => !backendTitles.has(s.title.trim().toLowerCase())
        );

        const merged = [...normalizedBackendSubjects, ...dummySubjects];

        if (mounted) {
          setSubjects(merged);
          setLastAttempt(last);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to load subjects.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSubjects();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const filteredSubjects = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    return subjects.filter((subject) =>
      subject.title.toLowerCase().includes(searchLower)
    );
  }, [subjects, search]);

  const continueSubject = lastAttempt
    ? subjects.find((s) => s.id === lastAttempt.subjectId)
    : null;

  return (
    <div>
      <h1 className="page-title">Learning Roadmap</h1>
      <p className="page-subtitle">
        Structured progression to mastery
      </p>

      {/* Loading */}
      {loading && (
        <div className="glass-card" style={{ marginTop: "30px" }}>
          Loading subjects...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="glass-card"
          style={{ marginTop: "30px", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      {/* Continue Section */}
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
                background: "linear-gradient(90deg,#6366f1,#4f46e5)",
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

      {/* Search */}
      {!loading && !error && (
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
      )}

      {/* Subjects Grid */}
      <div className="grid-3" style={{ marginTop: "40px" }}>
        {!loading &&
          !error &&
          filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="glass-card"
              style={{
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() =>
                navigate(`/subjects/${subject.id}/topics`)
              }
            >
              <h3>{subject.title}</h3>
              <p className="muted">{subject.description}</p>

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