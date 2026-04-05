const SubjectCard = ({ subject, onClick }) => {
  const progress = subject?.progress ?? 0;

  const getIcon = (title) => {
    const t = title?.toLowerCase() || "";
    if (t.includes("math")) return "calculate";
    if (t.includes("science")) return "science";
    if (t.includes("history")) return "history_edu";
    if (t.includes("tech") || t.includes("computer")) return "terminal";
    return "menu_book";
  };

  return (
    <div
      className="group relative bg-surface-container-low asymmetric-card hud-border p-6 cursor-pointer hover:shadow-[0_0_25px_rgba(183,109,255,0.1)] transition-all duration-300"
      onClick={onClick}
    >
      <div className="absolute top-4 right-4 text-[8px] font-headline text-slate-600 uppercase tracking-widest font-semibold">
        OBJ_0{subject.id.slice(-2).toUpperCase()}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-surface-container-lowest rounded border border-white/5 flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl">{getIcon(subject.title)}</span>
        </div>
        <div>
          <h3 className="font-headline font-semibold text-sm text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">
            {subject?.title || "UNTITLED_SECTOR"}
          </h3>
          <p className="font-headline text-[9px] text-slate-500 uppercase tracking-[0.2em]">
            Protocol Status: {progress >= 100 ? "Sync Complete" : progress > 0 ? "In Progress" : "Pending"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="font-headline text-[8px] font-semibold text-slate-600 uppercase tracking-widest">Efficiency</span>
          <span className="font-headline text-[10px] font-semibold text-on-surface">{progress}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${progress >= 100 ? 'bg-secondary' : 'bg-primary/50'}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
        <span className="font-headline text-[10px] text-on-surface font-semibold uppercase tracking-widest">
          {progress >= 100 ? "Review Protocol" : "Launch Mission"}
        </span>
        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </div>
  );
};

export default SubjectCard;