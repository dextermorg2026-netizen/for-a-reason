import { useEffect, useState } from "react";
import useLeaderboard from "../../hooks/useLeaderboard";
import { getAllSubjects } from "../../services/subjectService";
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

  const { entries, loading } = useLeaderboard(selectedSubject);

  // 🔥 LIVE QUIZ HISTORY
  const [liveHistory, setLiveHistory] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setError("");

        const raw = await getAllSubjects();

        const normalized = Array.isArray(raw)
          ? raw.map((s) => ({
              id: s.id,
              name: s.title ?? s.name ?? "Untitled Subject",
            }))
          : [];

        if (!mounted) return;

        setSubjects(normalized);

        if (!selectedSubject && normalized.length > 0) {
          setSelectedSubject(normalized[0].id);
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

    return () => {
      mounted = false;
    };
  }, []);

  // ================= LIVE QUIZ HISTORY =================
  useEffect(() => {
    if (!currentUser) return;

    const loadHistory = async () => {
      const snap = await getDocs(collection(db, "liveQuizHistory"));

      const history = [];

      for (const docSnap of snap.docs) {
        const sessionId = docSnap.id;
        const meta = docSnap.data();

        const participantRef = collection(
          db,
          "liveQuizHistory",
          sessionId,
          "participants"
        );

        const participantsSnap = await getDocs(participantRef);

        participantsSnap.forEach((p) => {
          if (p.id === currentUser.uid) {
            history.push({
              sessionId,
              ...meta,
              ...p.data(),
            });
          }
        });
      }

      // 🔥 latest first
      history.sort((a, b) => b.date - a.date);

      setLiveHistory(history);
    };

    loadHistory();
  }, [currentUser]);

  const topThree = entries.slice(0, 3);
  const others = entries.slice(3);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? parts[0][0] + parts[1][0]
      : parts[0][0];
  };

  return (
    <main className="px-10 pb-12 ">

      {/* Header Section */}
      <section className="mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-headline font-semibold text-on-surface tracking-tight uppercase">Subject Leaderboard</h1>
          <p className="text-slate-400 font-body text-sm uppercase tracking-widest">Global Operative Evaluation Matrix</p>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-8 border-b border-white/5 overflow-x-auto no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-8 py-3 font-headline text-sm font-medium tracking-widest uppercase transition-all whitespace-nowrap ${
                selectedSubject === sub.id
                  ? "border-b-2 border-secondary text-secondary bg-secondary/5"
                  : "text-slate-500 hover:text-on-surface hover:bg-white/5"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </section>

      {/* Podium Section */}
      <PodiumSection topThree={topThree} />

      {/* Tactical Table Section */}
      <LeaderboardTable 
        entries={entries} 
        currentUserId={currentUser?.uid} 
        loading={loading}
      />

      {/* Live Quiz History Section */}
      <section className="w-full mt-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#ddb7ff]"></span>
          <h2 className="font-headline font-semibold text-lg tracking-widest uppercase">Live Session History</h2>
        </div>
        
        {liveHistory.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 font-headline uppercase tracking-widest text-sm">
            NO_PREVIOUS_SESSION_DATA_AVAILABLE
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveHistory.map((quiz, i) => (
              <div
                key={i}
                className="bg-surface-container-low asymmetric-card p-6 hud-border flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                   <span className="font-headline font-semibold text-secondary text-sm uppercase tracking-widest">
                     {quiz.subject || "GENERAL_OP"}
                   </span>
                   <span className="text-[10px] text-slate-500 font-semibold uppercase">
                     {new Date(quiz.date).toLocaleDateString()}
                   </span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary text-sm">monetization_on</span>
                     <span className="font-headline font-semibold text-on-surface text-xl">{quiz.coins}</span>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-500 font-semibold uppercase">Accuracy Score</p>
                     <p className="font-headline font-semibold text-tertiary">{quiz.score}%</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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