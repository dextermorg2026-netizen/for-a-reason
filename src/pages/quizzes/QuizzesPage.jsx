import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";

const QuizzesPage = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const raw = await getAllSubjects();

        const normalized = raw.map((s) => ({
          id: s.id,
          name: s.title ?? s.name ?? "Untitled Subject",
          description: s.description ?? s.desc ?? "No description available",
        }));

        if (mounted) setSubjects(normalized);
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

  return (
    <div>
      <h1 className="page-title">Quizzes</h1>

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

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gap: "20px",
        }}
      >
        {!loading && !error && subjects.map((subject) => (
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
              {subject.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesPage;