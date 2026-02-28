const LevelCard = ({ level, progress, totalXP }) => {
  return (
    <div className="glass-card" style={{ marginTop: "40px" }}>
      <h3>Level Progression</h3>

      <div
        style={{
          marginTop: "15px",
          padding: "10px 18px",
          display: "inline-block",
          borderRadius: "20px",
          background: "linear-gradient(90deg,#8b5cf6,#6366f1)",
          color: "white",
          fontWeight: 600,
        }}
      >
        Level {level}
      </div>

      <p style={{ marginTop: "10px" }}>{totalXP} XP</p>

      <div
        style={{
          height: "8px",
          background: "#e5e7eb",
          borderRadius: "6px",
          marginTop: "15px",
        }}
      >
        <div
          style={{
            height: "8px",
            width: `${progress}%`,
            background: "linear-gradient(90deg,#6366f1,#4f46e5)",
            borderRadius: "6px",
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <p className="muted" style={{ marginTop: "8px" }}>
        {100 - progress} XP to next level
      </p>
    </div>
  );
};

export default LevelCard;