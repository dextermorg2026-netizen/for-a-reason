function LeaderboardTable({ entries = [] }) {
  const data =
    entries.length > 0
      ? entries
      : [
          { id: 1, name: 'Riya', score: 980, rank: 1 },
          { id: 2, name: 'Arjun', score: 940, rank: 2 },
          { id: 3, name: 'Sara', score: 910, rank: 3 },
        ]

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td>#{row.rank}</td>
            <td>{row.name}</td>
            <td>{row.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default LeaderboardTable

