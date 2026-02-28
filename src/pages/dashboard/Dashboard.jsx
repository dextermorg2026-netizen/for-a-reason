import { useEffect, useState } from "react";
import { useXP } from "../../context/XPContext";
import { useAuth } from "../../context/AuthContext";
import { getGlobalScore } from "../../services/statsService";
import {
  getUserStreak,
  getWeeklyStats,
  getCurrentWeekStats,
} from "../../services/streakService";
import { getGlobalLeaderboard } from "../../services/leaderboardService";
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
  const { currentUser } = useAuth();
  const { level, progress, totalXP } = useXP();

  const [stats, setStats] = useState({
    score: 0,
    rank: null,
    quizzes: 0,
    streak: 0,
  });

  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!currentUser?.uid) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [score, streak, weekly, currentWeek, leaderboard] = await Promise.all([
          getGlobalScore(currentUser.uid),
          getUserStreak(currentUser.uid),
          getWeeklyStats(currentUser.uid),
          getCurrentWeekStats(currentUser.uid),
          getGlobalLeaderboard(),
        ]);

        const safeWeekly = Array.isArray(weekly) ? weekly : [];
        const quizzes = safeWeekly.reduce((sum, n) => sum + (Number(n) || 0), 0);

        const rankIndex = Array.isArray(leaderboard)
          ? leaderboard.findIndex((x) => x.userId === currentUser.uid)
          : -1;
        const rank = rankIndex >= 0 ? rankIndex + 1 : null;

        if (!mounted) return;

        setStats({
          score: Number(score) || 0,
          rank,
          quizzes,
          streak: Number(streak) || 0,
        });

        const safeCurrentWeek = Array.isArray(currentWeek) ? currentWeek : [];

// Force exactly 5 days (Mon–Fri)
const defaultFiveDays = [
  { day: "Mon", questions: 0 },
  { day: "Tue", questions: 0 },
  { day: "Wed", questions: 0 },
  { day: "Thu", questions: 0 },
  { day: "Fri", questions: 0 },
  { day: "Sat", questions: 0 },
  { day: "Sun", questions: 0 },
];

if (safeCurrentWeek.length) {
  // Ensure only first 5 days are used
  const formatted = defaultFiveDays.map((d, index) => ({
    day: d.day,
    questions: Number(safeCurrentWeek[index]?.questions) || 0,
  }));
  setPerformanceData(formatted);
} else {
  setPerformanceData(defaultFiveDays);
}
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load dashboard stats.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [currentUser?.uid]);

  // Animate score counter
  useEffect(() => {
    const target = Number(stats.score) || 0;
    let start = 0;
    setAnimatedScore(0);

    if (target <= 0) return;

    const step = Math.max(1, Math.ceil(target / 120));
    const interval = setInterval(() => {
      start = Math.min(target, start + step);
      if (start >= target) {
        clearInterval(interval);
      }
      setAnimatedScore(start);
    }, 15);

    return () => clearInterval(interval);
  }, [stats.score]);

  const maxQuestions = Math.max(
    0,
    ...performanceData.map((d) => Number(d.questions) || 0)
  );

  const yAxisMax = maxQuestions === 0 ? 5 : Math.ceil(maxQuestions);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Track your performance & roadmap
      </p>

      {error && (
        <div className="glass-card" style={{ marginTop: "30px", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* ===== Stats Section ===== */}
      <div className="grid-3" style={{ marginTop: "40px" }}>
        <div className="glass-card">
          <p style={{ color: "var(--text-muted)" }}>Total Score</p>
          <h2 style={{ fontSize: "30px", marginTop: "8px" }}>
            {loading ? "…" : animatedScore}
          </h2>
        </div>

        <div className="glass-card">
          <p style={{ color: "var(--text-muted)" }}>Global Rank</p>
          <h2 style={{ fontSize: "30px", marginTop: "8px" }}>
            {loading ? "…" : (stats.rank == null ? "—" : `#${stats.rank}`)}
          </h2>
        </div>

        <div className="glass-card">
          <p style={{ color: "var(--text-muted)" }}>Streak 🔥</p>
          <h2 style={{ fontSize: "30px", marginTop: "8px" }}>
            {loading ? "…" : `${stats.streak} Days`}
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
  <LineChart
    data={performanceData}
    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
  >
    {/* Horizontal lines only */}
    <CartesianGrid
      stroke="rgba(255,255,255,0.08)"
      vertical={false}
    />

    <XAxis
      dataKey="day"
      stroke="#a1a1aa"
    />

<YAxis
  stroke="#a1a1aa"
  allowDecimals={false}
  domain={[0, yAxisMax]}
  ticks={Array.from({ length: yAxisMax + 1 }, (_, i) => i)}
/>

    <Tooltip
      contentStyle={{
        backgroundColor: "#1e1e25",
        border: "none",
        borderRadius: "12px",
      }}
      formatter={(value) => `${value} questions`}
    />

<Line
  type="linear"
  dataKey="questions"
  stroke="#8b5cf6"
  strokeWidth={3}
  dot={{ r: 5 }}
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