import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import {
  getTopicsBySubject,
  getSubtopicsByTopic,
  getAllSubjects
} from "../../services/subjectService";

import { getTopicProgress } from "../../services/progressService";
import { useAuth } from "../../context/AuthContext";

const Topics = () => {

  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { currentUser } = useAuth();

  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState({});
  const [topicProgress, setTopicProgress] = useState({});
  const [openTopic, setOpenTopic] = useState(null);
  const [subjectName, setSubjectName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    let mounted = true;

    const load = async () => {

      try {

        setLoading(true);
        setError("");

        /* ---------------- SUBJECT NAME ---------------- */

        const subjects = await getAllSubjects();
        const subject = subjects.find(s => s.id === subjectId);

        if (mounted) {
          setSubjectName(subject?.title || subject?.name || "Subject");
        }

        /* ---------------- LOAD TOPICS ---------------- */

        const topicData = await getTopicsBySubject(subjectId);

        if (!mounted) return;

        setTopics(topicData || []);

        /* ---------------- LOAD SUBTOPICS ---------------- */

        const subtopicPromises = topicData.map(async (topic) => {
          const subs = await getSubtopicsByTopic(topic.id);
          return { topicId: topic.id, subs };
        });

        const subtopicResults = await Promise.all(subtopicPromises);

        const subtopicMap = {};

        subtopicResults.forEach(({ topicId, subs }) => {
          subtopicMap[topicId] = subs || [];
        });

        if (mounted) {
          setSubtopics(subtopicMap);
        }

        /* ---------------- LOAD PROGRESS ---------------- */

        if (currentUser) {

          const progressPromises = topicData.map(async (topic) => {
            const progress = await getTopicProgress(
              currentUser.uid,
              topic.id
            );

            return { topicId: topic.id, progress };
          });

          const progressResults = await Promise.all(progressPromises);

          const progressMap = {};

          progressResults.forEach(({ topicId, progress }) => {
            progressMap[topicId] = progress;
          });

          if (mounted) {
            setTopicProgress(progressMap);
          }
        }

      } catch (err) {

        console.error(err);

        if (mounted) {
          setError("Failed to load topics.");
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    };

    load();

    return () => {
      mounted = false;
    };

  }, [subjectId, currentUser]);

  /* ---------------- TOGGLE MODULE ---------------- */

  const toggleTopic = (topicId) => {
    setOpenTopic(prev => prev === topicId ? null : topicId);
  };

  /* ================================================= */

  return (
    <div className="subjects-container">

      <Link to="/subjects" className="page-back">
        ← Back to subjects
      </Link>

      <h1 className="page-title">
        {subjectName}
      </h1>

      <p className="page-subtitle">
        Browse topics and start learning step-by-step
      </p>

      {/* ---------------- LOADING ---------------- */}

      {loading && (
        <p className="subjects-status">
          Loading topics...
        </p>
      )}

      {/* ---------------- ERROR ---------------- */}

      {!loading && error && (
        <p className="subjects-status error">
          {error}
        </p>
      )}

      {/* ---------------- TOPICS ---------------- */}

      {!loading && !error && (

        <div className="topics-list">

          {topics.length === 0 && (
            <p>No topics available yet.</p>
          )}

          {topics.map((topic, index) => {

            const isOpen = openTopic === topic.id;

            const progress =
              topicProgress[topic.id]?.masteryPercent || 0;

            return (

              <div key={topic.id} className="topic-block">

                {/* -------- Topic Header -------- */}

                <div
                  className="topic-header"
                  onClick={() => toggleTopic(topic.id)}
                >

                  <span className="topic-title">
                    Module {index + 1}: {topic.title}
                  </span>

                  <div className="topic-header-right">

                    <span className="topic-progress-percent">
                      {progress}%
                    </span>

                    <span className="topic-arrow">
                      {isOpen ? "▼" : "▶"}
                    </span>

                  </div>

                </div>

                {/* -------- Progress Bar -------- */}

                <div className="topic-progress-bar">

                  <div
                    className="topic-progress-fill"
                    style={{ width: `${progress}%` }}
                  />

                </div>

                {/* -------- Subtopics -------- */}

                {isOpen && (

                  <div className="subtopics-list">

                    {subtopics[topic.id]?.length === 0 && (
                      <div className="subtopic-item muted">
                        No subtopics available
                      </div>
                    )}

                    {subtopics[topic.id]?.map((sub) => (

                      <div
                        key={sub.id}
                        className="subtopic-item"
                        onClick={() =>
                          navigate(`/subjects/theory/${sub.id}`)
                        }
                      >
                        • {sub.title}
                      </div>

                    ))}

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

      {/* ---------------- SUBJECT QUIZ ---------------- */}

      {!loading && !error && topics.length > 0 && (

        <div className="quiz-button-container">

          <button
            className="btn-primary"
            onClick={() =>
              navigate(`/quizzes/${subjectId}`)
            }
          >
            Take Full Subject Quiz →
          </button>

        </div>

      )}

    </div>
  );
};

export default Topics;