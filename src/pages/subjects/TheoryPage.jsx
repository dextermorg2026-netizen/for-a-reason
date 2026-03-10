import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubtopicById } from "../../services/subjectService";
import "./TheoryPage.css";

const TheoryPage = () => {
  const { subtopicId } = useParams();
  const navigate = useNavigate();

  const [subtopic, setSubtopic] = useState(null);
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
          setError("Content not found.");
        } else {
          setSubtopic(data);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load content. Please try again.");
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

  if (loading) {
    return (
      <div className="theory-page">
        <div className="theory-loader">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theory-page">
        <button onClick={() => navigate(-1)} className="theory-back-btn">
          ← Back
        </button>
        <div className="theory-error">
          <p>{error}</p>
          <button onClick={() => navigate("/subjects")} className="btn-primary">
            Go to Subjects
          </button>
        </div>
      </div>
    );
  }

  if (!subtopic) {
    return (
      <div className="theory-page">
        <button onClick={() => navigate(-1)} className="theory-back-btn">
          ← Back
        </button>
        <div className="theory-error">
          <p>No content available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theory-page">
      {/* Header with back button */}
      <header className="theory-header">
        <button onClick={() => navigate(-1)} className="theory-back-btn">
          ← Back
        </button>
        <h1 className="theory-page-title">{subtopic.title}</h1>
      </header>

      {/* Main content */}
      <main className="theory-content-wrapper">
        {/* Text content */}
        <div className="theory-text-section">
          <div className="theory-text">
            {subtopic.theory || "No content available."}
          </div>
        </div>

        {/* Images section */}
        {subtopic.images && subtopic.images.length > 0 && (
          <div className="theory-images-section">
            <h2 className="images-heading">Diagrams & Illustrations</h2>
            <div className="images-grid">
              {subtopic.images.map((imageUrl, idx) => (
                <div key={idx} className="image-card">
                  <img
                    src={imageUrl}
                    alt={`${subtopic.title} - ${idx + 1}`}
                    className="img-display"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer with CTA */}
      <footer className="theory-footer">
        <button
          className="btn-primary btn-large"
          onClick={() => navigate(`/quizzes/${subtopic.topicId}`)}
        >
          Practice Questions →
        </button>
      </footer>
    </div>
  );
};

export default TheoryPage;
