import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  subscribeToLeaderboard,
  getLiveQuizQuestions,
  subscribeToLiveQuiz,
  getLiveQuizSession,
  getParticipant,
} from "../../services/liveQuizService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

const LiveResult = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const saved = JSON.parse(localStorage.getItem("liveQuizSession") || "{}");
  const state = location.state || {};

  const sessionId = state.sessionId || saved.sessionId;

  const [leaderboard, setLeaderboard] = useState([]);
  const [questions, setQuestions] = useState(state.questions || []);
  const [answersMap, setAnswersMap] = useState(state.answersMap || {});
  const [session, setSession] = useState(state.session || null);
  const [showReview, setShowReview] = useState(false);

  // ================= SESSION =================
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToLiveQuiz(sessionId, (data) => {
      if (data) {
        setSession(data);
      } else if (!session) {
        // ✅ Fallback to history if not in active and not already loaded
        getLiveQuizSession(sessionId).then(setSession);
      }
    });
    return () => unsub && unsub();
  }, [sessionId]);

  // ================= QUESTIONS =================
  useEffect(() => {
    if (!sessionId || questions.length > 0) return;
    getLiveQuizQuestions(sessionId).then(setQuestions);
  }, [sessionId, questions.length]);

  // ================= ANSWERS =================
  useEffect(() => {
    if (!sessionId || !currentUser || Object.keys(answersMap).length > 0) return;

    const fetchAnswers = async () => {
      try {
        const data = await getParticipant(sessionId, currentUser.uid);
        if (data?.answers) {
          setAnswersMap(data.answers);
        }
      } catch (err) {
        console.error("Failed to fetch results:", err);
      }
    };

    fetchAnswers();
  }, [sessionId, currentUser, answersMap]);

  // ================= LEADERBOARD =================
  useEffect(() => {
    // Only subscribe to leaderboard if we have a session AND it's NOT analysis mode
    if (!sessionId || (session && session.type === "analysis")) return;
    
    const unsub = subscribeToLeaderboard(sessionId, setLeaderboard);
    return () => unsub && unsub();
  }, [sessionId, session?.type]);

  // ================= MEDALS =================
  const getMedal = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return "";
  };

  if (!sessionId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-surface-container-low border border-white/5 p-8 text-center asymmetric-card">
          <h2 className="font-headline font-bold text-xl text-error uppercase tracking-widest"><span className="material-symbols-outlined align-middle mr-2">error</span> Invalid Session</h2>
        </div>
      </div>
    );
  }

  if (!session || (session.status !== "finished" && session.type !== "analysis")) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-[#131313] asymmetric-card hud-border p-10 text-center flex flex-col items-center gap-6">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <div>
            <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-[0.2em] mb-2">Calculating Results</h2>
            <p className="font-body text-xs text-slate-500 uppercase tracking-widest">Waiting for simulation data to be published...</p>
          </div>
        </div>
      </div>
    );
  }

  const isAnalysisMode = session?.type === "analysis";

  return (
    <main className="w-full pb-20">
      <div className="flex justify-start mb-12 px-4">
        <button
          onClick={() => navigate("/leaderboard")}
          className="flex items-center gap-2 px-6 py-3 bg-surface-container-low border border-white/5 text-slate-400 font-headline font-bold text-[10px] uppercase tracking-[0.2em] asymmetric-card-small hover:bg-white/10 transition-all group shadow-lg"
        >
          <span className="material-symbols-outlined text-sm group-hover:translate-y-[-2px] transition-transform">leaderboard</span>
          Global Tactical Standings
        </button>
      </div>

      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
           <span className="w-2 h-2 rounded-full bg-primary pulse-emerald"></span>
           <span className="font-headline text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Session_Finalized :: Intel_Published</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tighter uppercase mb-2">
          {isAnalysisMode ? "Mission Analysis" : "Operation Standings"}
        </h1>
        <p className="text-slate-500 font-label text-sm uppercase tracking-[0.4em]">
          {isAnalysisMode ? "POST_MISSION // DATA_BREAKDOWN" : "SQUAD_SYNC // PERFORMANCE_METRICS"}
        </p>
      </section>

      {/* PODIUM SECTION */}
      {!isAnalysisMode && leaderboard.length >= 3 && (
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
      {!isAnalysisMode && (
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
      )}

      {/* REVIEW SECTION */}
      <div className="flex justify-center mb-12">
        {(!showReview && !isAnalysisMode) ? (
          <button
            onClick={() => setShowReview(true)}
            className="px-12 py-5 bg-secondary text-on-secondary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_30px_rgba(78,222,163,0.3)] hover:scale-[1.05] transition-all"
          >
            Review Operational Data
          </button>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-4">
              <h3 className="font-headline font-semibold text-[10px] text-slate-600 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-4 h-[1px] bg-slate-800"></span>
                Intel Breakdown
                <span className="w-4 h-[1px] bg-slate-800"></span>
              </h3>
              
              <div className="flex items-center gap-4 bg-surface-container-low border border-white/5 px-6 py-3 rounded-xl asymmetric-card-small">
                <div>
                   <p className="text-[8px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-1">Personal Score</p>
                   <p className="font-headline font-bold text-xl text-primary tracking-tighter">
                     {Object.keys(answersMap).reduce((acc, idx) => {
                       const q = questions[idx];
                       return acc + (answersMap[idx] === q?.correctAnswer ? 1 : 0);
                     }, 0)} <span className="text-xs text-slate-600 font-semibold tracking-normal">/ {questions.length}</span>
                   </p>
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                <div>
                   <p className="text-[8px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-1">Accuracy</p>
                   <p className="font-headline font-bold text-xl text-secondary tracking-tighter">
                     {Math.round((Object.keys(answersMap).reduce((acc, idx) => {
                       const q = questions[idx];
                       return acc + (answersMap[idx] === q?.correctAnswer ? 1 : 0);
                     }, 0) / (questions.length || 1)) * 100)}%
                   </p>
                </div>
              </div>
            </div>

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

                    {/* Explanation Section */}
                    {q.explanation && (
                      <div className="bg-primary/5 border-l-2 border-primary/30 p-4 mt-6 animate-in fade-in slide-in-from-left-2 duration-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary text-sm">info</span>
                          <span className="font-headline text-[9px] font-bold text-primary uppercase tracking-widest">Tactical Briefing</span>
                        </div>
                        <p className="font-body text-xs text-slate-400 italic leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
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
          onClick={() => {
            localStorage.removeItem("liveQuizSession");
            navigate("/");
          }}
          className="px-12 py-5 bg-surface-container-high text-on-surface-variant font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card hover:bg-white/10 transition-all"
        >
          Return to Command Center
        </button>
      </div>
    </main>
  );
};

export default LiveResult;