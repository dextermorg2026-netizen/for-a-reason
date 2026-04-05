const Achievements = ({ stats, totalXP }) => {
  const badges = [
    {
      title: "Getting Started",
      icon: "start",
      colorClass: "text-tertiary",
      bgClass: "bg-tertiary/10",
      unlocked: stats.quizzes >= 5,
      status: stats.quizzes >= 5 ? "Completed" : `${stats.quizzes}/5 quizzes`,
    },
    {
      title: "Rising Star",
      icon: "auto_awesome",
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      unlocked: totalXP >= 100,
      status: totalXP >= 100 ? "Completed" : `${totalXP}/100 XP`,
    },
    {
      title: "Consistency Pro",
      icon: "repeat",
      colorClass: "text-secondary",
      bgClass: "bg-secondary/10",
      unlocked: stats.streak >= 5,
      status: stats.streak >= 5 ? "Completed" : `${stats.streak}/5 day streak`,
    },
    {
      title: "Wealthy Learner",
      icon: "payments",
      colorClass: "text-primary-container",
      bgClass: "bg-primary-container/10",
      unlocked: stats.coins >= 300,
      status: stats.coins >= 300 ? "Completed" : `${stats.coins}/300 coins`,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-headline text-lg font-semibold uppercase tracking-widest text-on-surface flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-tertiary">military_tech</span>
        Achievements
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`p-4 bg-surface-container-lowest border rounded-lg flex items-center gap-3 transition-all ${
              badge.unlocked ? "border-outline-variant/30 opacity-100" : "border-outline-variant/10 opacity-50 grayscale"
            }`}
          >
            <div className={`w-10 h-10 rounded flex items-center justify-center ${badge.bgClass} ${badge.colorClass}`}>
              <span className="material-symbols-outlined">{badge.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                {badge.title}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-medium">
                {badge.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;