import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";
import { getLastAttemptedSubject } from "../../services/statsService";
import { useAuth } from "../../context/AuthContext";

import "./Subjects.css";

const Subjects = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryTrigger, setRetryTrigger] = useState(0);

  /* ================= DATA LOAD ================= */

  useEffect(() => {
    let mounted = true;

    const clampProgress = (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, n));
    };

    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const raw = await getAllSubjects();

        let last = null;
        if (currentUser?.uid) {
          last = await getLastAttemptedSubject(currentUser.uid);
        }

        const normalized = (raw || []).map((s) => {
          const progress = clampProgress(
            s.progress ?? s.xpProgress ?? 0
          );

          return {
            id: s.id,
            title: s.title ?? s.name ?? "Untitled Subject",
            progress,
            completed: progress >= 100,
            description:
              s.description ??
              s.desc ??
              "No description available",
          };
        });

        if (mounted) {
          setSubjects(normalized);
          setLastAttempt(last);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e?.message || "Failed to load subjects."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSubjects();
    return () => {
      mounted = false;
    };
  }, [currentUser, retryTrigger]);



  const continueSubject = lastAttempt
    ? subjects.find(
        (s) => s.id === lastAttempt.subjectId
      )
    : null;

  /* ================= RENDER ================= */

  const firstName = currentUser?.displayName?.split(" ")[0] || "OPERATOR";

  return (
    <main className="px-10 pb-12 ">
      {/* Hero Greeting Section */}
      <section className="mb-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-semibold font-headline text-on-surface tracking-tighter mb-2">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-400 font-body max-w-2xl">
              Your cognitive synchronization is at 98%. Continuing your journey through the architectural foundations of the digital frontier.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="px-4 py-2 bg-surface-container-low border-r-2 border-secondary asymmetric-card">
              <div className="text-[10px] font-headline text-secondary uppercase tracking-widest">Active Threads</div>
              <div className="text-lg font-semibold font-headline">
                {subjects.filter(s => s.progress > 0 && s.progress < 100).length.toString().padStart(2, '0')}_UNITS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="asymmetric-card border border-white/5 bg-surface-container-low animate-pulse">
              <div className="h-48 bg-white/5"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-1 bg-white/5 rounded w-full"></div>
                <div className="h-10 bg-white/5 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="glass-panel p-16 text-center border border-error/20 max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-error text-5xl mb-4">warning</span>
          <h2 className="font-headline font-semibold text-error uppercase tracking-widest mb-4">Connection Terminated</h2>
          <p className="text-slate-500 font-body text-sm mb-8">{error}</p>
          <button 
            className="px-8 py-3 bg-error/10 border border-error/30 text-error font-headline font-semibold text-xs uppercase tracking-widest hover:bg-error/20"
            onClick={() => { setError(""); setRetryTrigger(t => t + 1); }}
          >
            Re-establish Link
          </button>
        </div>
      )}

      {/* Content Section */}
      {!loading && !error && (
        <div className="space-y-16">
          {/* Primary Objectives: Active Subjects */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <h2 className="text-xs font-headline font-semibold uppercase tracking-[0.3em] text-slate-400">Current_Objectives</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {continueSubject ? (
                <div 
                  onClick={() => navigate(`/subjects/${continueSubject.id}`)}
                  className="bg-surface-container-low asymmetric-card overflow-hidden group hover:bg-surface-container-high transition-all duration-300 border border-white/5 cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" 
                      alt={continueSubject.title}
                      data-alt="Abstract visualization"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX6IITDzcN2NHKCRbJGIE8npik9KQMQU8N5p8_eeDLvtj56G0DaQvsed1O2Ry7wcaJxUzIDARqGVKJU4kCl_F1qR4Z8L2qnOaH4eaeVOoLfEK5SLTTL88o3xluqT0miMEvVNGbxShtNQukj73hdwMsUnUX0FAH61pEpM9X-QnIZCFJZEp_LrnwQwxJctbAr5651PZRw3JeCzgeqJArKtvWTUvIDbo7ZuNPyjyGf9nzt44v4jSdzqeZTGahyQHELzTkY-OXWAM6DNw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
                    <div className="absolute bottom-4 left-6">
                      <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-headline font-semibold rounded-sm border border-secondary/30">CLASS_ALPHA</span>
                      <h3 className="text-2xl font-semibold font-headline text-white mt-1 uppercase">{continueSubject.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-headline text-slate-500 uppercase">Synchronization_Progress</span>
                      <span className="text-[10px] font-headline text-secondary">{continueSubject.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden mb-6">
                      <div 
                        className="h-full bg-secondary transition-all duration-700" 
                        style={{ width: `${continueSubject.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-headline">IP</div>
                        <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-headline">TCP</div>
                        <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-headline">DNS</div>
                      </div>
                      <button 
                        onClick={() => navigate(`/subjects/${continueSubject.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary font-headline font-semibold text-xs tracking-wider rounded-lg hover:brightness-110 transition-all active:scale-95"
                      >
                        DEPLOY <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-low asymmetric-card p-12 text-center border border-white/5">
                  <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">inbox</span>
                  <h3 className="font-headline font-semibold text-slate-500 uppercase tracking-widest mb-2">No Active Missions</h3>
                  <p className="text-xs text-slate-600 font-body uppercase tracking-wider mb-6">Initialize your first subject to begin synchronization.</p>
                  <button 
                    onClick={() => document.getElementById('intel-repository')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-6 py-3 bg-secondary text-on-secondary font-headline font-semibold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 transition-all"
                  >
                    Browse Subjects
                  </button>
                </div>
              )}
              
              {/* Secondary Subject Recommendation Card */}
              {subjects.length > 1 && subjects.find(s => s.id !== continueSubject?.id) && (() => {
                 const otherSubject = subjects.find(s => s.id !== continueSubject?.id);
                 return (
                  <div 
                    onClick={() => navigate(`/subjects/${otherSubject.id}`)}
                    className="bg-surface-container-low asymmetric-card overflow-hidden group hover:bg-surface-container-high transition-all duration-300 border border-white/5 cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" 
                        alt={otherSubject.title}
                        data-alt="Conceptual blueprint"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCMiMGnnPVVuterg-bbkb66RdvtqZFlsJIEwP-M0D3Z1D0f3fA92_f8lZsaVT6lsgbAl6wl3K2NwiceANH9RKbvag9AakmfmDz4zZdQqpBr0TTJCfo_UF7c7eYPqioE-nouF1-5l-rjcLKqXdgo_MD-yRss7jovpgQbPg2NbwxkTGNO30Kvo-XwONLSPw6SxZjT1hqCistC0t0e9UbVn_qtmyYrYskg53qtwN3JdKTX4kZySfCe5fUqgDfKbEkwcLOrieTKBzBZjY"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
                      <div className="absolute bottom-4 left-6">
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-headline font-semibold rounded-sm border border-primary/30">CLASS_OMEGA</span>
                        <h3 className="text-2xl font-semibold font-headline text-white mt-1 uppercase">{otherSubject.title}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-headline text-slate-500 uppercase">Synchronization_Progress</span>
                        <span className="text-[10px] font-headline text-primary">{otherSubject.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-primary transition-all duration-700" style={{ width: `${otherSubject.progress}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-headline">LOB</div>
                          <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-headline">SQL</div>
                          <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-headline">CAP</div>
                        </div>
                        <button 
                          onClick={() => navigate(`/subjects/${otherSubject.id}`)}
                          className="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary/10 font-headline font-semibold text-xs tracking-wider rounded-lg transition-all active:scale-95"
                        >
                          LAUNCH MISSION <span className="material-symbols-outlined text-sm">bolt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                 );
              })()}
            </div>
          </section>


        </div>
      )}

      {/* Tactical HUD Overlay Elements */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 pointer-events-none z-30">
        <div className="bg-surface-container-low/80 backdrop-blur-md px-4 py-2 border-l border-tertiary rounded-sm flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          <span className="text-[9px] font-headline text-tertiary tracking-widest uppercase">Stream: Active</span>
        </div>
        <div className="bg-surface-container-low/80 backdrop-blur-md px-4 py-2 border-l border-primary rounded-sm flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          <span className="text-[9px] font-headline text-primary tracking-widest uppercase">System: Stable</span>
        </div>
      </div>
    </main>
  );
};

export default Subjects;
