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

  return (
    <div>
      <h1 className="page-title">LEARN LOOP</h1>

      {loading && (
        <div className="glass-card" style={{ marginTop: "30px" }}>
          Loading subjects...
        </div>
      )}

      {!loading && error && (
        <div
          className="glass-card"
          style={{ marginTop: "30px", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gap: "20px",
        }}
      >
        {!loading &&
          !error &&
          subjects.map((subject) => {
            const completed = progress[subject.id] || 0;

            return (
              <div
                key={subject.id}
                className="glass-card"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/quizzes/${subject.id}`)}
              >
                <h3>{subject.name}</h3>

                <p className="muted">{subject.description}</p>

                <div
                  style={{
                    marginTop: "10px",
                    fontWeight: "600",
                    color: "#6366f1",
                  }}
                >
                  Progress: {completed} / 3 completed
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default QuizzesPage;