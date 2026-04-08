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
    <main className="bg-background min-h-screen">
      <div className="w-full">
        {/* Breadcrumbs / Header Section matching Quizzes style */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-headline font-semibold text-on-surface tracking-tight uppercase">Intel Repository</h1>
            <p className="text-sm font-label text-slate-500 mt-1 tracking-[0.2em] uppercase">Cognitive Synchronization Matrix</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-low px-4 py-2 border border-outline-variant/10 hud-card-asymmetric flex items-center gap-3">
              <span className="text-[10px] font-headline text-secondary uppercase tracking-widest">Active Units</span>
              <span className="text-lg font-headline font-semibold text-on-surface">{subjects.length.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-surface-container-low p-20 text-center text-slate-500 font-headline uppercase tracking-widest animate-pulse hud-card-asymmetric shadow-[inset_0_0_50px_rgba(0,0,0,0.2)]">
            SYNCHRONIZING_COGNITIVE_NODES...
          </div>
        ) : error ? (
          <div className="bg-surface-container-low p-20 text-center text-error font-headline uppercase tracking-widest border border-error/20 hud-card-asymmetric">
            FATAL_ERROR: {error}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Subject Listing Header */}
            <div className="col-span-12">
              <div className="bg-surface-container-low p-6 hud-card-asymmetric relative overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0"></div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="bg-primary/20 text-primary font-headline text-[10px] px-2 py-0.5 tracking-tighter uppercase mb-2 inline-block border border-primary/30">DEVICES ONLINE</span>
                    <h2 className="text-2xl font-headline font-semibold text-on-surface uppercase">ALL AVAILABLE SECTORS</h2>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">SYS_LOG: FETCH_SUCCESS</div>
                </div>
              </div>
            </div>

            {subjects.map((subject, index) => {
              const accentColor = index % 2 === 0 ? "secondary" : "primary";
              const accentHex = index % 2 === 0 ? "#4cd7f6" : "#ddb7ff";
              const textColorClass = index % 2 === 0 ? "text-secondary" : "text-primary";
              const bgColorClass = index % 2 === 0 ? "bg-secondary/10" : "bg-primary/10";
              const borderColorClass = index % 2 === 0 ? "border-secondary/20" : "border-primary/20";
              const shadowColor = index % 2 === 0 ? "rgba(76,215,246,0.3)" : "rgba(221,183,255,0.3)";

              return (
                <div key={subject.id} className="col-span-12 md:col-span-6 lg:col-span-4" onClick={() => navigate(`/subjects/${subject.id}`)}>
                  <div className="bg-surface-container-low group hover:bg-surface-container-high transition-all duration-300 hud-card-asymmetric relative border border-outline-variant/5 cursor-pointer flex flex-col h-full hover:translate-y-[-4px]">
                      {/* Subject Image Header */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-700 scale-105 group-hover:scale-100" 
                          alt={subject.title} 
                          src={(() => {
                            const t = (subject.title || "").toLowerCase();
                            if (t.includes("operating")) return "/assets/banners/os.png";
                            if (t.includes("dbms") || t.includes("database")) return "/assets/banners/dbms.png";
                            if (t.includes("network")) return "/assets/banners/cn.png";
                            if (t.includes("oops") || t.includes("object")) return "/assets/banners/oops.png";
                            if (t.includes("system design") || t.includes("systemdesign")) return "/assets/banners/sd.png";
                            return index % 2 === 0 
                              ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDX6IITDzcN2NHKCRbJGIE8npik9KQMQU8N5p8_eeDLvtj56G0DaQvsed1O2Ry7wcaJxUzIDARqGVKJU4kCl_F1qR4Z8L2qnOaH4eaeVOoLfEK5SLTTL88o3xluqT0miMEvVNGbxShtNQukj73hdwMsUnUX0FAH61pEpM9X-QnIZCFJZEp_LrnwQwxJctbAr5651PZRw3JeCzgeqJArKtvWTUvIDbo7ZuNPyjyGf9nzt44v4jSdzqeZTGahyQHELzTkY-OXWAM6DNw"
                              : "https://lh3.googleusercontent.com/aida-public/AB6AXuBCMiMGnnPVVuterg-bbkb66RdvtqZFlsJIEwP-M0D3Z1D0f3fA92_f8lZsaVT6lsgbAl6wl3K2NwiceANH9RKbvag9AakmfmDz4zZdQqpBr0TTJCfo_UF7c7eYPqioE-nouF1-5l-rjcLKqXdgo_MD-yRss7jovpgQbPg2NbwxkTGNO30Kvo-XwONLSPw6SxZjT1hqCistC0t0e9UbVn_qtmyYrYskg53qtwN3JdKTX4kZySfCe5fUqgDfKbEkwcLOrieTKBzBZjY";
                          })()} 
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`${bgColorClass} ${textColorClass} border ${borderColorClass} font-headline text-[9px] px-2 py-1 tracking-widest uppercase backdrop-blur-md`}>
                          SECTOR_0{index + 1}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-headline font-semibold text-on-surface mb-4 uppercase tracking-tight group-hover:text-glow transition-all" style={{"--glow-color": accentHex}}>{subject.title}</h3>
                      <p className="text-xs font-label text-slate-400 leading-relaxed mb-6 line-clamp-2 h-10 italic">
                        {subject.description}
                      </p>
                      
                      <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-label text-slate-500 uppercase tracking-[0.2em]">Synchronization</span>
                          <span className={`text-xs font-headline font-semibold ${textColorClass}`}>{subject.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-surface-container-lowest border border-outline-variant/10">
                          <div className={`h-full bg-${accentColor} transition-all duration-1000`} style={{ width: `${subject.progress}%`, boxShadow: `0 0 10px ${shadowColor}` }}></div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-between items-center pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/subjects/${subject.id}`, { state: { view: 'flashcards' } }); }}
                            className="p-2 bg-surface-container-highest/50 text-slate-400 hover:text-white border border-white/10 transition-all rounded hover:bg-white/5"
                          >
                            <span className="material-symbols-outlined text-lg">style</span>
                          </button>
                        </div>
                        <button className={`flex items-center gap-2 text-[10px] font-headline font-bold ${textColorClass} hover:brightness-125 transition-all uppercase tracking-[0.2em]`}>
                          INITIALIZE
                          <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Footer Telemetry Row */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-surface-container-low/30 p-4 border-l-2 border-secondary/40 flex items-center gap-4 hud-card-asymmetric">
                <span className="material-symbols-outlined text-secondary animate-pulse">database</span>
                <div>
                  <p className="text-[8px] font-label text-slate-500 uppercase tracking-widest">Database Link</p>
                  <p className="text-xs font-headline font-semibold text-on-surface">CONNECTED AES 256</p>
                </div>
              </div>
              <div className="bg-surface-container-low/30 p-4 border-l-2 border-primary/40 flex items-center gap-4 hud-card-asymmetric">
                <span className="material-symbols-outlined text-primary">security</span>
                <div>
                  <p className="text-[8px] font-label text-slate-500 uppercase tracking-widest">Protocol Level</p>
                  <p className="text-xs font-headline font-semibold text-on-surface">SECURE OPERATOR</p>
                </div>
              </div>
              <div className="bg-surface-container-low/30 p-4 border-l-2 border-tertiary/40 flex items-center gap-4 hud-card-asymmetric">
                <span className="material-symbols-outlined text-tertiary">speed</span>
                <div>
                  <p className="text-[8px] font-label text-slate-500 uppercase tracking-widest">Neural Latency</p>
                  <p className="text-xs font-headline font-semibold text-on-surface">OPTIMAL 08MS</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Subjects;
