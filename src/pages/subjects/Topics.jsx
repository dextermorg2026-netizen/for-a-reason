import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTopicsBySubject } from "../../services/subjectService";
import { getTopicProgress } from "../../services/progressService";

const Topics = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [topics, setTopics] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Do nothing until both exist
    if (!subjectId || !currentUser) return;
  
    const fetchTopicsWithProgress = async () => {
      try {
        setLoading(true);
  
        const data = await getTopicsBySubject(subjectId);
        setTopics(data);
  
        const progressMap = {};
  
        for (let topic of data) {
          const stats = await getTopicProgress(
            currentUser.uid,
            topic.id
          );
          progressMap[topic.id] = stats;
        }
  
        setProgressData(progressMap);
      } catch (err) {
        console.error("Topics error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTopicsWithProgress();
  }, [subjectId, currentUser]);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading topics...</p>;
  }

  if (topics.length === 0) {
    return <p style={{ padding: "20px" }}>No topics found.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Topics</h2>

      {topics.map((topic) => {
        const stats = progressData[topic.id];

        return (
          <div
            key={topic.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              cursor: "pointer",
            }}
            onClick={() =>
              navigate(`/quiz/${topic.id}`)
            }
          >
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>

            {stats && (
              <>
                <p>
                  Mastery: {stats.masteryPercent}% (
                  {stats.masteredCount}/
                  {stats.totalQuestions})
                </p>

                <p>
                  Accuracy: {stats.accuracyPercent}%
                </p>

                <div
                  style={{
                    height: "10px",
                    width: "100%",
                    background: "#eee",
                    borderRadius: "5px",
                  }}
                >
                  <div
                    style={{
                      height: "10px",
                      width: `${stats.masteryPercent}%`,
                      background: "green",
                      borderRadius: "5px",
                    }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Topics;