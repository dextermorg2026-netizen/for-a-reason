import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import routes from "./routes.jsx";
import { XPProvider } from "../context/XPContext";
import { AuthProvider } from "../context/AuthContext.jsx";
import { QuizProvider } from "../context/QuizContext.jsx";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname.includes("subjects")) return "Subjects";
    if (location.pathname.includes("leaderboard")) return "Leaderboard";
    if (location.pathname.includes("quiz")) return "Quiz";
    return "";
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
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
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
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

        {!collapsed && (
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "none",
              marginBottom: "20px",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              outline: "none",
            }}
          />
        )}

        <NavLink to="/" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/subjects" className="sidebar-link">
          Subjects
        </NavLink>

        <NavLink to="/leaderboard" className="sidebar-link">
          Leaderboard
        </NavLink>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* ========== STICKY HEADER ========== */}
        <div
          style={{
            height: "70px",
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Breadcrumb */}
          <div style={{ fontWeight: 600 }}>
            Home / {getPageTitle()}
          </div>

          {/* Right Side Controls */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Notifications */}
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
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "40px",
                    width: "280px",
                    background: "rgba(20,20,25,0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "16px",
                    padding: "16px",
                    boxShadow:
                      "0 10px 40px rgba(0,0,0,0.5)",
                    border:
                      "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Notifications
                  </p>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#a1a1aa",
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

            {/* Profile */}
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
                    "linear-gradient(90deg,#8b5cf6,#6366f1)",
                  boxShadow:
                    "0 0 20px rgba(139,92,246,0.5)",
                  cursor: "pointer",
                }}
              />

              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50px",
                    width: "200px",
                    background: "rgba(20,20,25,0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "14px",
                    padding: "12px",
                    boxShadow:
                      "0 10px 40px rgba(0,0,0,0.5)",
                    border:
                      "1px solid rgba(255,255,255,0.05)",
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
                      color: "#ef4444",
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== PAGE CONTENT WITH ANIMATION ========== */}
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