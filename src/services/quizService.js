async function fetchQuiz(params) {
  return {
    id: 'demo-quiz',
    title: 'Demo quiz',
    params,
  }
}

async function submitQuiz(payload) {
  return {
    // this is just a stub; real implementation would compute
    // correct count and derive coins (e.g. score*10)
    score: 10,
    coins: 100,
    total: 10,
    payload,
  }
}

export const quizService = {
  fetchQuiz,
  submitQuiz,
}

