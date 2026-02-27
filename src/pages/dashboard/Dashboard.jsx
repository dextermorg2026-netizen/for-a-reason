import { useEffect, useState } from "react";
import { useXP } from "../../context/XPContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const stats = {
    score: 320,
    rank: 12,
    quizzes: 24,
    streak: 5,
  };

  const { level, progress, totalXP } = useXP();
  const [animatedScore, setAnimatedScore] = useState(0);

  const performanceData = [
    { day: "Mon", score: 40 },
    { day: "Tue", score: 60 },
    { day: "Wed", score: 80 },
    { day: "Thu", score: 70 },
    { day: "Fri", score: 100 },
    { day: "Sat", score: 120 },
    { day: "Sun", score: 140 },
  ];

  // Animate score counter
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 5;
      if (start >= stats.score) {
        start = stats.score;
        clearInterval(interval);
      }
      setAnimatedScore(start);
    }, 15);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Track your performance & roadmap
      </p>

      {/* ===== Stats Section ===== */}
      <div className="grid-3" style={{ marginTop: "40px" }}>
        <div className="glass-card">
          <p style={{ color: "var(--text-muted)" }}>Total Score</p>
          <h2 style={{ fontSize: "30px", marginTop: "8px" }}>
            {animatedScore}
          </h2>
        </div>

        <div className="glass-card">
          <p style={{ color: "var(--text-muted)" }}>Global Rank</p>
          <h2 style={{ fontSize: "30px", marginTop: "8px" }}>
            #{stats.rank}
          </h2>
        </div>

        <div className="glass-card">
          <p style={{ color: "var(--text-muted)" }}>Streak 🔥</p>
          <h2 style={{ fontSize: "30px", marginTop: "8px" }}>
            {stats.streak} Days
          </h2>
        </div>
      </div>

      {/* ===== Level Card ===== */}
      <div className="glass-card" style={{ marginTop: "40px" }}>
        <h3>Level Progression</h3>

        <div
          style={{
            marginTop: "15px",
            padding: "10px 18px",
            display: "inline-block",
            borderRadius: "20px",
            background: "linear-gradient(90deg,#8b5cf6,#6366f1)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Level {level}
        </div>

        <p style={{ marginTop: "10px" }}>{totalXP} XP</p>

        {/* Progress Bar */}
        <div
          style={{
            height: "8px",
            background: "#e5e7eb",
            borderRadius: "6px",
            marginTop: "15px",
          }}
        >
          <div
            style={{
              height: "8px",
              width: `${progress}%`,
              background:
                "linear-gradient(90deg,#6366f1,#4f46e5)",
              borderRadius: "6px",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <p className="muted" style={{ marginTop: "8px" }}>
          {100 - progress} XP to next level
        </p>
      </div>

      {/* ===== Performance Chart ===== */}
      <div
        className="glass-card"
        style={{ marginTop: "50px", height: "320px" }}
      >
        <h3 style={{ marginBottom: "20px" }}>
          Weekly Performance
        </h3>

        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={performanceData}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e25",
                border: "none",
                borderRadius: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* ===== Achievements Section ===== */}
<div
  className="glass-card"
  style={{ marginTop: "60px" }}
>
  <h3 style={{ marginBottom: "20px" }}>
    Achievements
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(160px,1fr))",
      gap: "20px",
    }}
  >
    {[
      {
        title: "Getting Started",
        condition: stats.quizzes >= 5,
        icon: "🚀",
      },
      {
        title: "Rising Star",
        condition: totalXP >= 100,
        icon: "⭐",
      },
      {
        title: "Consistency Pro",
        condition: stats.streak >= 5,
        icon: "🔥",
      },
      {
        title: "High Scorer",
        condition: stats.score >= 300,
        icon: "🏆",
      },
    ].map((badge, index) => (
      <div
        key={index}
        style={{
          padding: "20px",
          borderRadius: "16px",
          textAlign: "center",
          background: badge.condition
            ? "linear-gradient(135deg,#8b5cf6,#6366f1)"
            : "rgba(255,255,255,0.05)",
          color: badge.condition
            ? "white"
            : "var(--text-muted)",
          transition: "all 0.3s ease",
          transform: badge.condition
            ? "scale(1)"
            : "scale(0.95)",
        }}
      >
        <div style={{ fontSize: "28px" }}>
          {badge.icon}
        </div>
        <p style={{ marginTop: "10px" }}>
          {badge.title}
        </p>

        {!badge.condition && (
          <p
            style={{
              fontSize: "12px",
              marginTop: "6px",
            }}
          >
            Locked
          </p>
        )}
      </div>
    ))}
  </div>
</div>
    </div>
  );
};

export default Dashboard;