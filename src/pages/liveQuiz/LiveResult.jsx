import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  subscribeToLeaderboard,
  getLiveQuizQuestions,
  subscribeToLiveQuiz,
} from "../../services/liveQuizService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

const LiveResult = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const saved = JSON.parse(localStorage.getItem("liveQuizSession") || "{}");
  const state = location.state || {};

  const sessionId = state.sessionId || saved.sessionId;

  const [leaderboard, setLeaderboard] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answersMap, setAnswersMap] = useState({});
  const [session, setSession] = useState(null);
  const [showReview, setShowReview] = useState(false);

  // ================= SESSION =================
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToLiveQuiz(sessionId, setSession);
    return () => unsub && unsub();
  }, [sessionId]);

  // ================= QUESTIONS =================
  useEffect(() => {
    if (!sessionId) return;
    getLiveQuizQuestions(sessionId).then(setQuestions);
  }, [sessionId]);

  // ================= ANSWERS =================
  useEffect(() => {
    if (!sessionId || !currentUser) return;

    const fetchAnswers = async () => {
      const ref = doc(
        db,
        "liveQuizzes",
        sessionId,
        "participants",
        currentUser.uid
      );

      const snap = await getDoc(ref);
      if (snap.exists()) {
        setAnswersMap(snap.data().answers || {});
      }
    };

    fetchAnswers();
  }, [sessionId, currentUser]);

  // ================= LEADERBOARD =================
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToLeaderboard(sessionId, setLeaderboard);
    return () => unsub && unsub();
  }, [sessionId]);

  // ================= MEDALS =================
  const getMedal = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return "";
  };

  if (!sessionId) {
    return (
      <div style={styles.center}>
        <h2>⚠️ Invalid session</h2>
      </div>
    );
  }

  if (!session || session.status !== "finished") {
    return (
      <div style={styles.center}>
        <div style={styles.loaderCard}>
          <h2>⏳ Calculating Results...</h2>
          <p>Waiting for results to be published...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full pb-20">
      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
           <span className="w-2 h-2 rounded-full bg-primary pulse-emerald"></span>
           <span className="font-headline text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Session_Finalized :: Intel_Published</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tighter uppercase mb-2">Operation Standings</h1>
        <p className="text-slate-500 font-label text-sm uppercase tracking-[0.4em]">SQUAD_SYNC // PERFORMANCE_METRICS</p>
      </section>

      {/* PODIUM SECTION */}
      {leaderboard.length >= 3 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
           {/* 2nd Place */}
           <div className="order-2 md:order-1 h-64 bg-surface-container-low asymmetric-card hud-border p-6 flex flex-col items-center justify-end relative group hover:bg-white/5 transition-all">
              <div className="absolute top-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-400/20 border border-slate-400/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">military_tech</span>
                </div>
                <h3 className="font-headline font-semibold text-on-surface uppercase tracking-tight">{leaderboard[1]?.username}</h3>
              </div>
              <div className="w-full text-center mt-auto">
                 <p className="font-headline text-2xl font-bold text-slate-400 mb-1">{leaderboard[1]?.score}</p>
                 <p className="text-[10px] font-headline font-semibold text-slate-600 uppercase tracking-widest border-t border-white/5 pt-2">Rank_02</p>
              </div>
           </div>

           {/* 1st Place */}
           <div className="order-1 md:order-2 h-80 bg-primary/5 asymmetric-card hud-border border-primary/30 p-6 flex flex-col items-center justify-end relative shadow-[0_0_40px_rgba(183,109,255,0.15)] group hover:bg-primary/10 transition-all scale-105 z-10">
              <div className="absolute top-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(183,109,255,0.3)] animate-bounce" style={{ animationDuration: '3s' }}>
                  <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
                </div>
                <h3 className="font-headline font-semibold text-on-surface uppercase tracking-tight text-lg">{leaderboard[0]?.username}</h3>
              </div>
              <div className="w-full text-center mt-auto">
                 <p className="font-headline text-4xl font-bold text-primary mb-1">{leaderboard[0]?.score}</p>
                 <p className="text-[10px] font-headline font-semibold text-primary uppercase tracking-widest border-t border-primary/20 pt-2">Commander_01</p>
              </div>
           </div>

           {/* 3rd Place */}
           <div className="order-3 h-56 bg-surface-container-low asymmetric-card hud-border p-6 flex flex-col items-center justify-end relative group hover:bg-white/5 transition-all">
              <div className="absolute top-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-orange-400/20 border border-orange-400/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-orange-400 text-2xl">military_tech</span>
                </div>
                <h3 className="font-headline font-semibold text-on-surface uppercase tracking-tight">{leaderboard[2]?.username}</h3>
              </div>
              <div className="w-full text-center mt-auto">
                 <p className="font-headline text-2xl font-bold text-orange-400 mb-1">{leaderboard[2]?.score}</p>
                 <p className="text-[10px] font-headline font-semibold text-slate-600 uppercase tracking-widest border-t border-white/5 pt-2">Rank_03</p>
              </div>
           </div>
        </section>
      )}

      {/* FULL LEADERBOARD */}
      <section className="bg-[#131313] asymmetric-card hud-border p-8 mb-12">
        <div className="flex items-center gap-3 mb-8">
           <span className="material-symbols-outlined text-secondary">format_list_numbered</span>
           <h2 className="font-headline font-semibold text-xs text-slate-500 uppercase tracking-[0.3em]">Full Tactical Standings</h2>
        </div>

        <div className="space-y-2">
           {leaderboard.map((user, i) => (
             <div 
               key={user.userId}
               className={`flex items-center justify-between p-4 asymmetric-card-small hud-border transition-all ${user.userId === currentUser?.uid ? 'bg-secondary/10 border-secondary/30' : 'bg-surface-container-lowest hover:bg-white/5'}`}
             >
                <div className="flex items-center gap-4">
                   <span className="font-headline text-[10px] font-bold text-slate-600 w-4">{i + 1}</span>
                   <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                   </div>
                   <div>
                      <span className="font-headline font-semibold text-sm text-on-surface uppercase tracking-tight">{user.username}</span>
                      {user.userId === currentUser?.uid && <span className="ml-3 text-[8px] font-headline font-semibold text-secondary uppercase tracking-widest animate-pulse font-semibold">(YOU)</span>}
                   </div>
                </div>
                <span className={`font-headline font-bold text-lg ${user.userId === currentUser?.uid ? 'text-secondary' : 'text-on-surface-variant'}`}>{user.score}</span>
             </div>
           ))}
        </div>
      </section>

      {/* REVIEW SECTION */}
      <div className="flex justify-center mb-12">
        {!showReview ? (
          <button
            onClick={() => setShowReview(true)}
            className="px-12 py-5 bg-secondary text-on-secondary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_30px_rgba(78,222,163,0.3)] hover:scale-[1.05] transition-all"
          >
            Review Operational Data
          </button>
        ) : (
          <div className="w-full space-y-6">
            <h3 className="font-headline font-semibold text-[10px] text-slate-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-3 px-4">
              <span className="w-4 h-[1px] bg-slate-800"></span>
              Intel Breakdown
              <span className="w-4 h-[1px] bg-slate-800"></span>
            </h3>

            {questions.map((q, i) => {
              const userAns = answersMap[i];
              const correct = q.correctAnswer;
              const isCorrectAt = userAns === correct;

              return (
                <div key={i} className={`bg-[#131313] asymmetric-card-small hud-border p-8 border-l-4 ${isCorrectAt ? 'border-tertiary/20' : 'border-error/20'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className="font-headline text-[10px] font-bold text-slate-700 uppercase tracking-widest">Question 0{i + 1}</span>
                    <div className={`px-3 py-1 rounded text-[9px] font-headline font-semibold uppercase tracking-widest ${isCorrectAt ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' : 'bg-error/10 text-error border border-error/20'}`}>
                       {isCorrectAt ? 'VALID_PROTOCOL' : userAns === undefined ? 'MISSING_DATA' : 'PROTOCOL_ERROR'}
                    </div>
                  </div>

                  <h3 className="font-headline font-semibold text-on-surface text-lg uppercase tracking-tight mb-8">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => {
                      const isCorrectOption = idx === correct;
                      const isUserSelection = idx === userAns;

                      return (
                        <div
                          key={idx}
                          className={`p-4 font-body text-xs uppercase tracking-widest rounded transition-all ${
                            isCorrectOption 
                              ? 'bg-tertiary/20 border border-tertiary shadow-[0_0_15px_rgba(78,222,163,0.1)] text-on-surface font-semibold' 
                              : isUserSelection 
                                ? 'bg-error/20 border border-error text-error' 
                                : 'bg-surface-container-lowest border border-white/5 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-headline text-[10px] opacity-40">{String.fromCharCode(65 + idx)}</span>
                              {opt}
                            </div>
                            {isCorrectOption && <span className="material-symbols-outlined text-xs">done_all</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-center pt-8 border-t border-white/5">
        <button
          onClick={() => (window.location.href = "/")}
          className="px-12 py-5 bg-surface-container-high text-on-surface-variant font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card hover:bg-white/10 transition-all"
        >
          Return to Command Center
        </button>
      </div>
    </main>
  );
};

export default LiveResult;