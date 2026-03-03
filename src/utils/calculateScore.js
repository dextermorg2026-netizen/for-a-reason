import { COINS_PER_CORRECT } from "./constants";

export function calculateScore(answerEntries) {
  // calculates coins earned (  // with a total count.  Returns `{coins, total}` so it matches the
  // rest of the app's terminology; legacy code can still divide
  // coins by 10 to recover the raw score.
  if (!answerEntries || answerEntries.length === 0) {
    return { coins: 0, total: 0 }
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

  return { coins: score * COINS_PER_CORRECT, total }
}

export default calculateScore

