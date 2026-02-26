import { createContext, useMemo, useState } from 'react'
import { quizService } from '../services/quizService.js'

export const QuizContext = createContext(null)

export function QuizProvider({ children }) {
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [loading, setLoading] = useState(false)

  const value = useMemo(
    () => ({
      currentQuiz,
      loading,
      async loadQuiz(params) {
        setLoading(true)
        try {
          const quiz = await quizService.fetchQuiz(params)
          setCurrentQuiz(quiz)
        } finally {
          setLoading(false)
        }
      },
      clearQuiz() {
        setCurrentQuiz(null)
      },
    }),
    [currentQuiz, loading],
  )

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

