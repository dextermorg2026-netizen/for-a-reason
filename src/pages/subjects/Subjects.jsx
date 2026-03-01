import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";
import { getLastAttemptedSubject } from "../../services/statsService";
import { useAuth } from "../../context/AuthContext";

import ContinueLearningCard from "./components/ContinueLearningCard";
import SubjectSearch from "./components/SubjectSearch";
import SubjectGrid from "./components/SubjectGrid";

import "./Subjects.css";

const Subjects = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;

    const normalizeDifficulty = (value) => {
      if (!value) return "Medium";
      const lower = String(value).toLowerCase();
      if (["easy", "medium", "hard"].includes(lower)) {
        return lower[0].toUpperCase() + lower.slice(1);
      }
      return value;
    };

    const clampProgress = (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, n));
    };

    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const raw = await getAllSubjects();

        let last = null;
        if (currentUser?.uid) {
          last = await getLastAttemptedSubject(currentUser.uid);
        }

        const normalized = (raw || []).map((s) => {
          const progress = clampProgress(s.progress ?? s.xpProgress ?? 0);
          const completed =
            typeof s.completed === "boolean"
              ? s.completed
              : progress >= 100;

          return {
            id: s.id,
            title: s.title ?? s.name ?? "Untitled Subject",
            difficulty: normalizeDifficulty(s.difficulty),
            progress,
            completed,
            description:
              s.description ?? s.desc ?? "No description available",
          };
        });

        if (mounted) {
          setSubjects(normalized);
          setLastAttempt(last);
        }
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load subjects.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSubjects();

    return () => {
      mounted = false;
    };
  }, [currentUser, retryTrigger]);

  const filteredSubjects = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return subjects.filter((s) =>
      s.title.toLowerCase().includes(lower)
    );
  }, [subjects, search]);

  const continueSubject = lastAttempt
    ? subjects.find((s) => s.id === lastAttempt.subjectId)
    : null;

  return (
    <div className="subjects-container">
      <h1 className="page-title">Learning Roadmap</h1>
      <p className="page-subtitle">
        Structured progression to mastery
      </p>

      {loading && (
        <div className="subject-grid" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card subject-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" style={{ width: "90%", marginTop: 8 }} />
              <div className="skeleton skeleton-text" style={{ width: "60%", marginTop: 4 }} />
              <div className="skeleton skeleton-progress" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="glass-card subjects-status error">
          <p>{error}</p>
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => {
              setError("");
              setLoading(true);
              setRetryTrigger((t) => t + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && continueSubject && (
        <ContinueLearningCard
          subject={continueSubject}
          onResume={() =>
            navigate(`/subjects/${continueSubject.id}/topics`)
          }
        />
      )}

      {!loading && !error && (
        <>
          <SubjectSearch
            value={search}
            onChange={setSearch}
            resultCount={filteredSubjects.length}
            totalCount={subjects.length}
          />

          {filteredSubjects.length === 0 && subjects.length > 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No subjects match your search</p>
              <p>Try a different term or clear the search to see all subjects.</p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <SubjectGrid
              subjects={filteredSubjects}
              onSelect={(id) =>
                navigate(`/subjects/${id}/topics`)
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default Subjects;
