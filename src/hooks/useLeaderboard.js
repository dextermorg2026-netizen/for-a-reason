import { useEffect, useState } from 'react'
import { leaderboardService } from '../services/userService.js'

export function useLeaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await leaderboardService.fetchLeaderboard()
        if (!cancelled) setEntries(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { entries, loading }
}

export default useLeaderboard

