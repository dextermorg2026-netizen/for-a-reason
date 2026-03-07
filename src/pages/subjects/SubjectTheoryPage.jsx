import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSubtopicById } from "../../services/subjectService";

const SubjectTheoryPage = () => {
const { subtopicId } = useParams();
const navigate = useNavigate();

const [subtopic, setSubtopic] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let mounted = true;

```
const loadSubtopic = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await getSubtopicById(subtopicId);

    if (!mounted) return;

    if (!data) {
      setError("Subtopic not found.");
    } else {
      setSubtopic(data);
    }

  } catch (err) {
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
```

}, [subtopicId]);

return ( <div className="subjects-container">

```
  {/* Back button */}

  <Link to="/subjects" className="page-back">
    ← Back to topics
  </Link>

  {/* Loading */}

  {loading && (
    <div className="subjects-status">
      Loading theory...
    </div>
  )}

  {/* Error */}

  {!loading && error && (
    <div className="subjects-status error">
      {error}
    </div>
  )}

  {/* Theory Content */}

  {!loading && subtopic && (
    <div className="glass-card theory-card">

      <h1 className="page-title">
        {subtopic.title}
      </h1>

      <div className="theory-content">
        {subtopic.theory || "No theory content available."}
      </div>

      {/* Quiz Button */}

      <div className="quiz-button-container">
        <button
          className="btn-primary"
          onClick={() =>
            navigate(`/quizzes/${subtopic.topicId}`)
          }
        >
          Take Quiz →
        </button>
      </div>

    </div>
  )}

</div>


);
};

export default SubjectTheoryPage;
