const LevelCard = ({ level, progress, totalXP }) => {
  return (
    <div className="glass-card level-expanded">
      <style>{`
        .level-expanded {
          padding: 24px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .level-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .level-number {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .xp-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-primary); /* High contrast */
        }
        .progress-container {
          height: 12px;
          background: var(--bg-elevated);
          border-radius: 10px;
          width: 100%;
        }
        .progress-fill {
          height: 100%;
          border-radius: 10px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        }
      `}</style>

      <div className="level-info">
        <div>
          <span className="muted">Current Status</span>
          <div className="level-number">Level {level}</div>
        </div>
        <div className="xp-text">{totalXP} Total XP</div>
      </div>

      <div className="progress-container">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
         <span className="muted" style={{fontSize: '11px'}}>{progress}% Completed</span>
         <span className="muted" style={{fontSize: '11px'}}>{100 - progress} XP to Level {level + 1}</span>
      </div>
    </div>
  );
};

export default LevelCard;