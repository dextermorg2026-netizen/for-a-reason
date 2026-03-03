function LeaderboardTable({ entries = [] }) {
  const data =
    entries.length > 0
      ? entries
      : [
          { id: 1, name: 'Riya', coins: 980, rank: 1 },
          { id: 2, name: 'Arjun', coins: 940, rank: 2 },
          { id: 3, name: 'Sara', coins: 910, rank: 3 },
        ]

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Coins</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td>#{row.rank}</td>
            <td>{row.name}</td>
            <td>{row.coins}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default LeaderboardTable

