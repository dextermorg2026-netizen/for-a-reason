import { useEffect, useState } from 'react'
import { getSubjectLeaderboard } from '../services/leaderboardService'
import { getUserProfile } from '../services/userService'

export function useLeaderboard(subjectId) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!subjectId) {
      setEntries([])
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const data = await getSubjectLeaderboard(subjectId)

        const enriched = await Promise.all(
          data.map(async (row, idx) => {
            const profile = await getUserProfile(row.userId)
            return {
              id: row.userId,
              name: profile?.name || 'Unknown',
              score: row.totalScore,
              rank: idx + 1,
            }
          })
        )

        if (!cancelled) setEntries(enriched)
      } catch (err) {
        if (!cancelled) setEntries([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [subjectId])

  return { entries, loading }
}

export default useLeaderboard

