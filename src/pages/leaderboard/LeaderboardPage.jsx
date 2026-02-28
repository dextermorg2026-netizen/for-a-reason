import React, { useEffect, useState } from 'react'
import useLeaderboard from '../../hooks/useLeaderboard'
import { getAllSubjects } from '../../services/subjectService'

const LeaderboardPage = () => {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  const { entries, loading } = useLeaderboard(selectedSubject)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoadingSubjects(true)
        const raw = await getAllSubjects()
        const normalized = raw.map((s) => ({
          id: s.id,
          name: s.title ?? s.name ?? 'Untitled Subject',
        }))

        if (!mounted) return
        setSubjects(normalized)
        if (!selectedSubject && normalized.length > 0) {
          setSelectedSubject(normalized[0].id)
        }
      } catch (e) {
        if (!mounted) return
        setSubjects([])
      } finally {
        if (mounted) setLoadingSubjects(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const topThree = entries.slice(0, 3)
  const others = entries.slice(3)

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0]
  }

  return (
    <div>
      <h1 className="page-title">Subject Leaderboard</h1>

      <div style={{ marginTop: 30, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {loadingSubjects ? (
          <div className="glass-card" style={{ padding: 12 }}>Loading subjects…</div>
        ) : subjects.length === 0 ? (
          <div className="glass-card" style={{ padding: 12 }}>No subjects available.</div>
        ) : (
          subjects.map((subject) => {
            const isActive = selectedSubject === subject.id
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: isActive
                    ? 'linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))'
                    : 'var(--bg-elevated)',
                  color: isActive ? 'white' : 'var(--text-primary)',
                  transition: '0.2s ease',
                }}
              >
                {subject.name}
              </button>
            )
          })
        )}
      </div>

      <div style={{ position: 'relative', marginTop: 80 }}>
        <div
          style={{
            position: 'absolute',
            top: -150,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 400,
            background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 70, flexWrap: 'wrap' }}>
          {topThree[1] && (
            <PodiumCard user={topThree[1]} rank={2} score={topThree[1].score} getInitials={getInitials} />
          )}

          {topThree[0] && (
            <PodiumCard user={topThree[0]} rank={1} score={topThree[0].score} getInitials={getInitials} large />
          )}

          {topThree[2] && (
            <PodiumCard user={topThree[2]} rank={3} score={topThree[2].score} getInitials={getInitials} />
          )}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 80, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading…</div>
        ) : others.length === 0 ? (
          <div style={{ padding: 20 }}>No entries yet for this subject.</div>
        ) : (
          others.map((user, index) => (
            <div
              key={user.id}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 28px', borderBottom: index !== others.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none', transition: '0.2s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>
                #{index + 4} {user.name}
              </span>

              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{user.score} Correct</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const PodiumCard = ({ user, rank, score, getInitials, large }) => {
  const size = large ? 130 : 100

  const rankColor = rank === 1 ? '#facc15' : rank === 2 ? '#94a3b8' : '#fb923c'

  return (
    <div style={{ textAlign: 'center', animation: large ? 'float 4s ease-in-out infinite' : 'none' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        {rank === 1 && (
          <div style={{ position: 'absolute', top: -35, left: '50%', transform: 'translateX(-50%)', fontSize: 26 }}>👑</div>
        )}

        <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: large ? 34 : 24, fontWeight: 700, background: 'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', color: 'white', border: `4px solid ${rankColor}` }}>
          {getInitials(user.name)}
        </div>

        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', background: rankColor, width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'black' }}>
          {rank}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 24, padding: '20px 32px', minWidth: 220 }}>
        <h3>{user.name}</h3>
        <p style={{ marginTop: 8, fontWeight: 600, fontSize: 18, color: 'var(--accent-primary)' }}>{score} Correct</p>
      </div>
    </div>
  )
}

export default LeaderboardPage