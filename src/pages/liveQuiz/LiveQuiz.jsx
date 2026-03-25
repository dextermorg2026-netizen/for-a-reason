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
} from "../../services/liveQuizService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const HOST_UID = "vy4i5HlsiRS7qyY5qiOMG3IyQPQ2";

const LiveQuiz = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [joined, setJoined] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [username, setUsername] = useState("");

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const hasAutoSubmittedRef = useRef(false);

  const isHost = currentUser?.uid === HOST_UID;

  const getMillis = (value) => {
    if (typeof value === "number") return value;
    if (value && typeof value.toMillis === "function") {
      return value.toMillis();
    }
    return null;
  };

  // ================= RESTORE =================
  useEffect(() => {
    const saved = localStorage.getItem("liveQuizSession");

    if (saved) {
      const { sessionId, username, answersMap: savedAnswers } = JSON.parse(saved);

      setSessionId(sessionId);
      setUsername(username);
      if (savedAnswers) {
        setAnswersMap(savedAnswers);
      }
      setJoined(true);

      getLiveQuizQuestions(sessionId).then(setQuestions);
      subscribeToLiveQuiz(sessionId, setSession);
    }
  }, []);

  // ================= TIMER =================
  useEffect(() => {
    if (!session?.endTime || session?.status !== "active") return;
  
    const endAt = getMillis(session.endTime);
    if (!endAt) return;
  
    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.floor((endAt - Date.now()) / 1000)
      );
  
      setTimeLeft(remaining);
  
      if (remaining === 0) autoSubmit();
    };
  
    // ✅ Immediate update (fixes 0:00 issue)
    updateRemaining();
  
    const interval = setInterval(updateRemaining, 1000);
  
    return () => clearInterval(interval);
  }, [session?.endTime, session?.status]);

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
  
    localStorage.removeItem("liveQuizSession");
  
    navigate("/live/result", {
      state: { sessionId },
    });
  };
  // If host ends quiz for everyone, all joined users should move to result.
  useEffect(() => {
    if (
      session?.status === "finished" &&
      !hasAutoSubmittedRef.current
    ) {
      autoSubmit();
    }
  }, [session?.status]);

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

      const qs = await getLiveQuizQuestions(sessionId);
      setQuestions(qs);

      await joinParticipant({
        sessionId,
        userId: currentUser?.uid,
        username,
      });

      localStorage.setItem(
        "liveQuizSession",
        JSON.stringify({ sessionId, username, answersMap: {} })
      );

      subscribeToLiveQuiz(sessionId, setSession);
      setJoined(true);
    } catch (err) {
      console.error("Failed to join:", err);
      alert("Error joining quiz.");
    }
  };

  // ================= ANSWER =================
  const handleSelect = async (index) => {
    await submitLiveAnswer({
      sessionId,
      userId: currentUser?.uid,
      questionIndex: currentIndex,
      selectedOptionIndex: index,
    });

    setAnswersMap((prev) => {
      const newMap = { ...prev, [currentIndex]: index };
      localStorage.setItem(
        "liveQuizSession",
        JSON.stringify({ sessionId, username, answersMap: newMap })
      );
      return newMap;
    });
  };

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

  // ================= JOIN SCREEN =================
  if (!joined) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h1>Live Quiz 🚀</h1>

          <input
            style={styles.input}
            placeholder="Your Name"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Quiz Code"
            onChange={(e) => setSessionId(e.target.value)}
          />

          <button style={styles.primaryBtn} onClick={handleJoin}>
            Join Quiz
          </button>
        </div>
      </div>
    );
  }

  // ================= WAIT =================
  if (session?.status === "waiting") {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>⏳ Waiting for host...</h2>

          {isHost && (
            <button style={styles.primaryBtn} onClick={handleStart}>
              Start Quiz 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={styles.container}>
      {/* LEFT */}
      <div style={styles.main}>
        <h3 style={styles.timer}>
          ⏱ {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </h3>

        <h2 style={styles.question}>{currentQ?.question}</h2>

        <div style={styles.options}>
          {currentQ?.options.map((opt, i) => (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                ...styles.option,
                ...(answersMap[currentIndex] === i
                  ? styles.selected
                  : {}),
              }}
              onMouseEnter={(e) => {
                if (answersMap[currentIndex] !== i) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {opt}
            </div>
          ))}
        </div>

        <div style={styles.bottomSection}>
          <div style={styles.navButtons}>
            <button
              style={styles.navBtn}
              onClick={() =>
                setCurrentIndex((p) => Math.max(p - 1, 0))
              }
            >
              ← Previous
            </button>

            <button
              style={styles.navBtn}
              onClick={() =>
                setCurrentIndex((p) =>
                  Math.min(p + 1, questions.length - 1)
                )
              }
            >
              Next →
            </button>
          </div>

          <div style={styles.actionButtons}>
            <button
              style={styles.submitBtn}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.95)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onClick={handleFinish}
            >
              Submit Quiz
            </button>

            {isHost && (
              <button
                style={styles.endBtn}
                onClick={handleEnd}
              >
                End Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.palette}>
        {questions.map((_, i) => {
          let color = "#e5e7eb";
          if (answersMap[i] !== undefined) color = "#22c55e";
          if (i === currentIndex) color = "#6366f1";

          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{ ...styles.qBox, background: color }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LiveQuiz;

// ================= STYLES =================

const styles = {
  container: {
    display: "flex",
    gap: "30px",
    padding: "30px",
    background: "linear-gradient(to right, #eef2ff, #f8fafc)",
    minHeight: "100vh",
  },

  main: {
    flex: 3,
    background: "#fff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
  },

  palette: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(5, 40px)",
    gap: "10px",
    justifyContent: "center",
    alignContent: "flex-start", // 🔥 IMPORTANT FIX
  },

  qBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  options: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "20px",
  },

  option: {
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  selected: {
    background: "#4f46e5",
    color: "#fff",
    boxShadow: "0 10px 25px rgba(79,70,229,0.4)",
  },

  bottomSection: {
    marginTop: "30px",
  },

  navButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },

  navBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },

  actionButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
  },

  submitBtn: {
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
  },

  endBtn: {
    padding: "12px 24px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
  },

  timer: {
    fontWeight: "600",
    marginBottom: "10px",
  },

  question: {
    fontSize: "22px",
    fontWeight: "700",
  },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f8fafc",
  },

  card: {
    padding: "30px",
    borderRadius: "16px",
    background: "#fff",
    textAlign: "center",
    width: "350px",
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  primaryBtn: {
    padding: "10px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
  gridTemplateColumns: "repeat(5, 45px)"
};