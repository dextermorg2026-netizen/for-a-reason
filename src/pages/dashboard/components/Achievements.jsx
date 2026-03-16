import React from 'react';

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
      title: "Wealthy Learner",
      icon: "🏆",
      unlocked: stats.coins >= 300,
      progress: `${stats.coins}/300 coins`,
    },
  ];

  return (
    <>
      <style>
        {`
          .achievements-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            font-family: inherit;
            color: var(--text-primary);
          }

          .achievements-header h3 {
            margin: 0;
            font-size: 1.1rem;
            color: var(--accent-primary);
          }

          .achievements-subtitle {
            margin: 4px 0 15px 0;
            font-size: 0.8rem;
            color: var(--text-muted);
          }

          .achievements-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .achievement-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.5);
            transition: 0.3s ease;
            color: var(--text-primary);
          }

          .achievement-locked {
            filter: grayscale(1);
            opacity: 0.6;
            border: 1px dashed #d1d1d1;
          }

          .achievement-unlocked {
            background: var(--bg-surface);
            border: 1px solid var(--accent-primary);
            box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);
          }

          .achievement-icon {
            font-size: 1.5rem;
          }

          .achievement-info {
            display: flex;
            flex-direction: column;
          }

          .achievement-label {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .achievement-progress, .achievement-unlocked-text {
            font-size: 0.65rem;
            margin-top: 2px;
          }

          .achievement-unlocked-text {
            color: var(--accent-primary);
            font-weight: 600;
          }

          .achievement-progress {
            color: var(--text-muted);
          }
        `}
      </style>

      <div className="achievements-card">
        <div className="achievements-header">
          <h3>Achievements</h3>
          <p className="achievements-subtitle">Milestones</p>
        </div>
        <div className="achievements-grid">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`achievement-item ${
                badge.unlocked ? "achievement-unlocked" : "achievement-locked"
              }`}
            >
              <div className="achievement-icon">{badge.icon}</div>
              <div className="achievement-info">
                <div className="achievement-label">{badge.title}</div>
                {!badge.unlocked ? (
                  <div className="achievement-progress">{badge.progress}</div>
                ) : (
                  <div className="achievement-unlocked-text">Unlocked 🎉</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Achievements;