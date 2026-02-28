const StatsSection = ({ loading, stats, animatedScore }) => {
  return (
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
          {loading ? "…" : stats.rank == null ? "—" : `#${stats.rank}`}
        </h2>
      </div>

      <div className="glass-card">
        <p style={{ color: "var(--text-muted)" }}>Streak 🔥</p>
        <h2 style={{ fontSize: "30px", marginTop: "8px" }}>
          {loading ? "…" : `${stats.streak} Days`}
        </h2>
      </div>
    </div>
  );
};

export default StatsSection;