const LeaderboardTable = ({ users, loading }) => {
    return (
      <div className="glass-card leaderboard-table">
        {loading ? (
          <div className="leaderboard-status">
            Loading…
          </div>
        ) : users.length === 0 ? (
          <div className="leaderboard-status">
            No entries yet for this subject.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="leaderboard-row"
            >
              <span>
                #{user.rank} {user.name}
              </span>
  
              <span className="leaderboard-score">
                🪙 {user.coins} Coins
              </span>
            </div>
          ))
        )}
      </div>
    );
  };
  
  export default LeaderboardTable;