import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const planText =
  typeof aiData?.plan === "string"
    ? aiData.plan
    : aiData?.plan?.plan || "";
  const state = location.state || {};

  const score = state.score || 0;
  const total = state.total || 0;
  const coinsEarned = state.coinsEarned || 0;
  const questions = state.questions || [];
  const answers = state.answers || {};

  /* ================= AI HANDLER ================= */

  const handleAIAnalysis = async () => {
    console.log("✅ AI BUTTON CLICKED");
  
    if (!questions.length) {
      alert("No quiz data found");
      return;
    }
  
    // 🔥 BUILD CORRECT PAYLOAD
    const topicStats = {};
  
    questions.forEach((q) => {
      const topic = q.topicName || q.topicId || "General";
  
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
  
      topicStats[topic].total++;
  
      if (answers[q.id] === Number(q.correctAnswer)) {
        topicStats[topic].correct++;
      }
    });
  
    const topic_accuracy = {};
    const avg_time_per_question = {};
  
    Object.keys(topicStats).forEach((topic) => {
      const { correct, total } = topicStats[topic];
      topic_accuracy[topic] = (correct / total) * 100;
      avg_time_per_question[topic] = 30;
    });
  
    const aiPayload = {
      user_id: "demo_user", // or your auth user
      topic_accuracy,
      avg_time_per_question,
      mistakes: [],
      recent_scores: [score],
    };
  
    console.log("🔥 CORRECT PAYLOAD:", aiPayload);
  
    setAiLoading(true);
  
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiPayload),
      });
  
      const data = await res.json();
      console.log("🤖 AI RESPONSE:", data);
  
      setAiData(data);
    } catch (err) {
      console.error("❌ API ERROR:", err);
    }
  
    setAiLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div>
      <h1 className="page-title">Quiz Completed 🎉</h1>

      {/* RESULT */}
      <div className="page-card" style={{ marginTop: "2rem" }}>
        <h2>Score: {score} / {total}</h2>
        <h3 style={{ marginTop: "10px" }}>
          🪙 Coins earned: {coinsEarned}
        </h3>
      </div>

      {/* AI BUTTON */}
      <button
        className="btn-primary"
        style={{ marginTop: "20px" }}
        onClick={handleAIAnalysis}
        disabled={aiLoading}
      >
        {aiLoading ? "Analyzing..." : "🤖 AI Agent Analysis"}
      </button>

      {/* AI OUTPUT */}
      {aiData && (
        <div className="page-card" style={{ marginTop: "20px" }}>
          <h2>🤖 AI Coach</h2>

          <h3>🎯 Summary</h3>
          <p>
            You have weaknesses in{" "}
            {aiData.analysis?.weak_topics?.length || 0} topics
          </p>

          <h3>⚠️ Weak Topics</h3>
          <div>
  {aiData.analysis?.weak_topics?.map((t, i) => (
    <span
      key={i}
      style={{
        background: "#fee2e2",
        padding: "6px 10px",
        borderRadius: "999px",
        margin: "4px",
        display: "inline-block",
      }}
    >
      {t}
    </span>
  ))}
</div>

 {/* ACTION PLAN */}
{(() => {
  const steps = planText
    .split("\n")
    .filter((line) => line.trim().startsWith("Step"));

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>📌 Action Plan</h3>

      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            background: "#f8fafc",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "10px",
            border: "1px solid #e2e8f0",
          }}
        >
          {step}
        </div>
      ))}
    </div>
  );
})()}
{/* RECOMMENDATIONS */}
{aiData?.recommendations?.length > 0 && (
  <div style={{ marginTop: "20px" }}>
    <h3>📚 Practice Questions</h3>
    <ul>
      {aiData.recommendations.map((q, i) => (
        <li key={i}>{q}</li>
      ))}
    </ul>
  </div>
)}
</div>
)}

      {/* ANSWERS */}
      <div style={{ marginTop: "30px" }}>
        {questions.map((q, index) => {
          const userAnswer = answers[q.id];

          return (
            <div
              key={q.id}
              className="page-card"
              style={{ marginBottom: "20px" }}
            >
              <h3>
                {index + 1}. {q.question}
              </h3>

              <div style={{ marginTop: "12px" }}>
                {q.options.map((option, i) => {
                  let background = "white";
                  let color = "black";

                  if (i === q.correctAnswer) {
                    background = "#22c55e";
                    color = "white";
                  }

                  if (i === userAnswer && userAnswer !== q.correctAnswer) {
                    background = "#ef4444";
                    color = "white";
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "6px",
                        background,
                        color,
                        border: "1px solid #ddd",
                      }}
                    >
                      {option}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <p style={{ marginTop: "10px", color: "#555" }}>
                  Explanation: {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="btn-primary"
        style={{ marginTop: "30px" }}
        onClick={() => navigate("/subjects")}
      >
        Back to Subjects
      </button>
    </div>
  )
};

export default Result