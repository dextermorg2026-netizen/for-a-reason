import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserQuizAttempt } from "../../services/quizAttemptService";

const levels = [
  {
    id: "easy",
    title: "Easy",
    description: "Basic questions to test your fundamentals.",
  },
  {
    id: "medium",
    title: "Medium",
    description: "Moderate difficulty questions.",
  },
  {
    id: "hard",
    title: "Hard",
    description: "Advanced challenge questions.",
  },
];

const SubjectQuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= LOAD USER ATTEMPTS ================= */

  useEffect(() => {
    const loadAttempts = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.all(
          levels.map((level) =>
            getUserQuizAttempt(currentUser.uid, subjectId, level.id)
          )
        );

        const formatted = {};

        results.forEach((attempt, index) => {
          if (attempt) {
            formatted[levels[index].id] = attempt;
          }
        });

        setAttempts(formatted);
      } catch (err) {
        console.error("Failed loading quiz attempts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, [currentUser, subjectId]);

  /* ================= HANDLE REVIEW ================= */

  const handleReview = async (levelId) => {
    if (!currentUser) return;

    try {
      const freshAttempt = await getUserQuizAttempt(
        currentUser.uid,
        subjectId,
        levelId
      );

      if (!freshAttempt) return;

      navigate("/quiz/result", {
        state: {
          score: freshAttempt?.score ?? 0,
          total: freshAttempt?.questions?.length ?? 0,
          coinsEarned: freshAttempt?.coinsEarned ?? 0,
          questions: freshAttempt?.questions ?? [],
          answers: freshAttempt?.answers ?? {},
        },
      });
    } catch (err) {
      console.error("Failed loading review:", err);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Choose Difficulty</h1>
        <p className="muted">Loading quizzes...</p>
      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <main className="max-w-4xl mx-auto pb-20">
      <section className="mb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight uppercase">Select protocol level</h1>
          <p className="text-slate-500 font-label text-xs uppercase tracking-[0.4em]">MISSION_PARAMETERS // DIFFICULTY_ADJUSTMENT</p>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="asymmetric-card hud-border h-48 bg-surface-container-low animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-8">
          {levels.map((level) => {
            const attempt = attempts[level.id];
            const completed = Boolean(attempt);
            const score = attempt?.score ?? 0;
            const total = attempt?.questions?.length ?? 0;
            const percent = total > 0 ? (score / total) * 100 : 0;

            return (
              <div 
                key={level.id} 
                className={`group relative bg-[#131313] asymmetric-card-small hud-border p-8 transition-all duration-500 hover:shadow-[0_0_30px_rgba(183,109,255,0.1)] ${completed ? 'border-tertiary/30' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        level.id === 'easy' ? 'bg-secondary/10 border-secondary/20 text-secondary' :
                        level.id === 'medium' ? 'bg-primary/10 border-primary/20 text-primary' :
                        'bg-error/10 border-error/20 text-error'
                      }`}>
                        <span className="material-symbols-outlined text-xl">
                          {level.id === 'easy' ? 'ecg_heart' : level.id === 'medium' ? 'bolt' : 'skull'}
                        </span>
                      </div>
                      <h3 className="font-headline font-semibold text-xl text-on-surface uppercase tracking-tight">
                        {level.title}_MOD
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-500 uppercase tracking-widest max-w-md">
                      {level.description}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-6 min-w-[200px]">
                    {completed ? (
                      <div className="w-full space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="font-headline text-[9px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Previous Sync</span>
                            <span className="font-headline text-[10px] font-semibold text-tertiary tracking-widest">SUCCESSFUL</span>
                          </div>
                          <div className="text-right">
                             <span className="font-headline text-lg font-semibold text-on-surface">{score}/{total}</span>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-tertiary shadow-[0_0_10px_#4edea3]" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleReview(level.id)}
                            className="flex-1 py-3 bg-tertiary/10 border border-tertiary/30 text-tertiary font-headline font-semibold text-[10px] uppercase tracking-widest asymmetric-card hover:bg-tertiary/20 transition-all"
                          >
                            Review Intel
                          </button>
                          <button 
                            onClick={() => navigate(`/quiz/${subjectId}/${level.id}`)}
                            className="flex-1 py-3 bg-primary/10 border border-primary/30 text-primary font-headline font-semibold text-[10px] uppercase tracking-widest asymmetric-card hover:bg-primary/20 transition-all"
                          >
                            Redeploy Mission
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => navigate(`/quiz/${subjectId}/${level.id}`)}
                        className={`w-full py-5 font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
                          level.id === 'easy' ? 'bg-secondary text-secondary-container shadow-secondary/20' :
                          level.id === 'medium' ? 'bg-primary text-on-primary shadow-primary/20' :
                          'bg-error text-error-container shadow-error/20'
                        }`}
                      >
                        Deploy Mission
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-4 left-4 font-headline text-[7px] text-slate-800 uppercase tracking-widest pointer-events-none group-hover:text-slate-700 transition-colors">
                  SEC_AUTH_LEVEL::{level.id.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default SubjectQuizPage;