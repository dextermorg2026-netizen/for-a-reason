import { useEffect, useState } from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ActivityHeatmap = ({ last28 = [], loading }) => {
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const countsArr = Array.isArray(last28) && last28.length === 28
    ? last28.map(d => typeof d === 'object' && d !== null ? d.count : d)
    : Array(28).fill(0);

  const max = Math.max(...countsArr, 1);

  function getTileClass(count) {
    if (count === 0) return "bg-white/5";
    const ratio = count / max;
    if (ratio < 0.3) return "bg-primary/40 shadow-[0_0_5px_rgba(221,183,255,0.2)]";
    if (ratio < 0.6) return "bg-[#b76dff] shadow-[0_0_10px_rgba(183,109,255,0.4)]";
    return "bg-secondary shadow-[0_0_15px_rgba(76,215,246,0.6)] animate-pulse";
  }

  function handleMouseEnter(e, cnt, i) {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      count: cnt,
      day: days[i % 7],
      x: rect.left + rect.width / 2,
      y: rect.top - 40
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-lg font-semibold uppercase tracking-widest text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          Activity
        </h2>
        <div className="flex gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-2.5 h-2.5 bg-white/5 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-primary/40 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-[#b76dff] rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-secondary rounded-sm drop-shadow-[0_0_5px_rgba(76,215,246,0.8)]"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
          {countsArr.map((cnt, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm transition-all duration-300 ${getTileClass(cnt)} ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onMouseEnter={e => handleMouseEnter(e, cnt, i)}
              onMouseLeave={() => setTooltip(null)}
              title={`${cnt} activities`}
            />
          ))}
        </div>
      </div>

      {tooltip && (
        <div 
          className="fixed z-50 px-3 py-1.5 bg-surface-container-highest border border-outline-variant/30 rounded text-[10px] font-headline font-semibold text-on-surface pointer-events-none -translate-x-1/2 shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.day.toUpperCase()}: {tooltip.count} OPS_COMPLETED
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;