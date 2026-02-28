const Achievements = ({ stats, totalXP }) => {
  const badges = [
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
  ];

  return (
    <div className="glass-card" style={{ marginTop: "60px" }}>
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
        {badges.map((badge, index) => (
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
  );
};

export default Achievements;