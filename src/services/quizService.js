async function fetchQuiz(params) {
  return {
    id: 'demo-quiz',
    title: 'Demo quiz',
    params,
  }
}

async function submitQuiz(payload) {
  return {
    score: 10,
    total: 10,
    payload,
  }
}

export const quizService = {
  fetchQuiz,
  submitQuiz,
}

