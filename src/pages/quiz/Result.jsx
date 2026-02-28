import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || { score: 0, total: 0 };

  useEffect(() => {
    // If someone lands here directly (no state), redirect back to subjects.
    if (!location.state) {
      navigate("/subjects", { replace: true });
    }
  }, [location.state, navigate]);

  return (
    <div>
      <h1 className="page-title">Quiz Completed 🎉</h1>

      <div className="page-card" style={{ marginTop: "2rem" }}>
        <h2>
          Score: {score} / {total}
        </h2>

        <p style={{ marginTop: "10px" }}>Thanks for completing the quiz.</p>

        <button
          className="btn-primary"
          style={{ marginTop: "25px" }}
          onClick={() => navigate("/subjects")}
        >
          Back to Subjects
        </button>
      </div>
    </div>
  );
};

export default Result;