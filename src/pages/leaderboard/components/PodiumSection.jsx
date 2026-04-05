const PodiumSection = ({ topThree = [] }) => {
  const getAvatar = (user, rank) => {
    if (user?.photoURL) return user.photoURL;
    // Fallbacks from design or based on rank
    if (rank === 1) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;
    if (rank === 2) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;
  };

  return (
    <section className="mb-16">
      <div className="grid grid-cols-3 gap-4 md:gap-8 items-end max-w-4xl mx-auto px-4">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-400/50 p-1 bg-surface-container-low overflow-hidden">
              <img 
                alt="2nd Place" 
                className="w-full h-full object-cover grayscale"
                src={getAvatar(topThree[1], 2)} 
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-surface px-3 py-0.5 text-[10px] font-headline font-semibold rounded-full">
              2ND
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-semibold text-slate-300 uppercase tracking-tight text-xs md:text-sm">
              {topThree[1]?.name || "OPERATOR_02"}
            </h3>
            <div className="flex items-center justify-center gap-1 text-secondary mt-1">
              <span className="material-symbols-outlined text-xs md:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-headline font-medium text-base md:text-lg">{(topThree[1]?.coins || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-24 md:h-32 mt-6 glass-panel asymmetric-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-400/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-400/50"></div>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary p-1 bg-surface-container-low overflow-hidden shadow-[0_0_30px_rgba(183,109,255,0.3)]">
              <img 
                alt="1st Place" 
                className="w-full h-full object-cover"
                src={getAvatar(topThree[0], 1)} 
              />
            </div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
              <span className="material-symbols-outlined text-primary text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 text-[10px] md:text-xs font-headline font-semibold rounded-full">
              CHAMPION
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-semibold text-on-surface text-sm md:text-xl uppercase tracking-widest">
              {topThree[0]?.name || "SYSTEM_LORD"}
            </h3>
            <div className="flex items-center justify-center gap-2 text-primary mt-1">
              <span className="material-symbols-outlined text-xs md:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-headline font-semibold text-lg md:text-2xl">{(topThree[0]?.coins || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-36 md:h-48 mt-8 glass-panel asymmetric-card relative overflow-hidden shadow-[0_0_40px_rgba(183,109,255,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-primary shadow-[0_0_15px_rgba(183,109,255,0.5)]"></div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-tertiary/50 p-1 bg-surface-container-low overflow-hidden">
              <img 
                alt="3rd Place" 
                className="w-full h-full object-cover grayscale"
                src={getAvatar(topThree[2], 3)} 
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-tertiary text-on-tertiary px-3 py-0.5 text-[10px] font-headline font-semibold rounded-full">
              3RD
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-semibold text-slate-300 uppercase tracking-tight text-xs md:text-sm">
              {topThree[2]?.name || "OPERATOR_03"}
            </h3>
            <div className="flex items-center justify-center gap-1 text-tertiary mt-1">
              <span className="material-symbols-outlined text-xs md:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-headline font-medium text-base md:text-lg">{(topThree[2]?.coins || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-16 md:h-24 mt-6 glass-panel asymmetric-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-tertiary/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary/50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PodiumSection;