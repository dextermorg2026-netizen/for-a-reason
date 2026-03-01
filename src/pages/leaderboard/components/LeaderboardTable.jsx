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
          users.map((user, index) => (
            <div
              key={user.id}
              className="leaderboard-row"
            >
              <span>
                #{index + 4} {user.name}
              </span>
  
              <span className="leaderboard-score">
                {user.score} Correct
              </span>
            </div>
          ))
        )}
      </div>
    );
  };
  
  export default LeaderboardTable;