export function calculateScore(answerEntries) {
  if (!answerEntries || answerEntries.length === 0) {
    return { score: 0, total: 0 }
  }

  let score = 0
  let total = 0

  for (const entry of answerEntries) {
    if (!entry) continue
    total += 1
    if (entry.selectedId && entry.selectedId === entry.correctId) {
      score += 1
    }
  }

  return { score, total }
}

export default calculateScore

