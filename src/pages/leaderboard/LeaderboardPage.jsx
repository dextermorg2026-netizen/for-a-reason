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
    <div className="leaderboard-container">
      <h1 className="page-title leaderboard-title">
        Subject Leaderboard
      </h1>

      <p className="leaderboard-subtitle">
        See how learners rank per subject
      </p>

      {/* ================= SUBJECT LEADERBOARD ================= */}
      <SubjectTabs
        subjects={subjects}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        loadingSubjects={loadingSubjects}
      />

      <PodiumSection
        topThree={topThree}
        getInitials={getInitials}
      />

      <LeaderboardTable users={others} loading={loading} />

      {/* ================= LIVE QUIZ HISTORY ================= */}
      <div style={{ marginTop: "50px" }}>
        <h2>🔥 Live Quiz History</h2>

        {liveHistory.length === 0 ? (
          <p style={{ opacity: 0.6 }}>
            No live quizzes attempted yet.
          </p>
        ) : (
          liveHistory.map((quiz, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                marginTop: "15px",
                padding: "20px",
              }}
            >
              <h3>
                📘 {quiz.subject || "General"}
              </h3>

              <p>
                📅{" "}
                {new Date(quiz.date).toLocaleString()}
              </p>

              <p>🎯 Score: {quiz.score}</p>

              <p>🪙 Coins: {quiz.coins}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;