import Dashboard from '../pages/dashboard/Dashboard.jsx'
import Login from '../pages/auth/Login.jsx'
import Signup from '../pages/auth/Signup.jsx'

import Subjects from '../pages/subjects/Subjects.jsx'
import SubjectTheoryPage from '../pages/subjects/SubjectTheoryPage.jsx'

import Quiz from '../pages/quiz/Quiz.jsx'
import Result from '../pages/quiz/Result.jsx'

import QuizzesPage from '../pages/quizzes/QuizzesPage.jsx'
import SubjectQuizPage from '../pages/quizzes/SubjectQuizPage.jsx'

import LiveQuiz from '../pages/liveQuiz/LiveQuiz.jsx'
import LiveResult from '../pages/liveQuiz/LiveResult.jsx'

import ResourceViewer from '../pages/resources/ResourceViewer.jsx'
import LeaderboardPage from '../pages/leaderboard/LeaderboardPage.jsx'

import ProtectedRoute from '../components/common/ProtectedRoute.jsx'

const routes = [

  // ================= PUBLIC ROUTES =================
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },

  // ================= PROTECTED ROUTES =================

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  // -------- SUBJECTS --------

  {
    path: '/subjects',
    element: (
      <ProtectedRoute>
        <Subjects />
      </ProtectedRoute>
    ),
  },

  // Direct theory page
  {
    path: '/subjects/:subjectId',
    element: (
      <ProtectedRoute>
        <SubjectTheoryPage />
      </ProtectedRoute>
    ),
  },

  // -------- QUIZZES HUB --------

  {
    path: '/quizzes',
    element: (
      <ProtectedRoute>
        <QuizzesPage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/quizzes/:subjectId',
    element: (
      <ProtectedRoute>
        <SubjectQuizPage />
      </ProtectedRoute>
    ),
  },

  // -------- ACTUAL QUIZ ATTEMPT --------

  {
    path: '/quiz/:topicId',
    element: (
      <ProtectedRoute>
        <Quiz />
      </ProtectedRoute>
    ),
  },

  {
    path: '/quiz/result',
    element: (
      <ProtectedRoute>
        <Result />
      </ProtectedRoute>
    ),
  },

  // -------- LIVE QUIZ --------

  {
    path: '/live',
    element: (
      <ProtectedRoute>
        <LiveQuiz />
      </ProtectedRoute>
    ),
  },

  {
    path: '/live/result',
    element: (
      <ProtectedRoute>
        <LiveResult />
      </ProtectedRoute>
    ),
  },

  // -------- RESOURCES --------

  {
    path: '/resources',
    element: (
      <ProtectedRoute>
        <ResourceViewer />
      </ProtectedRoute>
    ),
  },

  // -------- LEADERBOARD --------

  {
    path: '/leaderboard',
    element: (
      <ProtectedRoute>
        <LeaderboardPage />
      </ProtectedRoute>
    ),
  },
]

export default routes