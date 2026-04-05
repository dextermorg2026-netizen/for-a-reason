import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

const QuizzesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD SUBJECTS ================= */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const raw = await getAllSubjects();

        const normalized = raw.map((s) => ({
          id: s.id,
          name: s.title ?? s.name ?? "Untitled Subject",
          description: s.description ?? s.desc ?? "No description available",
        }));

        if (mounted) setSubjects(normalized);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load subjects.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= LOAD USER PROGRESS ================= */

  useEffect(() => {
    const loadProgress = async () => {
      if (!currentUser) return;

      const q = query(
        collection(db, "quizAttempts"),
        where("userId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(q);

      const subjectProgress = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const subjectId = data.subjectId;
        const difficulty = data.difficulty;

        if (!subjectProgress[subjectId]) {
          subjectProgress[subjectId] = new Set();
        }

        subjectProgress[subjectId].add(difficulty);
      });

      const formatted = {};

      Object.keys(subjectProgress).forEach((subjectId) => {
        formatted[subjectId] = subjectProgress[subjectId].size;
      });

      setProgress(formatted);
    };

    loadProgress();
  }, [currentUser]);

  // Derived Stats
  const activeQuizzesCount = Object.values(progress).filter((v) => v > 0).length;
  const totalCompleted = Object.values(progress).reduce((a, b) => a + b, 0);
  const maxPossible = subjects.length * 3;
  const avgCompletion = maxPossible > 0 ? (totalCompleted / maxPossible) * 100 : 0;

  return (
    <main className="bg-background">
      <div className="w-full p-8">
        {/* Breadcrumbs / Secondary Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-headline font-semibold text-on-surface tracking-tight uppercase">LEARN LOOP</h1>
            <p className="text-sm font-label text-slate-500 mt-1 tracking-[0.2em] uppercase">Tactical Knowledge Repository</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-low px-4 py-2 border border-outline-variant/10 hud-card-asymmetric flex items-center gap-3">
              <span className="text-[10px] font-headline text-secondary uppercase tracking-widest">Active Quizzes</span>
              <span className="text-lg font-headline font-semibold text-on-surface">{activeQuizzesCount.toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-surface-container-low px-4 py-2 border border-outline-variant/10 hud-card-asymmetric flex items-center gap-3">
              <span className="text-[10px] font-headline text-tertiary uppercase tracking-widest">Avg Completion</span>
              <span className="text-lg font-headline font-semibold text-on-surface">{Math.round(avgCompletion)}%</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-surface-container-low p-20 text-center text-slate-500 font-headline uppercase tracking-widest animate-pulse hud-card-asymmetric">
            INITIALIZING_SUBJECT_MATRIX...
          </div>
        ) : error ? (
          <div className="bg-surface-container-low p-20 text-center text-error font-headline uppercase tracking-widest border border-error/20 hud-card-asymmetric">
            SYSTEM_ERROR: {error}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Main Listing Header */}
            <div className="col-span-12">
              <div className="bg-surface-container-low p-6 hud-card-asymmetric relative overflow-hidden">
                <div className="light-leak-top absolute top-0 left-0"></div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="bg-error-container/20 text-error font-headline text-[10px] px-2 py-0.5 tracking-tighter uppercase mb-2 inline-block">MISSION CRITICAL</span>
                    <h2 className="text-2xl font-headline font-semibold text-on-surface">COURSES IN PROGRESS</h2>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant font-label text-xs uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filter Assets
                  </div>
                </div>
              </div>
            </div>

            {subjects.map((subject, index) => {
              const completed = progress[subject.id] || 0;
              const progressPercent = (completed / 3) * 100;
              // Alternate colors based on index for variety as per the design
              const isPrimary = index % 2 !== 0; 
              const colorClass = isPrimary ? "primary" : "secondary";
              const bgColorClass = isPrimary ? "bg-primary/10" : "bg-secondary/10";
              const textColorClass = isPrimary ? "text-primary" : "text-secondary";
              const borderColorClass = isPrimary ? "border-primary/20" : "border-secondary/20";
              const shadowColor = isPrimary ? "rgba(221,183,255,0.5)" : "rgba(76,215,246,0.5)";

              return (
                <div key={subject.id} className="col-span-12 md:col-span-6 lg:col-span-4" onClick={() => navigate(`/quizzes/${subject.id}`)}>
                  <div className="bg-surface-container-low group hover:bg-surface-container-high transition-colors hud-card-asymmetric relative border border-outline-variant/5 cursor-pointer">
                    <div className="aspect-video w-full relative overflow-hidden">
                      <img className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500" data-alt={subject.name} src={isPrimary ? "https://lh3.googleusercontent.com/aida-public/AB6AXuC0W03APrwDBPtQ-mjEF5ckBP_YuvuenskHWUGeVZJCrAeshSg34u0_e7HiK-vqCa8c1WTfAg45lUOF40PQvm_BcwpxFRhldnGgkLqg50ybamegkfNNiPssQOgASx7kmYQEIO7mZAdEwXi0nEQrB5ADmHbGYnerStAToLFbd5-kKvduICZa4M5yb59EasKXbjGDdNBg0rXZqV3ktV02-kjDKEOVHZmR6EJwo0RHuloYq7j1gzIffCNDMLNpZK-ktvTs4JpGlQY-6O0" : "https://lh3.googleusercontent.com/aida-public/AB6AXuC6_OY-oa24Yv6BH8OFTevVFe-9hd9ASPOZkpHx7eabuS7RnWc0SJtcYCoa3j_2RoDyPwItcfdvuxzVGdM3TphShSuhD5YlUdFYrmo3dgvSEBBkevFha2R3TqrxS9ZfjMMY2wHe3bWeR_ULZ5HYm8OgeMqR9WI8BvHcPIHPUqooi9NQytU2Ttoj4JEkw8TOFMjVcRwyucLBivpNoZflHZ48SmCbGSwhx-g-OH7a7K5Nnt40ou3nGzc5oevZIZbOxs_wzvAHqFes60k"} alt={subject.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`${bgColorClass} ${textColorClass} border ${borderColorClass} font-headline text-[9px] px-2 py-1 tracking-widest uppercase`}>
                          {subject.name.substring(0, 10)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-headline font-semibold text-on-surface mb-4">{subject.name}</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-label text-slate-400 uppercase tracking-widest">Progress: {completed} / 3 completed</span>
                          <span className={`text-xs font-headline font-semibold ${textColorClass}`}>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full h-1 bg-surface-container-lowest border border-outline-variant/10">
                          <div className={`w-0 h-full bg-${colorClass}`} style={{ width: `${progressPercent}%`, boxShadow: `0 0 8px ${shadowColor}` }}></div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-background overflow-hidden bg-surface-container-highest">
                            <img className="w-full h-full object-cover grayscale" data-alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqkdlYt7FGlraK1ZLxhHXPcmlgQtujIjm49b2Ow3-HEBD_eIdXlgAZ44lf4GHPzB-9c0yKTdk4qDcei46LxoPjRFJsoG-HBbDlvWFKc2go8GVoIgj4DubCO33TjvR5UwS_5yetfvJ6UCyhAGHlU9CeDP5J7eZ_1REq0R4P3DGra3c9Mujlropn3ijzH8HH9WRBdB6B7nh6dcdI8srZr1Fs-7VpmdH7QmWMJ1d0C4Oi2e8MX9YLbSVW2YZdTmonFf5Dq9RQlxmgc7s"/>
                          </div>
                          <div className="w-6 h-6 rounded-full border border-background overflow-hidden bg-surface-container-highest flex items-center justify-center">
                            <span className="text-[8px] font-semibold text-slate-400">+{Math.floor(Math.random() * 20) + 5}</span>
                          </div>
                        </div>
                        <button className={`flex items-center gap-2 text-xs font-headline font-semibold ${textColorClass} hover:text-white transition-colors uppercase tracking-widest`}>
                          INITIALIZE
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Data Telemetry / Stats Side Panel */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest p-6 border border-outline-variant/10 hud-card-asymmetric">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <h4 className="font-headline font-semibold text-sm tracking-widest uppercase">System Telemetry</h4>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-label text-slate-500 uppercase tracking-[0.2em]">Uptime</p>
                      <p className="font-headline text-lg text-on-surface">99.987%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-label text-slate-500 uppercase tracking-[0.2em]">Latency</p>
                      <p className="font-headline text-lg text-tertiary">14ms</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/5">
                    <p className="text-[10px] font-label text-slate-500 uppercase tracking-[0.2em] mb-4">Encryption Status</p>
                    <div className="grid grid-cols-5 gap-1">
                      <div className="h-6 bg-tertiary/20 border border-tertiary/30"></div>
                      <div className="h-6 bg-tertiary/20 border border-tertiary/30"></div>
                      <div className="h-6 bg-tertiary/20 border border-tertiary/30"></div>
                      <div className="h-6 bg-surface-container-high border border-white/5"></div>
                      <div className="h-6 bg-surface-container-high border border-white/5"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tactical Quick Start */}
              <div 
                className="bg-gradient-to-br from-primary-container/20 to-transparent p-6 border border-primary/20 hud-card-asymmetric group cursor-pointer hover:from-primary-container/30 transition-all flex flex-col justify-between"
                onClick={() => navigate('/leaderboard')}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>leaderboard</span>
                  <span className="bg-primary text-on-primary text-[8px] font-semibold px-1.5 py-0.5 tracking-tighter">GLOBAL</span>
                </div>
                <h4 className="font-headline font-semibold text-lg text-on-surface mb-2">Check Rankings</h4>
                <p className="text-xs font-label text-on-surface-variant leading-relaxed mb-6">Analyze operative efficiency and global standings across the network.</p>
                <button 
                  className="w-full py-2 bg-surface-container-highest text-primary border border-primary/30 font-headline font-semibold text-[10px] tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-all flex justify-center items-center gap-2"
                >
                  VIEW LEADERBOARD <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Footer-style Secondary Feed */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-surface-container-low/50 p-4 border-l-2 border-secondary/40 flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary">terminal</span>
                <div>
                  <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest">Protocol Version</p>
                  <p className="text-xs font-headline font-semibold text-on-surface">VYRO_V1.0.42</p>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-4 border-l-2 border-primary/40 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">security</span>
                <div>
                  <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest">Security Clearance</p>
                  <p className="text-xs font-headline font-semibold text-on-surface">LEVEL_04_OPERATOR</p>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-4 border-l-2 border-tertiary/40 flex items-center gap-4">
                <span className="material-symbols-outlined text-tertiary">cloud_done</span>
                <div>
                  <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest">Sync Status</p>
                  <p className="text-xs font-headline font-semibold text-on-surface">ENCRYPTED_CLOUD_ACTIVE</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default QuizzesPage;