import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useXP } from "../../context/XPContext";
import { useAuth } from "../../context/AuthContext";
import { getGlobalCoins } from "../../services/statsService";
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { level, progress, totalXP } = useXP();

  const [stats, setStats] = useState({
    coins: 0,
    rank: null,
    quizzes: 0,
    streak: 0,
  });

  const [performanceData, setPerformanceData] = useState([]);
  const [last28, setLast28] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animatedCoins, setAnimatedCoins] = useState(0);

  // =========================
  // Data Load
  // =========================

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

        const [coins, streak, weekly, currentWeek, last28Raw, leaderboard] =
          await Promise.all([
            getGlobalCoins(currentUser.uid),
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
          coins: Number(coins) || 0,
          rank,
          quizzes,
          streak: Number(streak) || 0,
        });

        const defaultWeek = [
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
          const formatted = defaultWeek.map((d, index) => ({
            day: d.day,
            questions:
              Number(safeCurrentWeek[index]?.questions) || 0,
          }));
          setPerformanceData(formatted);
        } else {
          setPerformanceData(defaultWeek);
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

  // =========================
  // Animated Coins
  // =========================

  useEffect(() => {
    const target = Number(stats.coins) || 0;
    let start = 0;
    setAnimatedCoins(0);

    if (target <= 0) return;

    const step = Math.max(1, Math.ceil(target / 120));

    const interval = setInterval(() => {
      start = Math.min(target, start + step);
      if (start >= target) clearInterval(interval);
      setAnimatedCoins(start);
    }, 15);

    return () => clearInterval(interval);
  }, [stats.coins]);

  // =========================
  // Derived UI Logic
  // =========================

  const firstName =
    currentUser?.displayName?.split(" ")[0] || "Learner";

  const streakMessage =
    stats.streak >= 3
      ? `You're on a ${stats.streak} day streak 🔥`
      : stats.streak > 0
      ? `Keep going! ${stats.streak} day streak 💪`
      : "Start your streak today 🚀";

  // =========================
  // Render
  // =========================

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* MAIN BENTO GRID */}
        <div className="dashboard-bento">
          
          {/* HERO & LEVEL SECTION */}
          <div className="bento-item hero-section">
            <div className="glass-card hero-card">
               <h1 className="hero-title">Hi {firstName}! 🚀</h1>
               <p className="hero-subtitle">{streakMessage}</p>
               <button className="btn-primary hero-cta" onClick={() => navigate("/subjects")}>
                 Continue Learning
               </button>
            </div>
            <LevelCard level={level} progress={progress} totalXP={totalXP} />
          </div>

          {/* PERFORMANCE CHART */}
          <div className="bento-item performance-section">
            <WeeklyPerformance performanceData={performanceData} />
          </div>

          {/* STATS STRIP */}
          <div className="bento-item stats-section">
            <StatsSection loading={loading} stats={stats} animatedCoins={animatedCoins} />
          </div>

          {/* ACTIVITY HEATMAP */}
          <div className="bento-item heatmap-section">
            <ActivityHeatmap 
              last28={last28} 
              loading={loading} 
              hoverInfo={hoverInfo} 
              setHoverInfo={setHoverInfo} 
            />
          </div>

          {/* ACHIEVEMENTS */}
          <div className="bento-item achievements-section">
            <Achievements stats={stats} totalXP={totalXP} />
          </div>

        </div>

        {error && <div className="glass-card dashboard-error">{error}</div>}
      </div>
    </div>
  );
};

export default Dashboard;