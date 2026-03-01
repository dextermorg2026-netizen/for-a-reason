import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getTopicsBySubject } from "../../services/subjectService";

import TopicTheoryCard from "./components/TopicTheoryCard";
import TopicQuizCard from "./components/TopicQuizCard";

const Topics = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const rawTopics =
          await getTopicsBySubject(subjectId);

        const normalized = (rawTopics || []).map(
          (t) => ({
            id: t.id,
            title:
              t.title ??
              t.name ??
              "Untitled Topic",
            theoryDescription:
              t.theoryDescription ??
              t.description ??
              "Learn the core concepts.",
            difficulty:
              t.difficulty ?? "Medium",
            theoryCompleted:
              Boolean(t.theoryCompleted),
          })
        );

        if (mounted) setTopics(normalized);
      } catch (e) {
        if (mounted)
          setError(
            e?.message ||
              "Failed to load topics."
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (subjectId) load();
    else {
      setError("Missing subject id.");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  return (
    <div className="subjects-container">
      <Link to="/subjects" className="page-back">
        ← Back to subjects
      </Link>
      <h1 className="page-title">
        Subject Structure
      </h1>
      <p className="page-subtitle">
        Learn theory or jump into practice
      </p>

      {loading && (
        <div className="glass-card subjects-status">
          Loading topics...
        </div>
      )}

      {!loading && error && (
        <div className="glass-card subjects-status error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="topics-section">
            <h2 className="topics-heading">
              📘 Theory Section
            </h2>

            {topics.map((topic) => (
              <TopicTheoryCard
                key={topic.id}
                topic={topic}
                onClick={() =>
                  navigate(
                    `/resources?topic=${topic.id}`
                  )
                }
              />
            ))}
          </div>

          <div className="topics-section">
            <h2 className="topics-heading">
              🧠 Practice Quiz
            </h2>

            {topics.map((topic) => (
              <TopicQuizCard
                key={topic.id}
                topic={topic}
                onClick={() =>
                  navigate(`/quiz/${topic.id}`)
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Topics;