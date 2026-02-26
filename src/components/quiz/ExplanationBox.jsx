function ExplanationBox({ explanation }) {
  if (!explanation) return null

  return (
    <div
      style={{
        marginTop: '1.25rem',
        padding: '0.9rem 1rem',
        borderRadius: '0.9rem',
        border: '1px dashed rgba(148,163,184,0.7)',
        background: 'rgba(15,23,42,0.8)',
        fontSize: '0.9rem',
        color: '#e5e7eb',
      }}
    >
      <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: '#a5b4fc' }}>
        Why this answer?
      </div>
      <p className="muted" style={{ margin: 0 }}>
        {explanation}
      </p>
    </div>
  )
}

export default ExplanationBox

