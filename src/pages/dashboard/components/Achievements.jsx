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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`p-6 bg-surface-container-lowest/50 border rounded-xl flex flex-col justify-between min-h-[140px] transition-all relative overflow-hidden group ${
              badge.unlocked ? "border-outline-variant/30 text-on-surface" : "border-outline-variant/10 text-slate-600 grayscale bg-black/20"
            }`}
          >
            <div className={`text-3xl ${badge.unlocked ? badge.colorClass : "text-slate-600"}`}>
              <span className="material-symbols-outlined text-4xl">{badge.icon}</span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-headline font-bold uppercase tracking-widest mb-1">
                {badge.title}
              </p>
              <p className={`text-[10px] font-mono uppercase font-semibold ${badge.unlocked ? "text-secondary" : "text-slate-600"}`}>
                {badge.status}
              </p>
            </div>
            {/* Minimal scanline effect for locked achievements */}
            {!badge.unlocked && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] animate-scanline pointer-events-none"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;