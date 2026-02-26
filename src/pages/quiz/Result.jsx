import { useLocation, useNavigate } from "react-router-dom";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { score, total } = location.state || {
    score: 0,
    total: 0
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Quiz Result</h1>
      <h2>Your Score: {score} / {total}</h2>

      <button onClick={() => navigate("/subjects")}>
        Back to Subjects
      </button>
    </div>
  );
};

export default Result;