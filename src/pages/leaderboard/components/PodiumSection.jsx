const PodiumSection = ({ topThree = [] }) => {
  const getAvatar = (user, rank) => {
    if (user?.photoURL) return user.photoURL;
    // Fallbacks from design or based on rank
    if (rank === 1) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;
    if (rank === 2) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;
  };

  return (
    <section className="mb-16 mt-16">
      <div className="grid grid-cols-3 gap-2 md:gap-8 items-end max-w-5xl mx-auto px-4">
        {/* 2nd Place - SILVER NEON */}
        <div className="flex flex-col items-center order-1">
          <div className="relative mb-6 group">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-[3px] border-[#C0C0C0] p-1 bg-surface-container-low overflow-hidden transition-all group-hover:scale-105 shadow-[0_0_20px_rgba(192,192,192,0.3)] group-hover:shadow-[0_0_30px_rgba(192,192,192,0.5)]">
              <img 
                alt="2nd Place" 
                className="w-full h-full object-cover grayscale brightness-110"
                src={getAvatar(topThree[1], 2)} 
              />
            </div>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="material-symbols-outlined text-[#C0C0C0] text-3xl drop-shadow-[0_0_10px_rgba(192,192,192,0.6)]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#C0C0C0] text-black px-4 py-0.5 text-[10px] font-headline font-black rounded-full shadow-[0_0_15px_rgba(192,192,192,0.4)] uppercase tracking-widest whitespace-nowrap">
              RANK_02
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-bold text-slate-300 uppercase tracking-tight text-[10px] md:text-sm">
              {topThree[1]?.name || "SYSTEM_ADJUTANT"}
            </h3>
            <div className="flex items-center justify-center gap-1 text-[#C0C0C0] mt-1 shadow-silver-neon">
              <span className="font-headline font-bold text-sm md:text-lg">{(topThree[1]?.coins || 0).toLocaleString()}</span>
              <span className="text-[10px] font-headline font-bold opacity-60">CR</span>
            </div>
          </div>
          <div className="w-full h-24 md:h-32 mt-6 glass-panel asymmetric-card relative overflow-hidden transition-all shadow-[0_0_30px_rgba(192,192,192,0.1)] border-t border-[#C0C0C0]/40">
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#C0C0C0] shadow-[0_0_15px_rgba(192,192,192,0.6)]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#C0C0C0]/10 to-transparent"></div>
          </div>
        </div>

        {/* 1st Place - CHAMPION GOLD NEON */}
        <div className="flex flex-col items-center order-2">
          <div className="relative mb-10 group">
            {/* MEDAL AT CENTER OF HEAD */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center z-20" style={{ animationDuration: '3s' }}>
                <span className="material-symbols-outlined text-[#FFD700] text-5xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-full border-[6px] border-[#FFD700] p-1.5 bg-surface-container-low overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.4)] transition-all group-hover:scale-110 group-hover:shadow-[0_0_70px_rgba(255,215,0,0.6)] z-10 relative">
              <img 
                alt="1st Place" 
                className="w-full h-full object-cover"
                src={getAvatar(topThree[0], 1)} 
              />
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black px-8 py-1.5 text-[10px] md:text-xs font-headline font-black rounded-sm shadow-[0_0_20px_rgba(255,215,0,0.5)] uppercase tracking-[0.3em] z-20 whitespace-nowrap">
              CHAMPION
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-black text-on-surface text-sm md:text-2xl uppercase tracking-[0.2em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {topThree[0]?.name || "ADMIN_PRIME"}
            </h3>
            <div className="flex items-center justify-center gap-2 text-[#FFD700] mt-1">
              <span className="material-symbols-outlined text-base md:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <span className="font-headline font-black text-xl md:text-4xl tracking-tighter drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">{(topThree[0]?.coins || 0).toLocaleString()}</span>
              <span className="text-xs font-headline font-bold opacity-70">CREDITS</span>
            </div>
          </div>
          <div className="w-full h-40 md:h-56 mt-8 glass-panel asymmetric-card relative overflow-hidden shadow-[0_0_60px_rgba(255,215,0,0.2)] border-t-2 border-[#FFD700]/50">
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-3 bg-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.8)]"></div>
          </div>
        </div>

        {/* 3rd Place - BRONZE NEON */}
        <div className="flex flex-col items-center order-3">
          <div className="relative mb-6 group">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-[2px] border-[#CD7F32] p-1 bg-surface-container-low overflow-hidden transition-all group-hover:scale-105 shadow-[0_0_15px_rgba(205,127,50,0.3)] group-hover:shadow-[0_0_25px_rgba(205,127,50,0.5)]">
              <img 
                alt="3rd Place" 
                className="w-full h-full object-cover grayscale opacity-90"
                src={getAvatar(topThree[2], 3)} 
              />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="material-symbols-outlined text-[#CD7F32] text-2xl drop-shadow-[0_0_8px_rgba(205,127,50,0.6)]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#CD7F32] text-white px-3 py-0.5 text-[10px] font-headline font-black rounded-full shadow-[0_0_12px_rgba(205,127,50,0.4)] uppercase tracking-widest whitespace-nowrap">
              RANK_03
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-headline font-bold text-on-surface/70 uppercase tracking-tight text-[10px] md:text-xs">
              {topThree[2]?.name || "SYSTEM_OPERATIVE"}
            </h3>
            <div className="flex items-center justify-center gap-1 text-[#CD7F32] mt-1">
              <span className="font-headline font-bold text-xs md:text-sm">{(topThree[2]?.coins || 0).toLocaleString()}</span>
              <span className="text-[10px] font-headline font-bold opacity-50">CR</span>
            </div>
          </div>
          <div className="w-full h-16 md:h-24 mt-6 glass-panel asymmetric-card relative overflow-hidden transition-all shadow-[0_0_20px_rgba(205,127,50,0.1)] border-t border-[#CD7F32]/40">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#CD7F32] shadow-[0_0_10px_rgba(205,127,50,0.6)]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#CD7F32]/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PodiumSection;