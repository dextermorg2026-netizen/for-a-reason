import { useContext } from 'react'
import { QuizContext } from '../context/QuizContext.jsx'

export function useQuiz() {
  return useContext(QuizContext)
}

export default useQuiz

