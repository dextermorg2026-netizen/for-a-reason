import Dashboard from '../pages/dashboard/Dashboard.jsx'
import Login from '../pages/auth/Login.jsx'
import Signup from '../pages/auth/Signup.jsx'
import Subjects from '../pages/subjects/Subjects.jsx'
import Topics from '../pages/subjects/Topics.jsx'
import Quiz from '../pages/quiz/Quiz.jsx'
import Result from '../pages/quiz/Result.jsx'
import LiveQuiz from '../pages/liveQuiz/LiveQuiz.jsx'
import LiveResult from '../pages/liveQuiz/LiveResult.jsx'
import ResourceViewer from '../pages/resources/ResourceViewer.jsx'
import LeaderboardPage from '../pages/leaderboard/LeaderboardPage.jsx'
import ProtectedRoute from '../components/common/ProtectedRoute.jsx'

const routes = [
  // Public Routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },

  // Protected Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/subjects',
    element: (
      <ProtectedRoute>
        <Subjects />
      </ProtectedRoute>
    ),
  },
  {
    path: '/subjects/:subjectId/topics',
    element: (
      <ProtectedRoute>
        <Topics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quiz',
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
  {
    path: '/resources',
    element: (
      <ProtectedRoute>
        <ResourceViewer />
      </ProtectedRoute>
    ),
  },
  {
    path: '/leaderboard',
    element: (
      <ProtectedRoute>
        <LeaderboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quiz/:topicId',
    element: (
      <ProtectedRoute>
        <Quiz />
      </ProtectedRoute>
    ),
  },
]

export default routes