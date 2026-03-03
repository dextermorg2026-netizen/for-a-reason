const StatsSection = ({ loading, stats, animatedCoins }) => {
  const streakMessage =
    stats.streak >= 5
      ? "🔥 On fire!"
      : stats.streak > 0
      ? "Keep it going 💪"
      : "Start today 🚀";

  return (
    <div className="stats-grid grid-3">

      {/* TOTAL COINS */}
      <div className="glass-card stat-card">
        <div className="stat-label">
          Total Coins
        </div>

        <div className="stat-value">
          {loading ? "…" : animatedCoins}
        </div>

        <div className="stat-meta">
          All-time performance
        </div>
      </div>

      {/* GLOBAL RANK */}
      <div className="glass-card stat-card">
        <div className="stat-label">
          Global Rank
        </div>

        <div className="stat-value">
          {loading
            ? "…"
            : stats.rank == null
            ? "—"
            : `#${stats.rank}`}
        </div>

        <div className="stat-meta">
          Among all learners
        </div>
      </div>

      {/* STREAK */}
      <div className="glass-card stat-card stat-streak">
        <div className="stat-label">
          Streak
        </div>

        <div className="stat-value">
          {loading
            ? "…"
            : `${stats.streak} Days`}
        </div>

        <div className="stat-meta">
          {streakMessage}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;