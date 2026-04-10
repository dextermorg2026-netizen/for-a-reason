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

  // For Continue Learning button (placeholder - can be enhanced with actual last subject)


  // =========================
  // Render
  // =========================

  return (
    <main className="pb-12 px-6 lg:px-10 bg-background">
      <div className="w-full space-y-8">
        {/* Hero Greeting Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl font-semibold tracking-tight text-on-surface">
              Hi {firstName}! 🚀
            </h1>
            <p className="font-headline uppercase text-sm tracking-[0.2em] text-secondary mt-3">
              MASTERING COMPLEXITY, ONE LOOP AT A TIME.
            </p>
          </div>
          <button 
            onClick={() => navigate("/subjects")}
            className="flex items-center gap-3 px-6 py-4 bg-surface-container-high border-b-2 border-secondary text-secondary font-headline font-semibold uppercase tracking-widest text-xs hover:bg-secondary hover:text-on-secondary transition-all group"
          >
            <span>Continue Learning</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </section>

        {/* Tactical Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Coins */}
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <p className="uppercase tracking-widest text-on-surface-variant font-headline text-[10px]">Total Coins</p>
              <span className="material-symbols-outlined text-primary text-3xl">monetization_on</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-headline font-semibold text-primary">{animatedCoins}</h2>
            </div>
          </div>

          {/* Global Rank */}
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <p className="uppercase tracking-widest text-on-surface-variant font-headline text-[10px]">Global Rank</p>
              <span className="material-symbols-outlined text-secondary text-3xl">military_tech</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-headline font-semibold text-secondary">#{stats.rank || "--"}</h2>
              <span className="text-[10px] text-secondary/60 font-mono">Top 1%</span>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-error relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <p className="uppercase tracking-widest text-on-surface-variant font-headline text-[10px]">Current Streak</p>
              <span className="material-symbols-outlined text-error text-3xl">local_fire_department</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-headline font-semibold text-error">{stats.streak}</h2>
              <span className="text-[10px] text-slate-500 font-mono">Days Active</span>
            </div>
          </div>

          {/* Quizzes Done */}
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-tertiary relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <p className="uppercase tracking-widest text-on-surface-variant font-headline text-[10px]">Quizzes Done</p>
              <span className="material-symbols-outlined text-tertiary text-3xl">task_alt</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-headline font-semibold text-tertiary">{stats.quizzes}</h2>
              <span className="text-[10px] text-slate-500 font-mono">Attempted</span>
            </div>
          </div>
        </section>

        {/* Middle Row: Progression & Chart */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Level Progression Card - Bigger Size */}
          <div className="lg:col-span-5 bg-background p-12 rounded-tl-[3rem] rounded-br-[3rem] flex flex-col justify-between border border-white/5 relative min-h-[440px] shadow-[inset_0_0_40px_rgba(221,183,255,0.02)]">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <h3 className="font-headline font-bold text-4xl uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary drop-shadow-sm">Level {level}</h3>
                <div className="bg-primary/10 text-primary px-5 py-2.5 text-sm font-headline font-semibold tracking-widest uppercase border border-primary/30 rounded-xl">Novice</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-headline uppercase tracking-widest text-on-surface-variant">
                  <span>{progress}% Complete</span>
                  <span className="text-primary">{100 - progress}% XP to Level {level + 1}</span>
                </div>
                <div className="h-4 bg-surface-container-lowest rounded-full overflow-hidden p-[2px] border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full primary-glow transition-all duration-700" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <p className="text-xs uppercase font-headline text-slate-500 mb-2">Total XP</p>
                <p className="font-headline font-semibold text-2xl text-on-surface">{totalXP.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <p className="text-xs uppercase font-headline text-slate-500 mb-2">Skill Rating</p>
                <p className="font-headline font-semibold text-2xl text-secondary">A+</p>
              </div>
            </div>
          </div>

          {/* Weekly Performance Telemetry - Bar Chart */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-8 relative border border-white/5 overflow-hidden flex flex-col min-h-[440px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-headline font-semibold text-xl uppercase">Performance Telemetry</h3>
                <p className="text-[10px] text-on-surface-variant font-mono">STREAMING LIVE DATA... UNIT: SCORE_PCT</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-secondary/10 border border-secondary/30 text-secondary text-[10px] font-semibold uppercase tracking-widest">7 Days</span>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <WeeklyPerformance performanceData={performanceData} />
            </div>
          </div>
        </section>

        {/* Activity Heatmap & Achievements Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Activity Heatmap */}
          <div className="lg:col-span-7 bg-surface-container-low p-6 rounded-xl border border-white/5">
            <ActivityHeatmap 
              last28={last28} 
              loading={loading} 
              hoverInfo={hoverInfo} 
              setHoverInfo={setHoverInfo} 
            />
          </div>

          {/* Achievement Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-headline font-semibold text-slate-500 uppercase tracking-[0.3em] mb-3">Protocol Ribbons</p>
              <h3 className="font-headline font-bold text-2xl uppercase tracking-widest text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">military_tech</span>
                Achievements
              </h3>
            </div>
            <Achievements stats={stats} totalXP={totalXP} />
            <p className="text-[10px] font-headline uppercase font-semibold text-slate-500 self-start tracking-widest mt-2">
              All combat protocols engaged. Standby for new directives.
            </p>
          </div>
        </section>
      </div>

      {/* Footer Decoration Line */}
      <footer className="fixed bottom-0 left-64 right-0 h-1 bg-gradient-to-r from-primary/0 via-secondary/40 to-primary/0 pointer-events-none"></footer>

      {error && (
        <div className="mt-6 p-4 bg-error-container/20 border border-error/50 text-error rounded-lg">
          {error}
        </div>
      )}
    </main>
  );
};

export default Dashboard;
