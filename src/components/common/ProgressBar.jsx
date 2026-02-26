function ProgressBar({ value, max = 100 }) {
  const safeMax = max || 100
  const percentage = Math.max(0, Math.min(100, (value / safeMax) * 100))

  return (
    <div
      style={{
        width: '100%',
        height: 10,
        borderRadius: 999,
        background: 'rgba(15,23,42,0.9)',
        border: '1px solid rgba(148,163,184,0.6)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percentage}%`,
          background:
            'linear-gradient(to right, rgba(56,189,248,1), rgba(129,230,217,1), rgba(59,130,246,1))',
          transition: 'width 0.2s ease-out',
        }}
      />
    </div>
  )
}

export default ProgressBar

