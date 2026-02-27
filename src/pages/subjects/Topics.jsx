import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTopicsBySubject } from "../../services/subjectService";

const Topics = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [topics, setTopics] = useState([]);
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

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const rawTopics = await getTopicsBySubject(subjectId);

        const normalized = rawTopics.map((t) => ({
          id: t.id,
          title: t.title ?? t.name ?? "Untitled Topic",
          theoryDescription:
            t.theoryDescription ??
            t.description ??
            t.theory ??
            "Learn the core concepts and key ideas for this topic.",
          difficulty: normalizeDifficulty(t.difficulty),
          theoryCompleted: Boolean(t.theoryCompleted ?? t.completedTheory ?? false),
        }));

        if (mounted) setTopics(normalized);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load topics.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (subjectId) load();
    else {
      setTopics([]);
      setLoading(false);
      setError("Missing subject id.");
    }

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  const hasTopics = useMemo(() => topics.length > 0, [topics.length]);

  return (
    <div>
      <h1 className="page-title">Subject Structure</h1>
      <p className="page-subtitle">
        Learn theory or jump straight into practice
      </p>

      {loading && (
        <div className="glass-card" style={{ marginTop: "30px" }}>
          Loading topics...
        </div>
      )}

      {!loading && error && (
        <div className="glass-card" style={{ marginTop: "30px", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {!loading && !error && !hasTopics && (
        <div className="glass-card" style={{ marginTop: "30px" }}>
          No topics found for this subject yet.
        </div>
      )}

      {/* ================= THEORY SECTION ================= */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>
          📘 Theory Section
        </h2>

        {!loading && !error && topics.map((topic) => (
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

        {!loading && !error && topics.map((topic) => (
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