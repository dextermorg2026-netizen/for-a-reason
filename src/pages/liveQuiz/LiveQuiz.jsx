import { useEffect, useRef, useState } from "react";
import {
  subscribeToLiveQuiz,
  getLiveQuizQuestions,
  getLiveQuizSession,
  submitLiveAnswer,
  startLiveQuiz,
  finishLiveQuiz,
  joinParticipant,
  calculateScore,
  getParticipant,
  subscribeToParticipant,
  recordParticipantStartTime,
  updateParticipantIndex,
} from "../../services/liveQuizService";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import LiveHistorySection from "./components/LiveHistorySection";

const LiveQuiz = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [joined, setJoined] = useState(false);
  const [sessionId, setSessionId] = useState(location.state?.code || "");
  const [username, setUsername] = useState("");

  const [session, setSession] = useState(undefined);
  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [participantData, setParticipantData] = useState(undefined);
  const [activeSessions, setActiveSessions] = useState([]);
  const hasAutoSubmittedRef = useRef(false);

  const isHost = userProfile?.role === "admin";

  const getMillis = (value) => {
    if (typeof value === "number") return value;
    if (value && typeof value.toMillis === "function") {
      return value.toMillis();
    }
    return null;
  };

  // ================= GLOBAL LIVE DETECTION =================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "liveQuizzes"), (snap) => {
      const active = [];
      snap.forEach((doc) => {
        if (doc.data().status === "playing") {
          active.push({ 
            code: doc.id, 
            type: doc.data().type || 'competitive',
            subject: doc.data().subject || 'General'
          });
        }
      });
      setActiveSessions(active);
    });
    return () => unsub();
  }, []);

  const handleQuickSync = (code) => {
    if (code) {
      clearAndReset(); // Wipe old mission state
      setSessionId(code); // Pre-fill new mission ID
    }
  };

  // ================= SUBSCRIPTIONS & RESTORE =================
  useEffect(() => {
    const saved = localStorage.getItem("liveQuizSession");
    if (!saved || !currentUser) return;

    const { 
      sessionId: savedId, 
      username: savedName, 
      answersMap: savedAnswers,
      currentIndex: savedIndex 
    } = JSON.parse(saved);

    if (!savedId) return;

    setSessionId(savedId);
    setUsername(savedName);
    if (savedAnswers) setAnswersMap(savedAnswers);
    if (savedIndex !== undefined) setCurrentIndex(savedIndex);
    setJoined(true);

    // Load questions
    getLiveQuizQuestions(savedId).then(setQuestions);

    // Subscribe to Session
    const unsubSession = subscribeToLiveQuiz(savedId, (data) => {
      setSession(data);
    });

    // Subscribe to Participant
    const unsubParticipant = subscribeToParticipant(savedId, currentUser.uid, (data) => {
      setParticipantData(data);
      if (data?.answers && Object.keys(data.answers).length > Object.keys(answersMap).length) {
        setAnswersMap(data.answers);
      }
      if (data?.lastViewedIndex !== undefined && data.lastViewedIndex > currentIndex) {
        setCurrentIndex(data.lastViewedIndex);
      }
    });

    // Check if finished
    getParticipant(savedId, currentUser.uid).then((p) => {
      if (p?.finished) {
        setIsFinished(true);
        hasAutoSubmittedRef.current = true;
      }
    });

    return () => {
      unsubSession();
      unsubParticipant();
    };
  }, [currentUser]);

  // ================= PARTICIPANT START TRIGGER =================
  useEffect(() => {
    if (joined && session?.status === "playing" && !participantData?.startedAt) {
      recordParticipantStartTime(sessionId, currentUser?.uid);
    }
  }, [session?.status, joined, participantData?.startedAt]);
  const clearAndReset = (msg) => {
    localStorage.removeItem("liveQuizSession");
    setJoined(false);
    setSessionId("");
    setQuestions([]);
    setAnswersMap({});
    setSession(undefined);
    setParticipantData(undefined);
    setIsFinished(false);
    setCurrentIndex(0);
    hasAutoSubmittedRef.current = false;
    if (msg) alert(msg);
  };

  useEffect(() => {
    if (joined && session === null) {
      console.warn("Session no longer exists. Resetting...");
      clearAndReset("This live quiz session has been closed or deleted.");
    }
  }, [session, joined]);

  useEffect(() => {
    if (joined && participantData === null && session?.status === "playing") {
      console.warn("Participant data no longer exists.");
      clearAndReset("Your session data was removed. Please join again.");
    }
  }, [participantData, joined, session?.status]);

  // ================= TIMER =================
  useEffect(() => {
    if (!participantData?.startedAt || session?.status === "waiting") return;
  
    const duration = session?.duration || 1200; // default 20 mins
    const endAt = participantData.startedAt + duration * 1000;
  
    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.floor((endAt - Date.now()) / 1000)
      );
  
      setTimeLeft(remaining);
  
      if (remaining === 0) autoSubmit();
    };
  
    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [participantData?.startedAt, session?.status, session?.duration]);

  const autoSubmit = async () => {
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
  
    console.log("Auto submitting...");
  
    try {
      if (sessionId && currentUser?.uid) {
        await calculateScore(sessionId, currentUser.uid);
      }
    } catch (err) {
      console.error("Score calculation failed:", err);
    }
  
    setIsFinished(true);
  };

  // ================= NAVIGATION =================
  useEffect(() => {
    const isReadyForResults = session?.status === "finished" || (session?.type === "analysis" && isFinished);

    if (isReadyForResults && isFinished) {
      // Move to results
      navigate("/live/result", {
        state: { sessionId },
      });
    }
  }, [session?.status, session?.type, isFinished]);

  // ================= JOIN =================
  const handleJoin = async () => {
    if (!sessionId || !username) return alert("Enter details");

    try {
      const sessionData = await getLiveQuizSession(sessionId);
      if (!sessionData) {
        return alert("Invalid Quiz Code!");
      }

      if (sessionData.status === "finished") {
        return alert("This quiz has already ended!");
      }

      // ✅ CHECK IF ALREADY FINISHED
      const participant = await getParticipant(sessionId, currentUser?.uid);
      if (participant?.finished) {
        setIsFinished(true);
        hasAutoSubmittedRef.current = true;
        setJoined(true);
        subscribeToLiveQuiz(sessionId, setSession);
        return;
      }

      const qs = await getLiveQuizQuestions(sessionId);
      setQuestions(qs);

      await joinParticipant({
        sessionId,
        userId: currentUser?.uid,
        username,
      });

      // ✅ RESTORE PREVIOUS ANSWERS IF RE-JOINING
      const initialAnswers = participant?.answers || {};
      setAnswersMap(initialAnswers);

      localStorage.setItem(
        "liveQuizSession",
        JSON.stringify({ 
          sessionId, 
          username, 
          answersMap: initialAnswers,
          currentIndex: 0 
        })
      );

      subscribeToLiveQuiz(sessionId, setSession);
      subscribeToParticipant(sessionId, currentUser.uid, setParticipantData);
      setJoined(true);
    } catch (err) {
      console.error("Failed to join:", err);
      alert("Error joining quiz.");
    }
  };

  // ================= ANSWER =================
  const handleSelect = async (index) => {
    try {
      await submitLiveAnswer({
        sessionId,
        userId: currentUser?.uid,
        questionIndex: currentIndex,
        selectedOptionIndex: index,
      });

      setAnswersMap((prev) => {
        const newMap = { ...prev, [currentIndex]: index };
        
        const saved = JSON.parse(localStorage.getItem("liveQuizSession") || "{}");
        localStorage.setItem(
          "liveQuizSession",
          JSON.stringify({ ...saved, answersMap: newMap })
        );
        
        return newMap;
      });
    } catch (err) {
      console.error("Answer submission failed:", err);
    }
  };

  // ✅ PERSIST CURRENT INDEX
  useEffect(() => {
    if (!joined) return;
    const saved = JSON.parse(localStorage.getItem("liveQuizSession") || "{}");
    localStorage.setItem(
      "liveQuizSession",
      JSON.stringify({ ...saved, currentIndex })
    );

    // ✅ PERSIST TO FIREBASE FOR CROSS-DEVICE
    if (sessionId && currentUser?.uid) {
      updateParticipantIndex(sessionId, currentUser.uid, currentIndex);
    }
  }, [currentIndex, joined]);

  // ================= SUBMIT =================
  const handleFinish = async () => {
    if (!window.confirm("Submit quiz?")) return;
    await autoSubmit();
  };

  // ================= HOST =================
  const handleStart = async () => {
    try {
      await startLiveQuiz(sessionId); // ✅ no duration
    } catch (err) {
      console.error("[LiveQuiz] Failed to start timer:", err);
      alert("Could not start live quiz timer.");
    }
  };

  const handleEnd = async () => {
    if (!window.confirm("End quiz for everyone?")) return;
    try {
      await finishLiveQuiz(sessionId);
    } catch (err) {
      console.error("[LiveQuiz] Failed to end quiz:", err);
      alert("Could not end quiz. Please try again.");
    }
  };

  // ================= RENDER =================
  if (!joined) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 gap-6">
        {/* Active Mission Alert Banners */}
        {activeSessions.length > 0 && (
          <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            {activeSessions.map((s) => (
              <div key={s.code} className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between backdrop-blur-md shadow-[0_0_20px_rgba(221,183,255,0.1)] group hover:border-primary/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/20">
                     <span className={`material-symbols-outlined text-primary ${s.type === 'analysis' ? 'text-secondary' : ''} animate-pulse`}>
                        {s.type === 'analysis' ? 'analytics' : 'radar'}
                     </span>
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <h4 className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em]">Active Mission</h4>
                        {s.type === 'analysis' && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded font-bold uppercase tracking-tighter">Analysis</span>
                        )}
                     </div>
                     <p className="text-[11px] font-mono text-white/70 font-bold uppercase tracking-widest">{s.code} <span className="text-[8px] opacity-40 mx-2">//</span> {s.subject}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickSync(s.code)}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 rounded text-[9px] font-headline font-bold text-primary uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap"
                >
                  Quick Sync
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="w-full max-w-md bg-[#131313] asymmetric-card hud-border p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-1000"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20 shadow-inner animate-pulse">
              <span className="material-symbols-outlined text-4xl">sensors</span>
            </div>
            
            <h1 className="font-headline font-bold text-3xl text-on-surface uppercase tracking-tighter mb-4">Live Join</h1>
            <p className="font-label text-xs text-slate-500 uppercase tracking-[0.3em] mb-10">Simulation Entrance Protocol</p>
            
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/50 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <input
                  type="text"
                  placeholder="OPERATOR_NAME"
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-sm pl-10 pr-4 py-4 font-headline text-xs font-semibold text-on-surface placeholder:text-slate-700 uppercase tracking-widest focus:outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[inset_4px_0_0_0_#ddb7ff] transition-all text-left"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary/50 group-focus-within:text-secondary transition-colors">
                  <span className="material-symbols-outlined text-sm">tag</span>
                </div>
                <input
                  type="text"
                  placeholder="QUIZ_CODE_000"
                  value={sessionId}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-sm pl-10 pr-4 py-4 font-headline text-xs font-semibold text-on-surface placeholder:text-slate-700 uppercase tracking-widest focus:outline-none focus:border-secondary/50 focus:bg-secondary/5 focus:shadow-[inset_4px_0_0_0_#4cd7f6] transition-all text-left"
                  onChange={(e) => setSessionId(e.target.value)}
                />
              </div>
              
              <button 
                className="w-full py-5 bg-primary text-on-primary font-headline font-bold text-sm uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_30px_rgba(183,109,255,0.4)] hover:scale-[1.02] transition-transform mt-4"
                onClick={handleJoin}
              >
                Establish Connection
              </button>
            </div>
            
            <div className="mt-8 bg-surface-container-lowest border border-white/5 p-4 rounded-sm text-left">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                <span className="text-[9px] font-headline font-semibold text-slate-500 uppercase tracking-widest">System Diagnostics</span>
              </div>
              <ul className="space-y-2 font-mono text-[9px] text-slate-400">
                <li className="flex justify-between"><span>PROTOCOL:</span> <span className="text-secondary font-semibold tracking-widest">VYRO_041-LIVE</span></li>
                <li className="flex justify-between"><span>SESSION HASH:</span> <span className="text-primary font-semibold tracking-widest">#VRX-9922-K</span></li>
                <li className="flex justify-between"><span>CORE STATUS:</span> <span className="text-tertiary shadow-[0_0_5px_rgba(78,222,163,0.5)]">ONLINE</span></li>
                <li className="flex justify-between"><span>SYNC:</span> <span className="text-white font-semibold">100%</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Global Personal History Section */}
        <LiveHistorySection userId={currentUser?.uid} />
      </div>
    );
  }

  if (session?.status === "waiting") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#131313] asymmetric-card hud-border p-12 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
            <span className="material-symbols-outlined text-5xl text-secondary animate-spin" style={{ animationDuration: '3s' }}>hourglass_empty</span>
          </div>
          
          <h2 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-widest mb-4">Standby Mode</h2>
          <p className="font-body text-slate-500 text-sm uppercase tracking-[0.2em] mb-12">Waiting for mission coordinator to authorize launch...</p>
          
          {isHost ? (
            <button 
              className="w-full py-5 bg-secondary text-on-secondary font-headline font-bold text-sm uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_30px_rgba(78,222,163,0.3)] hover:scale-[1.02] transition-transform"
              onClick={handleStart}
            >
              Start Mission now
            </button>
          ) : (
             <div className="p-6 bg-surface-container-lowest border border-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-headline text-[9px] uppercase text-slate-500 font-semibold tracking-widest">Signal Strength</span>
                  <span className="font-headline text-[9px] uppercase text-secondary font-semibold tracking-widest">Optimal</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex gap-1">
                  <div className="h-full bg-secondary flex-1"></div>
                  <div className="h-full bg-secondary flex-1"></div>
                  <div className="h-full bg-secondary flex-1"></div>
                  <div className="h-full bg-secondary flex-1 opacity-50"></div>
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  if (joined && isFinished && session?.status !== "finished" && session?.type !== "analysis") {
    const otherSessions = activeSessions.filter(s => s.code !== sessionId);

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 gap-10">
        <div className="w-full max-w-lg bg-[#131313] asymmetric-card hud-border p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="w-24 h-24 bg-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-tertiary/20 shadow-[0_0_30px_rgba(78,222,163,0.2)]">
            <span className="material-symbols-outlined text-5xl text-tertiary">check_circle</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-widest mb-4">Intel Transmitted</h2>
          <p className="font-body text-slate-500 text-sm uppercase tracking-[0.2em] mb-8 leading-relaxed">
            All operational data has been successfully uploaded to the central mainframe.
          </p>
          <div className="p-6 bg-surface-container-lowest border-l-4 border-secondary rounded flex justify-between items-center mb-8">
             <div className="text-left">
               <p className="font-headline text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">System Status</p>
               <p className="font-headline text-xs font-semibold text-on-surface tracking-widest">AWAITING_SQUAD_COMPLETION...</p>
             </div>
             <span className="material-symbols-outlined text-secondary animate-pulse">cloud_upload</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => clearAndReset()}
              className="w-full py-4 bg-surface-container-low border border-white/10 text-on-surface font-headline font-semibold text-[10px] uppercase tracking-[0.3em] asymmetric-card hover:bg-white/5 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-sm">rebase_edit</span> Retarget Signal Hub
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
             <SignalGame />
          </div>
        </div>

        {/* Other Active Missions Section */}
        {otherSessions.length > 0 && (
          <div className="w-full max-w-lg space-y-4">
            <div className="flex items-center gap-3 mb-2 px-4">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <h3 className="font-headline font-semibold text-[10px] text-slate-500 uppercase tracking-[0.3em]">Other Active Frequencies Detected</h3>
            </div>
            {otherSessions.map((s) => (
              <div key={s.code} className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between backdrop-blur-md shadow-[0_0_20px_rgba(221,183,255,0.1)] group hover:border-primary/50 transition-all scale-95 opacity-80 hover:opacity-100 hover:scale-100 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/20">
                     <span className={`material-symbols-outlined text-primary text-sm ${s.type === 'analysis' ? 'text-secondary' : ''} animate-pulse`}>
                        {s.type === 'analysis' ? 'analytics' : 'radar'}
                     </span>
                  </div>
                  <div>
                     <div className="flex items-center gap-1">
                        <h4 className="text-[8px] font-headline font-bold text-primary uppercase tracking-[0.2em]">{s.code}</h4>
                        {s.type === 'analysis' && <span className="text-[7px] px-1 py-0.5 bg-secondary/20 text-secondary rounded font-bold uppercase">Analysis</span>}
                     </div>
                     <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">{s.subject}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickSync(s.code)}
                  className="px-3 py-1.5 bg-primary/20 hover:bg-primary/40 border border-primary/40 rounded text-[8px] font-headline font-bold text-primary uppercase tracking-widest transition-all active:scale-95"
                >
                  Quick Sync
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full pb-20">
      {/* Question Main Panel */}
      <div className="lg:col-span-9 space-y-8">
        <div className="bg-[#131313] asymmetric-card hud-border p-8 md:p-12 relative min-h-[400px] flex flex-col">
          <div className="flex justify-between items-start mb-12">
            <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded text-primary font-headline text-xs font-semibold uppercase tracking-widest">
              MISSION_LOG 0{currentIndex + 1}
            </div>
            <div className="flex items-center gap-3">
               <span className="material-symbols-outlined text-secondary text-base">timer</span>
               <span className="font-headline text-2xl font-bold text-on-surface tracking-tighter">
                 {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
               </span>
            </div>
          </div>

          <h2 className="font-headline font-semibold text-2xl md:text-3xl text-on-surface leading-tight mb-12 md:pr-20 uppercase tracking-tight">
            {currentQ?.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
            {currentQ?.options.map((opt, i) => {
              const isSelected = answersMap[currentIndex] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`group relative p-6 text-left border transition-all duration-300 asymmetric-card-small ${
                    isSelected 
                      ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(183,109,255,0.2)]" 
                      : "bg-surface-container-lowest border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded border flex items-center justify-center font-headline text-xs font-bold transition-all ${
                      isSelected 
                        ? "bg-primary text-on-primary border-primary" 
                        : "bg-surface-container-low border-white/10 text-slate-500 group-hover:border-primary/50 group-hover:text-primary"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`font-body text-sm md:text-base uppercase tracking-wider ${isSelected ? 'text-on-surface font-semibold' : 'text-slate-400 group-hover:text-on-surface'}`}>
                      {opt}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(p - 1, 0))}
              disabled={currentIndex === 0}
              className="flex-1 md:flex-none px-8 py-4 bg-surface-container-low border border-white/10 text-slate-400 font-headline font-semibold text-xs uppercase tracking-widest asymmetric-card hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous Protocol
            </button>
            <button
              onClick={() => setCurrentIndex((p) => Math.min(p + 1, questions.length - 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex-1 md:flex-none px-8 py-4 bg-surface-container-low border border-white/10 text-slate-400 font-headline font-semibold text-xs uppercase tracking-widest asymmetric-card hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Protocol
            </button>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {isHost && (
              <button
                onClick={handleEnd}
                className="flex-1 md:flex-none px-8 py-4 bg-error/10 border border-error/30 text-error font-headline font-semibold text-xs uppercase tracking-widest asymmetric-card hover:bg-error/20 transition-all"
              >
                Abort Mission
              </button>
            )}
            <button
              onClick={handleFinish}
              className="flex-1 md:flex-none px-12 py-4 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-widest asymmetric-card shadow-[0_0_20px_rgba(183,109,255,0.3)] hover:scale-[1.02] transition-transform"
            >
              Submit Intel
            </button>
          </div>
        </div>
      </div>

      {/* Side HUD Palette */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-[#131313] asymmetric-card hud-border p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <h3 className="font-headline font-semibold text-[10px] text-slate-500 uppercase tracking-[0.3em]">Telemetry Palette</h3>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {questions.map((_, i) => {
              const isAnswered = answersMap[i] !== undefined;
              const isActive = i === currentIndex;
              
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`aspect-square rounded flex items-center justify-center font-headline text-[10px] font-bold transition-all ${
                    isActive 
                      ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(183,109,255,0.5)] border-primary" 
                      : isAnswered 
                        ? "bg-secondary/20 text-secondary border border-secondary/30" 
                        : "bg-surface-container-lowest text-slate-700 border border-white/5 hover:border-white/20"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 space-y-4">
             <div className="flex justify-between items-center text-[10px] font-headline font-semibold">
               <span className="text-slate-600 uppercase tracking-widest">Completed</span>
               <span className="text-secondary">{Object.keys(answersMap).length} / {questions.length}</span>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary" 
                  style={{ width: `${(Object.keys(answersMap).length / (questions.length || 1)) * 100}%` }}
                ></div>
             </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 p-6 asymmetric-card-small">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">security</span>
            <span className="font-headline text-[8px] font-semibold text-primary uppercase tracking-[0.3em]">Encryption Secure</span>
          </div>
          <p className="text-[10px] font-body text-slate-500 uppercase tracking-tighter">Your session data is localized and synchronized with the central node.</p>
        </div>
      </div>
    </div>
  );
};

// ==============================
// 🎮 MINI-GAME: SIGNAL SYNC
// ==============================
const SignalGame = () => {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, playing, success, error

  const startRound = () => {
    const nextNode = Math.floor(Math.random() * 9);
    const newSeq = [...sequence, nextNode];
    setSequence(newSeq);
    setUserSequence([]);
    flashSequence(newSeq);
  };

  const flashSequence = async (seq) => {
    setIsFlashing(true);
    setStatus("playing");
    for (let i = 0; i < seq.length; i++) {
      setActiveIndex(seq[i]);
      await new Promise(r => setTimeout(r, 600));
      setActiveIndex(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsFlashing(false);
  };

  const handleNodeClick = (index) => {
    if (isFlashing || status !== "playing") return;

    const newSeq = [...userSequence, index];
    setUserSequence(newSeq);

    if (index !== sequence[newSeq.length - 1]) {
      setStatus("error");
      setTimeout(() => {
        setSequence([]);
        setUserSequence([]);
        setScore(0);
        setStatus("idle");
      }, 1500);
      return;
    }

    if (newSeq.length === sequence.length) {
      setScore(s => s + 1);
      setStatus("success");
      setTimeout(startRound, 800);
    }
  };

  return (
    <div className="max-w-xs mx-auto text-center">
      <div className="flex items-center justify-between mb-6">
        <div className="text-left">
          <h4 className="font-headline text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">Signal Sync</h4>
          <p className="font-headline text-[8px] text-slate-600 uppercase tracking-widest leading-none">Stabilize Encryption</p>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 px-3 py-1 rounded">
           <span className="font-mono text-xs text-secondary font-bold">LVL_{score}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-black/20 rounded-xl border border-white/5">
        {[...Array(9)].map((_, i) => (
          <button
            key={i}
            onClick={() => handleNodeClick(i)}
            className={`aspect-square rounded-lg border transition-all duration-200 ${
              activeIndex === i 
                ? "bg-secondary shadow-[0_0_20px_#4cd7f6] border-secondary" 
                : "bg-surface-container-lowest border-white/5 hover:border-white/10"
            } ${status ==='error' && sequence.includes(i) ? 'border-error bg-error/10' : ''}`}
          />
        ))}
      </div>

      {status === "idle" && (
        <button 
          onClick={startRound}
          className="w-full py-3 bg-secondary/20 border border-secondary/40 text-secondary font-headline text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-secondary/30 transition-all"
        >
          Initialize Sync
        </button>
      )}

      {status === "playing" && (
        <p className="font-headline text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">
          {isFlashing ? "Observing Signal..." : "Replicating..."}
        </p>
      )}

      {status === "success" && (
        <p className="font-headline text-[10px] text-tertiary uppercase tracking-widest font-bold">
          Signal Locked
        </p>
      )}

      {status === "error" && (
        <p className="font-headline text-[10px] text-error uppercase tracking-widest font-bold">
          Sync Corrupted
        </p>
      )}
    </div>
  );
};

export default LiveQuiz;