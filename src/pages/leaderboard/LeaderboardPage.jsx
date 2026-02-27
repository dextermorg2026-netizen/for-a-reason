import { useState } from "react";

const LeaderboardPage = () => {
  const [selectedSubject, setSelectedSubject] =
    useState("dsa");

  const users = [
    {
      id: 1,
      name: "Rahul",
      subjects: { dsa: 45, algorithms: 30, dp: 20 },
    },
    {
      id: 2,
      name: "Ananya",
      subjects: { dsa: 60, algorithms: 40, dp: 35 },
    },
    {
      id: 3,
      name: "Vikram",
      subjects: { dsa: 35, algorithms: 50, dp: 25 },
    },
    {
      id: 4,
      name: "Sneha",
      subjects: { dsa: 80, algorithms: 60, dp: 45 },
    },
  ];

  const subjects = [
    { key: "dsa", label: "Data Structures" },
    { key: "algorithms", label: "Algorithms" },
    { key: "dp", label: "Dynamic Programming" },
  ];

  const sortedUsers = [...users].sort(
    (a, b) =>
      b.subjects[selectedSubject] -
      a.subjects[selectedSubject]
  );

  const topThree = sortedUsers.slice(0, 3);
  const others = sortedUsers.slice(3);

  const getInitials = (name) => {
    const parts = name.split(" ");
    return parts.length > 1
      ? parts[0][0] + parts[1][0]
      : parts[0][0];
  };

  return (
    <div>
      <h1 className="page-title">
        Subject Leaderboard
      </h1>

      {/* SUBJECT SELECTOR */}
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        {subjects.map((subject) => {
          const isActive =
            selectedSubject === subject.key;

          return (
            <button
              key={subject.key}
              onClick={() =>
                setSelectedSubject(subject.key)
              }
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                background: isActive
                  ? "linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))"
                  : "var(--bg-elevated)",
                color: isActive
                  ? "white"
                  : "var(--text-primary)",
                transition: "0.2s ease",
              }}
            >
              {subject.label}
            </button>
          );
        })}
      </div>

      {/* PODIUM WITH SAFE GLOW */}
      <div
        style={{
          position: "relative",
          marginTop: "80px",
        }}
      >
        {/* Ambient Glow (SAFE — does not block clicks) */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)",
            filter: "blur(80px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "70px",
            flexWrap: "wrap",
          }}
        >
          {topThree[1] && (
            <PodiumCard
              user={topThree[1]}
              rank={2}
              score={
                topThree[1].subjects[selectedSubject]
              }
              getInitials={getInitials}
            />
          )}

          {topThree[0] && (
            <PodiumCard
              user={topThree[0]}
              rank={1}
              score={
                topThree[0].subjects[selectedSubject]
              }
              getInitials={getInitials}
              large
            />
          )}

          {topThree[2] && (
            <PodiumCard
              user={topThree[2]}
              rank={3}
              score={
                topThree[2].subjects[selectedSubject]
              }
              getInitials={getInitials}
            />
          )}
        </div>
      </div>

      {/* REST USERS */}
      <div
        className="glass-card"
        style={{
          marginTop: "80px",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {others.map((user, index) => (
          <div
            key={user.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "18px 28px",
              borderBottom:
                index !== others.length - 1
                  ? "1px solid rgba(0,0,0,0.05)"
                  : "none",
              transition: "0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--bg-elevated)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "transparent")
            }
          >
            <span>
              #{index + 4} {user.name}
            </span>

            <span
              style={{
                fontWeight: 600,
                color: "var(--accent-primary)",
              }}
            >
              {
                user.subjects[selectedSubject]
              } Correct
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PodiumCard = ({
  user,
  rank,
  score,
  getInitials,
  large,
}) => {
  const size = large ? 130 : 100;

  const rankColor =
    rank === 1
      ? "#facc15"
      : rank === 2
      ? "#94a3b8"
      : "#fb923c";

  return (
    <div
      style={{
        textAlign: "center",
        animation: large
          ? "float 4s ease-in-out infinite"
          : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          margin: "0 auto",
        }}
      >
        {rank === 1 && (
          <div
            style={{
              position: "absolute",
              top: -35,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "26px",
            }}
          >
            👑
          </div>
        )}

        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: large ? "34px" : "24px",
            fontWeight: 700,
            background:
              "linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))",
            color: "white",
            border: `4px solid ${rankColor}`,
          }}
        >
          {getInitials(user.name)}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: rankColor,
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "black",
          }}
        >
          {rank}
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          marginTop: "24px",
          padding: "20px 32px",
          minWidth: "220px",
        }}
      >
        <h3>{user.name}</h3>
        <p
          style={{
            marginTop: "8px",
            fontWeight: 600,
            fontSize: "18px",
            color: "var(--accent-primary)",
          }}
        >
          {score} Correct
        </p>
      </div>
    </div>
  );
};

export default LeaderboardPage;