const ContinueLearningCard = ({ subject, onResume }) => {
  const progress = subject?.progress ?? 0;

  return (
    <div className="bg-surface-container-low asymmetric-card hud-border p-8 md:p-12 relative overflow-hidden group">
      {/* Background Graphic */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <span className="material-symbols-outlined text-2xl">auto_stories</span>
            </div>
            <div>
              <p className="font-headline text-[10px] font-semibold text-slate-500 uppercase tracking-[0.3em]">Operational Sector</p>
              <h3 className="font-headline font-bold text-2xl md:text-3xl text-on-surface uppercase tracking-tight">
                {subject?.title || "UNRESOLVED_PROTOCOL"}
              </h3>
            </div>
          </div>

          <p className="font-body text-slate-400 text-sm md:text-base leading-relaxed max-w-xl uppercase tracking-wider mb-8">
            {subject?.description || "Awaiting further mission parameters... Access the core documentation to continue intelligence gathering."}
          </p>

          <div className="space-y-3 max-w-md">
            <div className="flex justify-between items-end">
              <span className="font-headline text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Progress Data</span>
              <span className="font-headline text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
              <div 
                className="h-full bg-primary shadow-[0_0_15px_rgba(183,109,255,0.6)] transition-all duration-1000 ease-[cubic-bezier(0.2,1,0.3,1)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 min-w-[200px]">
          <button 
            onClick={onResume}
            className="w-full py-5 bg-primary text-on-primary font-headline font-bold text-sm uppercase tracking-[0.2em] asymmetric-card shadow-[0_0_30px_rgba(183,109,255,0.4)] hover:scale-[1.02] transition-transform active:scale-95"
          >
            Deploy Now
          </button>
          <p className="text-[10px] font-headline font-semibold text-slate-600 uppercase tracking-widest animate-pulse">
            Ready for execution
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContinueLearningCard;