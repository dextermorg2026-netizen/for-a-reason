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
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
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
  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setShowProfileMenu(false);
      navigate("/login", { replace: true });
    }
  };

  /* ================= CLOSE DROPDOWNS ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="app-shell">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""}`}
        style={{ position: "sticky", top: 0, height: "100vh" }}
      >
        <div
          className="sidebar-title"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!collapsed && "QUIZZZZ"}
          <span>{collapsed ? "➤" : "◀"}</span>
        </div>

        <NavLink to="/" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/subjects" className="sidebar-link">
          Subjects
        </NavLink>

        <NavLink to="/quizzes" className="sidebar-link">
          Quizzes
        </NavLink>

        <NavLink to="/leaderboard" className="sidebar-link">
          Leaderboard
        </NavLink>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ================= HEADER ================= */}
        <div
          style={{
            height: "70px",
            backdropFilter: "blur(18px)",
            background: "var(--bg-glass)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Home / {getPageTitle()}
          </div>

          <div
            style={{
              display: "flex",
              gap: "18px",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* THEME TOGGLE */}
            <button
              onClick={() =>
                setTheme(theme === "light" ? "dark" : "light")
              }
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                background: "var(--bg-glass)",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            >
              {theme === "light" ? "🌙 Dark" : "☀ Light"}
            </button>

            {/* NOTIFICATIONS */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <div
                style={{ cursor: "pointer", fontSize: "18px" }}
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
              >
                🔔
              </div>

              {showNotifications && (
                <div
                  className="glass-card"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "45px",
                    width: "280px",
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: "12px" }}>
                    Notifications
                  </p>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      lineHeight: "1.6",
                    }}
                  >
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
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))",
                  cursor: "pointer",
                }}
              />

              {showProfileMenu && (
                <div
                  className="glass-card"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50px",
                    width: "200px",
                  }}
                >
                  <div style={{ padding: "8px 12px", cursor: "pointer" }}>
                    Profile
                  </div>

                  <div style={{ padding: "8px 12px", cursor: "pointer" }}>
                    Settings
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      color: "var(--danger)",
                    }}
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
        <div style={{ padding: "50px" }}>
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
            <AppLayout />
          </XPProvider>
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;