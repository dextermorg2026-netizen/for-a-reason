import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useXP } from "../../context/XPContext";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addXP } = useXP();
  const { score, total } = location.state || {
    score: 0,
    total: 0,
  };

  const earnedXP = score * 10;

  const [animatedXP, setAnimatedXP] = useState(0);

  useEffect(() => {
    // If someone lands here directly (no state), bounce back.
    if (!location.state) {
      navigate("/subjects", { replace: true });
      return;
    }

    let start = 0;
    const interval = setInterval(() => {
      start += 5;
      if (start >= earnedXP) {
        start = earnedXP;
        clearInterval(interval);
      }
      setAnimatedXP(start);
    }, 20);

    addXP(earnedXP);
    return () => clearInterval(interval);
  }, [addXP, earnedXP, location.state, navigate]);

  const level = Math.floor(animatedXP / 100);
  const progress = animatedXP % 100;

  return (
    <div>
      <h1 className="page-title">Quiz Completed 🎉</h1>

      <div className="page-card" style={{ marginTop: "2rem" }}>
        <h2>
          Score: {score} / {total}
        </h2>

        <p style={{ marginTop: "10px" }}>
          XP Earned: {animatedXP}
        </p>

        {/* Level Badge */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            display: "inline-block",
            borderRadius: "20px",
            background:
              "linear-gradient(90deg,#8b5cf6,#6366f1)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Level {level}
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: "10px",
            background: "#eee",
            borderRadius: "6px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              height: "10px",
              width: `${progress}%`,
              background:
                "linear-gradient(90deg,#6366f1,#4f46e5)",
              borderRadius: "6px",
            }}
          />
        </div>

        <p className="muted" style={{ marginTop: "8px" }}>
          {100 - progress} XP to next level
        </p>

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