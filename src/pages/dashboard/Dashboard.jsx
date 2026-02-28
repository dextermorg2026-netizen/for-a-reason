import { useEffect, useState } from "react";
import { useXP } from "../../context/XPContext";
import { useAuth } from "../../context/AuthContext";
import { getGlobalScore } from "../../services/statsService";
import "./Dashboard.css";
import {
  getUserStreak,
  getWeeklyStats,
  getCurrentWeekStats,
  getLast28DaysActivity,
} from "../../services/streakService";
import { getGlobalLeaderboard } from "../../services/leaderboardService";

import StatsSection from "./components/StatsSection";
import LevelCard from "./components/LevelCard";
import WeeklyPerformance from "./components/WeeklyPerformance";
import ActivityHeatmap from "./components/ActivityHeatmap";
import Achievements from "./components/Achievements";

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
  const [last28, setLast28] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
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

        const [score, streak, weekly, currentWeek, last28Raw, leaderboard] =
          await Promise.all([
            getGlobalScore(currentUser.uid),
            getUserStreak(currentUser.uid),
            getWeeklyStats(currentUser.uid),
            getCurrentWeekStats(currentUser.uid),
            getLast28DaysActivity(currentUser.uid),
            getGlobalLeaderboard(),
          ]);

        const safeWeekly = Array.isArray(weekly) ? weekly : [];
        const quizzes = safeWeekly.reduce(
          (sum, n) => sum + (Number(n) || 0),
          0
        );

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

        const defaultFiveDays = [
          { day: "Mon", questions: 0 },
          { day: "Tue", questions: 0 },
          { day: "Wed", questions: 0 },
          { day: "Thu", questions: 0 },
          { day: "Fri", questions: 0 },
          { day: "Sat", questions: 0 },
          { day: "Sun", questions: 0 },
        ];

        const safeCurrentWeek = Array.isArray(currentWeek)
          ? currentWeek
          : [];

        if (safeCurrentWeek.length) {
          const formatted = defaultFiveDays.map((d, index) => ({
            day: d.day,
            questions:
              Number(safeCurrentWeek[index]?.questions) || 0,
          }));
          setPerformanceData(formatted);
        } else {
          setPerformanceData(defaultFiveDays);
        }

        if (Array.isArray(last28Raw) && last28Raw.length === 28) {
          setLast28(
            last28Raw.map((d) => ({
              date: d.date,
              count: Number(d.count) || 0,
            }))
          );
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

  useEffect(() => {
    const target = Number(stats.score) || 0;
    let start = 0;
    setAnimatedScore(0);

    if (target <= 0) return;

    const step = Math.max(1, Math.ceil(target / 120));
    const interval = setInterval(() => {
      start = Math.min(target, start + step);
      if (start >= target) clearInterval(interval);
      setAnimatedScore(start);
    }, 15);

    return () => clearInterval(interval);
  }, [stats.score]);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Track your performance & roadmap
      </p>

      {error && (
        <div className="glass-card" style={{ marginTop: 30, color: "#ef4444" }}>
          {error}
        </div>
      )}

      <StatsSection
        loading={loading}
        stats={stats}
        animatedScore={animatedScore}
      />

      <LevelCard
        level={level}
        progress={progress}
        totalXP={totalXP}
      />

      <WeeklyPerformance performanceData={performanceData} />

      <ActivityHeatmap
        last28={last28}
        loading={loading}
        hoverInfo={hoverInfo}
        setHoverInfo={setHoverInfo}
      />

      <Achievements stats={stats} totalXP={totalXP} />
    </div>
  );
};

export default Dashboard;