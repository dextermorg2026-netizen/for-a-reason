import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getSubtopicById,
  getSubtopicsByTopic,
  getTopicsBySubject,
  getTopicById
} from "../../services/subjectService";

const SubjectTheoryPage = () => {

  const { subtopicId } = useParams();
  const navigate = useNavigate();

  const [subtopic, setSubtopic] = useState(null);
  const [subjectId, setSubjectId] = useState(null);

  const [nextSubtopicId, setNextSubtopicId] = useState(null);
  const [nextTopicFirstSubtopic, setNextTopicFirstSubtopic] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    let mounted = true;

    const loadSubtopic = async () => {

      try {

        setLoading(true);
        setError("");

        const data = await getSubtopicById(subtopicId);

        if (!mounted) return;

        if (!data) {
          setError("Subtopic not found.");
          return;
        }

        setSubtopic(data);

        /* -------- GET SUBJECT -------- */

        const topicDoc = await getTopicById(data.topicId);
        setSubjectId(topicDoc.subjectId);

        /* -------- NEXT SUBTOPIC -------- */

        const subs = await getSubtopicsByTopic(data.topicId);

        const index = subs.findIndex(
          s => s.id === subtopicId
        );

        if (index !== -1 && index < subs.length - 1) {

          setNextSubtopicId(subs[index + 1].id);

        } else {

          setNextSubtopicId(null);

          /* -------- NEXT TOPIC -------- */

          const subjectTopics = await getTopicsBySubject(
            topicDoc.subjectId
          );

          const topicIndex = subjectTopics.findIndex(
            t => t.id === data.topicId
          );

          if (
            topicIndex !== -1 &&
            topicIndex < subjectTopics.length - 1
          ) {

            const nextTopic =
              subjectTopics[topicIndex + 1];

            const nextTopicSubs =
              await getSubtopicsByTopic(nextTopic.id);

            if (nextTopicSubs.length > 0) {
              setNextTopicFirstSubtopic(
                nextTopicSubs[0].id
              );
            }

          } else {

            setNextTopicFirstSubtopic(null);

          }

        }

      } catch (err) {

        console.error(err);

        if (mounted) {
          setError("Failed to load theory.");
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    };

    if (subtopicId) {
      loadSubtopic();
    }

    return () => {
      mounted = false;
    };

  }, [subtopicId]);

  return (

    <div className="subjects-container">

      {/* BACK BUTTON (SAFE VERSION) */}

      <button
        className="back-btn"
        onClick={() => navigate(`/subjects/${subjectId}`)}
      >
        ← Back to Subject
      </button>

      {loading && (
        <div className="subjects-status">
          Loading theory...
        </div>
      )}

      {!loading && error && (
        <div className="subjects-status error">
          {error}
        </div>
      )}

      {!loading && subtopic && (

        <div className="glass-card theory-card">

          <h1 className="page-title">
            {subtopic.title}
          </h1>

          <div className="theory-content">

            {subtopic.theory
              ?.split("\n")
              .filter(line => line.trim() !== "")
              .map((line, index) => (
                <p
                  key={index}
                  style={{
                    marginBottom: "14px",
                    lineHeight: "1.7",
                    fontSize: "16px"
                  }}
                >
                  {line}
                </p>
              ))}

          </div>

          {/* BUTTON LOGIC */}

          <div className="quiz-button-container">

            {nextSubtopicId && (
              <button
                className="btn-primary"
                onClick={() =>
                  navigate(`/subjects/theory/${nextSubtopicId}`)
                }
              >
                Next →
              </button>
            )}

            {!nextSubtopicId && nextTopicFirstSubtopic && (
              <button
                className="btn-primary"
                onClick={() =>
                  navigate(`/subjects/theory/${nextTopicFirstSubtopic}`)
                }
              >
                Next Topic →
              </button>
            )}

            {!nextSubtopicId && !nextTopicFirstSubtopic && (
              <button
                className="btn-primary"
                onClick={() =>
                  navigate(`/quizzes/${subtopic.topicId}`)
                }
              >
                Take Quiz →
              </button>
            )}

          </div>

        </div>

      )}

    </div>

  );

};

export default SubjectTheoryPage;