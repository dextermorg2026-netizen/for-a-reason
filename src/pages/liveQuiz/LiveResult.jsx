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
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>🏆 Quiz Results</h1>

        {/* ================= LEADERBOARD ================= */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Leaderboard</h2>

          {leaderboard.length === 0 ? (
            <p style={{ opacity: 0.7 }}>Loading...</p>
          ) : (
            leaderboard.map((user, i) => (
              <div
                key={user.userId}
                style={{
                  ...styles.leaderItem,
                  ...(i < 3 ? styles.topUser : {}),
                }}
              >
                <span>
                  {getMedal(i)} {i + 1}. {user.username}
                </span>
                <strong>{user.score}</strong>
              </div>
            ))
          )}
        </div>

        {/* ================= REVIEW BUTTON ================= */}
        {!showReview && (
          <div style={{ textAlign: "center" }}>
            <button
              style={styles.reviewBtn}
              onClick={() => setShowReview(true)}
            >
              Review Answers
            </button>
          </div>
        )}

        {/* ================= REVIEW ================= */}
        {showReview && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Answer Review</h2>

            {questions.map((q, i) => {
              const userAns = answersMap[i];
              const correct = q.correctAnswer;

              return (
                <div key={i} style={styles.reviewCard}>
                  <p style={styles.question}>
                    Q{i + 1}. {q.question}
                  </p>

                  {q.options.map((opt, idx) => {
                    let style = styles.option;
                    let label = "";

                    if (idx === correct) {
                      style = { ...style, ...styles.correct };
                      label = " ✅ Correct";
                    }

                    if (idx === userAns && userAns !== correct) {
                      style = { ...style, ...styles.wrong };
                      label = " ❌ Your Answer";
                    }

                    return (
                      <div key={idx} style={style}>
                        {opt}
                        <span style={styles.label}>{label}</span>
                      </div>
                    );
                  })}

                  {userAns === undefined && (
                    <p style={styles.unanswered}>
                      ❌ Not Attempted
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveResult;

// ================= STYLES =================

const styles = {
  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
  },

  loaderCard: {
    padding: "30px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "30px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  container: {
    width: "900px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
  },

  sectionTitle: {
    marginBottom: "10px",
    fontWeight: "600",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  leaderItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },

  topUser: {
    background: "#fef9c3",
    borderRadius: "8px",
    padding: "10px",
  },

  reviewBtn: {
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
  },

  reviewCard: {
    marginTop: "20px",
    padding: "15px",
    background: "#f1f5f9",
    borderRadius: "12px",
  },

  question: {
    marginBottom: "10px",
    fontWeight: "bold",
  },

  option: {
    padding: "6px 0",
  },

  correct: {
    color: "#16a34a",
    fontWeight: "600",
  },

  wrong: {
    color: "#dc2626",
    fontWeight: "600",
  },

  label: {
    marginLeft: "8px",
    fontSize: "12px",
    fontWeight: "600",
  },

  unanswered: {
    marginTop: "5px",
    color: "#dc2626",
    fontSize: "14px",
  },
};