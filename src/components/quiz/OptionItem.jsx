function OptionItem({ label, selected = false, correct = false, disabled = false, onClick }) {
  const stateColor = correct
    ? 'rgba(34,197,94,0.18)'
    : selected
      ? 'rgba(56,189,248,0.16)'
      : 'rgba(15,23,42,0.9)'

  const borderColor = correct
    ? 'rgba(52,211,153,0.9)'
    : selected
      ? 'rgba(56,189,248,0.9)'
      : 'rgba(148,163,184,0.7)'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '0.75rem 1rem',
        borderRadius: 999,
        border: `1px solid ${borderColor}`,
        marginBottom: '0.5rem',
        background: stateColor,
        color: '#e5e7eb',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !selected && !correct ? 0.7 : 1,
      }}
    >
      {label}
    </button>
  )
}

export default OptionItem

