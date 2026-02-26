import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import routes from './routes.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { QuizProvider } from '../context/QuizContext.jsx'

function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-title">QUIZZZZ</div>
      <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/subjects">Subjects</Link>
        <Link to="/quiz">Quiz</Link>
        <Link to="/live">Live</Link>
        <Link to="/leaderboard">Leaderboard</Link>
      </nav>
    </header>
  )
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <span className="muted">QUIZZZZ · Interactive quiz and live contest platform</span>
    </footer>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <div className="app-shell">
            <AppHeader />
            <main className="app-main">
              <Routes>
                {routes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Routes>
            </main>
            <AppFooter />
          </div>
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

