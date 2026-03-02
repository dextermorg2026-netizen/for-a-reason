import { useEffect, useState } from "react";

const LevelCard = ({ level, progress, totalXP }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 150);

    return () => clearTimeout(timeout);
  }, [progress]);

  const xpRemaining = Math.max(0, 100 - progress);
  const isClose = progress >= 80 && progress < 100;
  const leveledUp = progress >= 100;

  const motivationalText = leveledUp
    ? "Level up achieved 🎉"
    : isClose
    ? "🔥 You're almost there!"
    : "Keep progressing to unlock the next level";

  return (
    <div
      className={`glass-card level-card ${
        isClose ? "level-close" : ""
      } ${leveledUp ? "level-complete" : ""}`}
    >
      <div className="level-header">
        <div>
          <h3>Level {level}</h3>
          <p className="level-motivation">
            {motivationalText}
          </p>
        </div>

        <div className="level-badge">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="level-xp">
        {totalXP} XP
      </div>

      <div className="level-progress-bar">
        <div
          className="level-progress-fill"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {!leveledUp && (
        <p className="muted level-meta">
          {xpRemaining} XP to reach Level {level + 1}
        </p>
      )}
    </div>
  );
};

export default LevelCard;