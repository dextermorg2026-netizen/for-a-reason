import React from 'react';

const StatsSection = ({ loading, stats, animatedCoins }) => {
  return (
    <div className="stats-bar-wrapper">
      <style>{`
        .stats-bar-wrapper {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
        }
        .stat-tile {
          padding: 16px 20px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        [data-theme='dark'] .stat-tile {
          background: rgba(30, 30, 45, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .stat-tile:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.8);
        }
        [data-theme='dark'] .stat-tile:hover {
          background: rgba(45, 45, 65, 0.7);
        }
        .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 700; }
        .stat-value { font-size: 20px; font-weight: 800; margin-top: 4px; color: var(--text-primary); }
        
        @media (max-width: 768px) {
          .stats-bar-wrapper { grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>
      
      <div className="stat-tile">
        <div className="stat-label">Total Coins</div>
        <div className="stat-value">💰 {loading ? "..." : animatedCoins}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-label">Global Rank</div>
        <div className="stat-value"># {loading ? "..." : stats.rank || "—"}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-label">Current Streak</div>
        <div className="stat-value">🔥 {loading ? "..." : stats.streak} Days</div>
      </div>
    </div>
  );
};
export default StatsSection;