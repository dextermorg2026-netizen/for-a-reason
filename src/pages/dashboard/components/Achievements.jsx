const Achievements = ({ stats, totalXP }) => {
  const badges = [
    {
      title: "Getting Started",
      icon: "🚀",
      unlocked: stats.quizzes >= 5,
      progress: `${stats.quizzes}/5 quizzes`,
    },
    {
      title: "Rising Star",
      icon: "⭐",
      unlocked: totalXP >= 100,
      progress: `${totalXP}/100 XP`,
    },
    {
      title: "Consistency Pro",
      icon: "🔥",
      unlocked: stats.streak >= 5,
      progress: `${stats.streak}/5 day streak`,
    },
    {
      title: "High Scorer",
      icon: "🏆",
      unlocked: stats.score >= 300,
      progress: `${stats.score}/300 score`,
    },
  ];

  return (
    <div className="glass-card achievements-card">
      <div className="achievements-header">
        <h3>Achievements</h3>
        <p className="achievements-subtitle">
          Unlock milestones as you grow
        </p>
      </div>

      <div className="achievements-grid">
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`achievement-item ${
              badge.unlocked
                ? "achievement-unlocked"
                : "achievement-locked"
            }`}
          >
            <div className="achievement-icon">
              {badge.icon}
            </div>

            <div className="achievement-label">
              {badge.title}
            </div>

            {!badge.unlocked ? (
              <div className="achievement-progress">
                {badge.progress}
              </div>
            ) : (
              <div className="achievement-unlocked-text">
                Unlocked 🎉
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;