const LeaderboardTable = ({ entries = [], currentUserId, loading }) => {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4edea3]"></span>
          <h2 className="font-headline font-semibold text-lg tracking-widest uppercase">Operational Ranking</h2>
        </div>
        <div className="text-[10px] font-headline text-slate-500 tracking-[0.2em] uppercase">
          Live Update: Simulation Root
        </div>
      </div>

      <div className="bg-surface-container-lowest/40 backdrop-blur-md overflow-hidden border border-white/10 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.5),_inset_0_1px_2px_rgba(255,255,255,0.05)] overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-headline uppercase tracking-widest animate-pulse">
            RETRIEVING_DATABASE_ENTRIES...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-headline uppercase tracking-widest">
            NO_ENTRIES_FOUND_IN_SECTOR
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-semibold font-headline">
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Operator</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Accuracy</th>
                <th className="px-6 py-4 text-right">Protocol Coins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((user, idx) => {
                const isCurrentUser = user.userId === currentUserId || user.id === currentUserId;
                const rank = idx + 1;
                const progress = 50 + (Math.random() * 40); // Simulated accuracy

                return (
                  <tr 
                    key={user.id || idx} 
                    className={`transition-colors group ${isCurrentUser ? 'bg-primary/10 border-l-4 border-primary shadow-[inset_4px_0_0_0_#ddb7ff]' : 'hover:bg-white/5 border-l-4 border-transparent hover:border-slate-700'}`}
                  >
                    <td className={`px-6 py-4 font-headline font-semibold ${isCurrentUser ? 'text-primary' : 'text-slate-400'}`}>
                      #{rank.toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded border overflow-hidden bg-surface ${isCurrentUser ? 'border-primary/40' : 'border-white/10'}`}>
                          <img 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'OP')}&background=random`} 
                          />
                        </div>
                        <span className={`font-body text-sm ${isCurrentUser ? 'font-semibold text-primary' : 'font-medium text-on-surface'}`}>
                          {user.name || "UNKNOWN_OPERATOR"} {isCurrentUser && "(YOU)"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-headline font-semibold border rounded uppercase tracking-tighter ${rank <= 3 ? 'border-secondary/30 text-secondary' : 'border-slate-500/30 text-slate-500'}`}>
                        {rank <= 3 ? 'Active' : 'Standby'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isCurrentUser ? 'bg-primary' : rank % 2 === 0 ? 'bg-secondary' : 'bg-tertiary'}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-headline font-semibold ${isCurrentUser ? 'text-primary' : rank % 2 === 0 ? 'text-secondary' : 'text-tertiary'}`}>
                        {(user.coins || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="bg-surface-container-lowest p-4 flex justify-between items-center text-[10px] font-headline uppercase tracking-[0.3em] text-slate-600">
          <span>SYNCING PROTOCOL NODES...</span>
          <div className="flex gap-1">
            <span className="w-1 h-3 bg-secondary/50"></span>
            <span className="w-1 h-3 bg-secondary/30"></span>
            <span className="w-1 h-3 bg-secondary/10"></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardTable;