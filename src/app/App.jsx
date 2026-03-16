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
import "../styles/AppLayout.css";

function AppLayout() {
    // Fix logout handler
    const handleLogout = () => {
      logoutUser();
      navigate("/");
      setShowProfileMenu(false);
    };
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  /* ================= THEME ================= */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= PAGE TITLE ================= */
  const getPageTitle = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname.includes("/subjects")) return "Subjects";
    if (location.pathname.includes("/quizzes")) return "Quizzes";
    if (location.pathname.includes("/leaderboard")) return "Leaderboard";
    if (location.pathname.includes("/quiz/")) return "Quiz";
    return "";
  };

  /* ================= LOGOUT ================= */
  return (
    <div className="app-shell">
      {/* ================= SIDEBAR ================= */}
      {sidebarVisible && (
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`} style={{ zIndex: 3000 }}>
          <div className="sidebar-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>QUIZZZZ</span>
            {/* Hamburger for closing sidebar on mobile */}
            {typeof window !== 'undefined' && window.innerWidth <= 768 && (
              <button
                className="floating-hamburger"
                aria-label="Close sidebar"
                style={{
                  background: "var(--bg-surface)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-soft)",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: 8
                }}
                onClick={() => setSidebarVisible(false)}
              >
                <span style={{ fontSize: "1.7rem", lineHeight: 1 }}>☰</span>
              </button>
            )}
          </div>
          <NavLink to="/" className="sidebar-link" onClick={() => typeof window !== 'undefined' && window.innerWidth <= 768 && setSidebarVisible(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/subjects" className="sidebar-link" onClick={() => typeof window !== 'undefined' && window.innerWidth <= 768 && setSidebarVisible(false)}>
            Subjects
          </NavLink>
          <NavLink to="/quizzes" className="sidebar-link" onClick={() => typeof window !== 'undefined' && window.innerWidth <= 768 && setSidebarVisible(false)}>
            Quizzes
          </NavLink>
          <NavLink to="/leaderboard" className="sidebar-link" onClick={() => typeof window !== 'undefined' && window.innerWidth <= 768 && setSidebarVisible(false)}>
            Leaderboard
          </NavLink>
        </aside>
      )}
      {/* Floating hamburger when sidebar is hidden */}
      {/* Hamburger always visible on mobile when sidebar is hidden */}
      {/* Overlay to close sidebar on mobile */}
      {sidebarVisible && window.innerWidth <= 768 && (
        <div
          onClick={() => setSidebarVisible(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.12)",
            zIndex: 2999
          }}
        />
      )}
      {/* ================= MAIN CONTENT ================= */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ================= HEADER ================= */}
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Hamburger only when sidebar is hidden (mobile/desktop) */}
          <button
            className="floating-hamburger"
            aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            style={{
              background: "var(--bg-surface)",
              border: "none",
              borderRadius: "8px",
              boxShadow: "var(--shadow-soft)",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginRight: 8
            }}
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            <span style={{ fontSize: "1.7rem", lineHeight: 1 }}>☰</span>
          </button>
          {/* Remove Home / Dashboard text for now as requested */}
          {/* <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getPageTitle()}</span> */}
          <div className="header-controls" style={{ marginLeft: 'auto', display: 'flex', gap: 18 }}>
            {/* THEME TOGGLE */}
            <button
              className="theme-toggle-btn"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "🌙 Dark" : "☀ Light"}
            </button>
            {/* NOTIFICATIONS */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <div
                style={{ cursor: "pointer", fontSize: "18px" }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
              </div>
              {showNotifications && (
                <div
                  className="glass-card"
                  style={{ position: "absolute", right: 0, top: "45px", width: "280px" }}
                >
                  <p style={{ fontWeight: 600, marginBottom: "12px" }}>
                    Notifications
                  </p>
                  <div style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                    ✔ Quiz completed successfully
                    <br />
                    🔥 5-day streak achieved
                    <br />
                    🏆 Rank improved to #12
                  </div>
                </div>
              )}
            </div>
            {/* PROFILE MENU */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))",
                  cursor: "pointer",
                }}
              />
              {showProfileMenu && (
                <div
                  className="glass-card"
                  style={{ position: "absolute", right: 0, top: "50px", width: "200px" }}
                >
                  <div style={{ padding: "8px 12px", cursor: "pointer" }}>
                    Profile
                  </div>
                  <div style={{ padding: "8px 12px", cursor: "pointer" }}>
                    Settings
                  </div>
                  <div
                    style={{ padding: "8px 12px", cursor: "pointer", color: "var(--danger)" }}
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ================= PAGE TRANSITION ================= */}
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