const PodiumCard = ({ user, rank, getInitials, large }) => {
    const size = large ? 130 : 100;
  
    const rankColor =
      rank === 1
        ? "#facc15"
        : rank === 2
        ? "#94a3b8"
        : "#fb923c";
  
    return (
      <div className={`podium-card ${large ? "large" : ""}`}>
        <div
          className="podium-avatar-wrapper"
          style={{ width: size, height: size }}
        >
          {rank === 1 && <div className="podium-crown">👑</div>}
  
          <div
            className="podium-avatar"
            style={{
              width: size,
              height: size,
              fontSize: large ? 34 : 24,
              border: `4px solid ${rankColor}`,
            }}
          >
            {getInitials(user?.name)}
          </div>
  
          <div
            className="podium-rank-badge"
            style={{ background: rankColor, color: "black" }}
          >
            {rank}
          </div>
        </div>
  
        <div className="glass-card podium-info-card">
          <h3>{user?.name || "Unknown"}</h3>
  
          {/* 🔥 NOW USING COINS */}
          <p className="podium-score">
            🪙 {user?.coins ?? 0} Coins
          </p>
        </div>
      </div>
    );
  };
  
  export default PodiumCard;