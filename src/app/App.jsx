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
  const { logoutUser, userProfile, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isLive, setIsLive] = useState(false);

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

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `group flex items-center gap-4 px-4 py-3 font-semibold transition-all duration-100 ease-in active:scale-95 ${
      isActive
        ? "text-cyan-400 border-l-2 border-cyan-400 bg-cyan-400/10 shadow-[inset_4px_0_10px_-2px_rgba(76,215,246,0.3)]"
        : "text-slate-500 hover:text-purple-400 hover:bg-purple-500/10"
    }`;

  const firstName = currentUser?.displayName?.split(" ")[0] || "OPERATOR";

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary">
      <NotificationToast />

      {/* --- TOPBAR --- */}
      <header className="bg-[#131313]/90 backdrop-blur-md text-purple-500 font-headline tracking-tighter uppercase border-b border-white/5 fixed top-0 left-0 right-0 z-30 md:left-64 flex justify-between items-center px-6 h-16 transition-all">
        <div className="flex items-center flex-1">
          <div className="hidden md:flex items-center gap-3">
            <span className="material-symbols-outlined text-primary animate-pulse">radar</span>
            <span className="font-headline font-semibold text-[10px] tracking-[0.3em] uppercase text-slate-300">
              <span className="text-primary">KNOWLEDGE CORE</span> // ACTIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-slate-500" onClick={() => setSidebarVisible(!sidebarVisible)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 pr-4 border-r border-white/10">
            <button 
              className="p-2 text-slate-400 hover:text-primary transition-all rounded-lg group relative"
              onClick={() => {
                if (isLive) {
                  navigate('/live');
                } else {
                  alert('No active broadcast signals detected.');
                }
              }}
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">notifications</span>
              {isLive && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>}
            </button>
            <button className="p-2 text-slate-400 hover:text-error transition-all rounded-lg group" onClick={() => window.confirm("Terminate Operator Session: Are you sure you want to log out?") && handleLogout()}>
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">logout</span>
            </button>
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 cursor-pointer" onClick={() => navigate("/profile")}>
            <img 
              alt="Operator Profile" 
              className="w-full h-full object-cover"
              src={currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuCjDCTkyFGbljBttPLNaZSt-iX5yRdT1Dy-H9E_aMyA3yogvyBcKirLOL9FUirMyMOuxp0BBAAfGkEWi_oGWv1zPtobdCIPGQ3I_D-39RK_Vl8MBZ2olkMhRCBitmOpbqVi68HNuLQQOq1RS-e2whDzBezKVPWrlcmhU-eHn5DCmYcO0O2nhyfdFLalN0Bf4rdCaK-DWhPN7VkL7tzoFDMSFc04aDdOveluCFjsaYL8UIb_XCymULZ_4e5nenEnbC76ic0ycTVRAmc"} 
            />
          </div>
        </div>
      </header>

      {/* --- SIDENAV (With Mobile Overlay) --- */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 md:hidden"
          onClick={() => setSidebarVisible(false)}
        ></div>
      )}
      
      <aside className={`fixed left-0 top-0 h-full flex flex-col z-50 w-64 border-r border-purple-500/10 rounded-tr-xl bg-[#0a0a09]/95 backdrop-blur-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] font-['Space_Grotesk'] overflow-hidden transition-transform duration-300 md:translate-x-0 ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
        
        {/* Header Section */}
        <div className="relative p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 min-w-[3rem] rounded-2xl bg-surface-container border border-white/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_0_15px_rgba(221,183,255,0.05)] relative overflow-hidden group">
              <span className="material-symbols-outlined text-3xl text-primary drop-shadow-[0_0_10px_rgba(221,183,255,0.6)] group-hover:scale-110 transition-transform">all_inclusive</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-bold tracking-tighter italic bg-gradient-to-r from-primary via-[#f0dbff] to-secondary bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(221,183,255,0.2)] leading-tight">
                LearnLoop
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.8)] animate-pulse"></div>
                <span className="text-[7.5px] uppercase tracking-[0.15em] text-tertiary font-semibold whitespace-nowrap">TACTICAL KNOWLEDGE CORE</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col border-l-2 border-white/10 pl-4 py-0.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-0.5">OPERATOR</span>
            <span className="text-sm font-bold text-on-surface tracking-widest font-headline">VYRO-0041</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto relative z-10">
          <NavLink to="/" className={navClass} onClick={() => setSidebarVisible(false)}>
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="uppercase tracking-widest text-xs">Dashboard</span>
          </NavLink>
          <NavLink to="/subjects" className={navClass} onClick={() => setSidebarVisible(false)}>
            <span className="material-symbols-outlined text-xl">menu_book</span>
            <span className="uppercase tracking-widest text-xs">Subjects</span>
          </NavLink>
          <NavLink to="/quizzes" className={navClass} onClick={() => setSidebarVisible(false)}>
            <span className="material-symbols-outlined text-xl">quiz</span>
            <span className="uppercase tracking-widest text-xs">Quizzes</span>
          </NavLink>
          <NavLink to="/live" className={navClass} onClick={() => setSidebarVisible(false)}>
            <span className="material-symbols-outlined text-xl">sensors</span>
            <span className="uppercase tracking-widest text-xs">Live Quiz</span>
          </NavLink>
          <NavLink to="/leaderboard" className={navClass} onClick={() => setSidebarVisible(false)}>
            <span className="material-symbols-outlined text-xl">leaderboard</span>
            <span className="uppercase tracking-widest text-xs">Leaderboard</span>
          </NavLink>
          {userProfile?.role === "admin" && (
            <NavLink to="/admin" className={navClass} onClick={() => setSidebarVisible(false)}>
              <span className="material-symbols-outlined text-xl text-error">admin_panel_settings</span>
              <span className="uppercase tracking-widest text-xs text-error">Root Access</span>
            </NavLink>
          )}
        </nav>

        {/* Footer Navigation & CTA */}
        <div className="mt-auto p-4 flex flex-col gap-4 relative z-10">
          <div className="border-t border-white/5 pt-4 space-y-1">
            <NavLink to="/profile" className="group flex items-center gap-4 px-4 py-2 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-100 ease-in active:scale-95">
              <span className="material-symbols-outlined text-lg">settings</span>
              <span className="uppercase tracking-widest text-[10px]">Settings</span>
            </NavLink>
            <NavLink to="/support" className="group flex items-center gap-4 px-4 py-2 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-100 ease-in active:scale-95">
              <span className="material-symbols-outlined text-lg">help</span>
              <span className="uppercase tracking-widest text-[10px]">Support</span>
            </NavLink>
          </div>
          
          <button 
            onClick={() => { setSidebarVisible(false); navigate('/subjects'); }}
            className="w-full bg-primary text-on-primary font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 group relative overflow-hidden transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(221,183,255,0.25)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-white/20"></div>
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">explore</span>
            <span className="uppercase tracking-tighter text-sm">EXPLORE SUBJECTS</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="md:ml-64 pt-20 pb-20 md:pb-6 px-1 lg:px-4 min-h-screen bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              {routes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- MOBILE NAV --- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#131313] border-t border-purple-500/10 flex items-center justify-around z-50">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined" style={location.pathname === '/' ? { fontVariationSettings: "'FILL' 1" } : {}}>grid_view</span>
          <span className="text-[10px] font-semibold uppercase">Dashboard</span>
        </NavLink>
        <NavLink to="/subjects" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px] font-semibold uppercase">Subjects</span>
        </NavLink>
        <NavLink to="/quizzes" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">quiz</span>
          <span className="text-[10px] font-semibold uppercase">Quizzes</span>
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">military_tech</span>
          <span className="text-[10px] font-semibold uppercase">Rank</span>
        </NavLink>
        {userProfile?.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-error' : 'text-slate-500'}`}>
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span className="text-[10px] font-semibold uppercase">Root</span>
          </NavLink>
        )}
      </footer>
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