import { useEffect, useState } from "react";

const LeaderboardPage = () => {
  const currentUser = "You";

  const users = [
    { name: "Alice", score: 950 },
    { name: "Bob", score: 870 },
    { name: "Charlie", score: 820 },
    { name: "You", score: 780 },
    { name: "David", score: 720 },
    { name: "Eva", score: 680 },
  ];

  const sorted = [...users].sort((a, b) => b.score - a.score);

  return (
    <div>
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-subtitle">
        Compete and climb the rankings
      </p>

      {/* ===== PODIUM ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          marginTop: "60px",
          alignItems: "flex-end",
        }}
      >
        {/* 2nd Place */}
        {sorted[1] && (
          <PodiumCard
            position={2}
            user={sorted[1]}
            height="140px"
            color="#c0c0c0"
          />
        )}

        {/* 1st Place */}
        {sorted[0] && (
          <PodiumCard
            position={1}
            user={sorted[0]}
            height="180px"
            color="#ffd700"
          />
        )}

        {/* 3rd Place */}
        {sorted[2] && (
          <PodiumCard
            position={3}
            user={sorted[2]}
            height="120px"
            color="#cd7f32"
          />
        )}
      </div>

      {/* ===== RANK LIST ===== */}
      <div style={{ marginTop: "60px" }}>
        {sorted.map((user, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderRadius: "12px",
              marginBottom: "10px",
              background:
                user.name === currentUser
                  ? "rgba(139,92,246,0.2)"
                  : "rgba(255,255,255,0.04)",
              fontWeight:
                user.name === currentUser ? 600 : 400,
            }}
          >
            <div>
              #{index + 1} {user.name}
            </div>
            <div>{user.score} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PodiumCard = ({ position, user, height, color }) => {
  return (
    <div
      style={{
        width: "120px",
        height: height,
        background: color,
        borderRadius: "16px 16px 0 0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "12px",
        color: "#000",
        fontWeight: 600,
      }}
    >
      <div style={{ fontSize: "20px" }}>#{position}</div>
      <div style={{ fontSize: "14px" }}>{user.name}</div>
      <div style={{ fontSize: "12px" }}>{user.score}</div>
    </div>
  );
};

export default LeaderboardPage;