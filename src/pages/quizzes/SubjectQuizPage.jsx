import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTopicsBySubject } from "../../services/subjectService";

const SubjectQuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const rawTopics = await getTopicsBySubject(subjectId);

        const normalized = rawTopics.map((t) => ({
          id: t.id,
          title: t.title ?? t.name ?? "Untitled Topic",
          description:
            t.quizDescription ??
            t.description ??
            "Attempt topic-based questions for this subject.",
        }));

        if (mounted) setTopics(normalized);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load quizzes.");
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

  if (loading) {
    return (
      <div className="glass-card" style={{ marginTop: "30px" }}>
        Loading quizzes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ marginTop: "30px", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  if (!topics.length) {
    return (
      <div className="glass-card" style={{ marginTop: "30px" }}>
        No quizzes found for this subject yet.
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">
        Quizzes for {subjectId.toUpperCase()}
      </h1>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gap: "20px",
        }}
      >
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="glass-card"
          >
            <h3>{topic.title}</h3>
            <p className="muted">
              {topic.description}
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: "15px" }}
              onClick={() => navigate(`/quiz/${topic.id}`)}
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