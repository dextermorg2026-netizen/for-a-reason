import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import routes from "./routes.jsx";
import { XPProvider } from "../context/XPContext";
import { AuthProvider, useAuth } from "../context/AuthContext.jsx";
import { QuizProvider } from "../context/QuizContext.jsx";
import { CoinProvider } from "../context/CoinContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../services/firebase";
import NotificationToast from "../components/common/NotificationToast";
import "../styles/AppLayout.css";

function AppLayout() {
  const { logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [isLive, setIsLive] = useState(false); // 🔥 LIVE STATE

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  /* ================= THEME ================= */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= LIVE DETECTION ================= */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "liveQuizzes"), (snap) => {
      let live = false;

      snap.forEach((doc) => {
        if (doc.data().status === "playing") {
          live = true;
        }
      });

      setIsLive(live);
    });

    return () => unsub();
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    logoutUser();
    navigate("/");
    setShowProfileMenu(false);
  };

  /* ================= NAV LINK STYLE ================= */
  const navClass = ({ isActive }) =>
    "sidebar-link" + (isActive ? " active" : "");

  return (
    <div className="app-shell">
      <NotificationToast />
      {/* ================= SIDEBAR ================= */}
      {sidebarVisible && (
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
          <div className="sidebar-title">
            QUIZZZZ
          </div>

          <NavLink to="/" className={navClass}>
            Dashboard
          </NavLink>

          <NavLink to="/subjects" className={navClass}>
            Subjects
          </NavLink>

          <NavLink to="/quizzes" className={navClass}>
            Quizzes
          </NavLink>

          <NavLink to="/leaderboard" className={navClass}>
            Leaderboard
          </NavLink>

          {/* 🔥 LIVE QUIZ BUTTON */}
          <NavLink
            to="/live"
            className={({ isActive }) =>
              "sidebar-link" +
              (isActive ? " active" : "") +
              (isLive ? " live-glow" : "")
            }
          >
            🔴 Live Quiz
          </NavLink>
        </aside>
      )}

      {/* ================= MAIN ================= */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* ================= HEADER ================= */}
        <div className="header">
          <button
            className="floating-hamburger"
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            ☰
          </button>

          <div className="header-controls" style={{ marginLeft: "auto" }}>
            
            {/* THEME */}
            <button
              className="theme-toggle-btn"
              onClick={() =>
                setTheme(theme === "light" ? "dark" : "light")
              }
            >
              {theme === "light" ? "🌙 Dark" : "☀ Light"}
            </button>

            {/* NOTIFICATIONS */}
            <div ref={notifRef}>
              <span onClick={() => setShowNotifications(!showNotifications)}>
                🔔
              </span>
            </div>

            {/* PROFILE */}
            <div ref={profileRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))",
                  cursor: "pointer",
                }}
              />

              {showProfileMenu && (
                <div className="glass-card">
                  <div>Profile</div>
                  <div>Settings</div>
                  <div onClick={handleLogout}>Logout</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= ROUTES ================= */}
        <div style={{ padding: "24px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes location={location}>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <XPProvider>
            <CoinProvider>
              <AppLayout />
            </CoinProvider>
          </XPProvider>
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;