import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";

const SubjectTheoryPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const subjects = await getAllSubjects();

        const found = (subjects || []).find(
          (s) => s.id === subjectId
        );

        if (!mounted) return;

        if (!found) {
          setError("Subject not found.");
        } else {
          setSubject({
            title:
              found.title ??
              found.name ??
              "Untitled Subject",
            content:
              found.theory ??
              found.content ??
              "No theory content available yet.",
          });
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Failed to load subject theory."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  return (
    <div className="subjects-container">
      {loading && (
        <div className="glass-card subjects-status">
          Loading theory...
        </div>
      )}

      {!loading && error && (
        <div className="glass-card subjects-status error">
          {error}
        </div>
      )}

      {!loading && subject && (
        <>
          <Link to={`/subjects/${subjectId}/topics`} className="page-back">
            ← Back to topics
          </Link>
          <h1 className="page-title">
            {subject.title} Theory
          </h1>

          <div className="glass-card theory-card">
            <p className="theory-content">
              {subject.content}
            </p>

            <button
              className="btn-primary theory-btn"
              onClick={() =>
                navigate(`/quizzes/${subjectId}`)
              }
            >
              Start {subject.title} Quiz
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubjectTheoryPage;