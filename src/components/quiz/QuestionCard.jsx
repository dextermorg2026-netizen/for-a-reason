import OptionItem from './OptionItem.jsx'
import ProgressBar from '../common/ProgressBar.jsx'

function QuestionCard({
  question,
  options = [],
  currentIndex = 0,
  total = 1,
  selectedId,
  onSelect,
}) {
  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="badge">
          <span className="badge-dot" />
          Question {currentIndex + 1} of {total}
        </span>
        <span className="muted">{Math.round(((currentIndex + 1) / total) * 100)}% complete</span>
      </div>
      <ProgressBar value={currentIndex + 1} max={total} />
      <h2 className="page-title" style={{ marginTop: '1.25rem' }}>
        {question}
      </h2>
      <div style={{ marginTop: '1rem' }}>
        {options.map((opt) => (
          <OptionItem
            key={opt.id}
            label={opt.label}
            selected={opt.id === selectedId}
            onClick={() => onSelect?.(opt.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default QuestionCard

