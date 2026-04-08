import { useEffect, useState } from "react";
import useLeaderboard from "../../hooks/useLeaderboard";
import { getAllSubjects } from "../../services/subjectService";
import { getAllPastSessions, getPastLeaderboard } from "../../services/liveQuizService";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

import SubjectTabs from "./components/SubjectTabs";
import PodiumSection from "./components/PodiumSection";
import LeaderboardTable from "./components/LeaderboardTable";

import "./Leaderboard.css";

const LeaderboardPage = () => {
  const { currentUser } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");

  const [liveSessions, setLiveSessions] = useState([]);
  const [selectedLiveSessionId, setSelectedLiveSessionId] = useState(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);

  // Hook-based entries for regular subjects
  const { entries: subjectEntries, loading: loadingSubjectEntries } = useLeaderboard(selectedSubject !== 'LIVE_QUIZ' ? selectedSubject : null);

  // Use either subject entries or live leaderboard
  const entries = selectedSubject === 'LIVE_QUIZ' ? liveLeaderboard : subjectEntries;
  const loading = selectedSubject === 'LIVE_QUIZ' ? loadingLive : loadingSubjectEntries;



  useEffect(() => {
    let mounted = true;

    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const raw = await getAllSubjects();

        const normalized = Array.isArray(raw)
          ? raw.map((s) => ({
              id: s.id,
              name: s.title ?? s.name ?? "Untitled Subject",
            }))
          : [];

        if (!mounted) return;

        // ✅ Add Live Quiz as a special subject
        const allTabs = [
          ...normalized,
          { id: 'LIVE_QUIZ', name: 'Live Quiz Hub 📡' }
        ];

        setSubjects(allTabs);

        if (!selectedSubject && allTabs.length > 0) {
          setSelectedSubject(allTabs[0].id);
        }
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load subjects.");
        setSubjects([]);
      } finally {
        if (mounted) setLoadingSubjects(false);
      }
    };

    loadSubjects();
    return () => { mounted = false; };
  }, []);

  // ================= LIVE QUIZ SESSIONS LOADER =================
  useEffect(() => {
    if (selectedSubject === 'LIVE_QUIZ') {
      const loadSessions = async () => {
        setLoadingLive(true);
        try {
          const sessions = await getAllPastSessions();
          setLiveSessions(sessions);
          if (sessions.length > 0 && !selectedLiveSessionId) {
            setSelectedLiveSessionId(sessions[0].id);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingLive(false);
        }
      };
      loadSessions();
    }
  }, [selectedSubject]);

  // ================= LIVE LEADERBOARD LOADER =================
  useEffect(() => {
    if (selectedSubject === 'LIVE_QUIZ' && selectedLiveSessionId) {
      const loadLB = async () => {
        setLoadingLive(true);
        try {
          const session = liveSessions.find(s => s.id === selectedLiveSessionId);
          const totalQ = session?.totalQuestions || 10;

          const lb = await getPastLeaderboard(selectedLiveSessionId);
          setLiveLeaderboard(lb.map((ent, idx) => ({ 
            ...ent,
            id: ent.userId,
            name: ent.username || "Operator_" + ent.userId.slice(0, 4),
            coins: ent.coins || 0,
            score: ent.score || 0,
            accuracy: Math.round(((ent.score || 0) / totalQ) * 100),
            rank: idx + 1 
          })));
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingLive(false);
        }
      };
      loadLB();
    }
  }, [selectedSubject, selectedLiveSessionId, liveSessions]);



  const topThree = entries.slice(0, 3);

  return (
    <main className="pb-12 px-4 max-w-7xl mx-auto">

      {/* Header Section */}
      <section className="mb-10 mt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight uppercase">Leaderboard</h1>
          <p className="text-slate-500 font-label text-xs uppercase tracking-[0.4em]">Global Operative Performance Index</p>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-8 border-b border-white/5 overflow-x-auto no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-8 py-4 font-headline text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap ${
                selectedSubject === sub.id
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-slate-500 hover:text-on-surface hover:bg-white/5"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Live Quiz Session Selector (Only if LIVE_QUIZ selected) */}
        {selectedSubject === 'LIVE_QUIZ' && liveSessions.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
             <span className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest">Select Session:</span>
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {liveSessions.map((s) => (
                   <button
                    key={s.id}
                    onClick={() => setSelectedLiveSessionId(s.id)}
                    className={`px-4 py-2 rounded text-[9px] font-headline font-bold uppercase tracking-widest transition-all ${
                      selectedLiveSessionId === s.id
                        ? "bg-secondary text-on-secondary shadow-[0_0_15px_rgba(78,222,163,0.3)]"
                        : "bg-surface-container-low text-slate-400 hover:text-white border border-white/5"
                    }`}
                   >
                     {s.subject} ({new Date(s.date).toLocaleDateString()})
                   </button>
                ))}
             </div>
          </div>
        )}
      </section>

      {/* Podium Section */}
      <PodiumSection topThree={topThree} />

      {/* Tactical Table Section */}
      <LeaderboardTable 
        entries={entries} 
        currentUserId={currentUser?.uid} 
        loading={loading}
      />



      {/* Contextual HUD Element (Floating Telemetry) */}
      <div className="fixed bottom-24 right-6 w-48 glass-panel asymmetric-card p-4 border-l-4 border-secondary pointer-events-none z-30 transition-transform duration-500 md:bottom-10">
        <div className="flex justify-between items-center mb-2">
          <span className="font-headline text-[9px] uppercase text-secondary font-semibold tracking-widest">Sector Sync</span>
          <span className="font-headline text-lg font-semibold">READY</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-secondary animate-pulse" style={{ width: '100%' }}></div>
        </div>
        <div className="mt-2 text-[8px] font-body text-slate-500 uppercase tracking-tighter">Operational status nominal</div>
      </div>
    </main>
  );
};

export default LeaderboardPage;