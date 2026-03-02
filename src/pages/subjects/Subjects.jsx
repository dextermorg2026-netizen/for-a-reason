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

  const [sortBy, setSortBy] = useState("az");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  /* ================= DATA LOAD ================= */

  useEffect(() => {
    let mounted = true;

    const normalizeDifficulty = (value) => {
      if (!value) return "Medium";
      const lower = String(value).toLowerCase();
      if (["easy", "medium", "hard"].includes(lower)) {
        return lower[0].toUpperCase() + lower.slice(1);
      }
      return "Medium";
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
          const progress = clampProgress(
            s.progress ?? s.xpProgress ?? 0
          );

          return {
            id: s.id,
            title: s.title ?? s.name ?? "Untitled Subject",
            difficulty: normalizeDifficulty(s.difficulty),
            progress,
            completed: progress >= 100,
            description:
              s.description ??
              s.desc ??
              "No description available",
          };
        });

        if (mounted) {
          setSubjects(normalized);
          setLastAttempt(last);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e?.message || "Failed to load subjects."
          );
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

  /* ================= FILTER + SORT ================= */

  const filteredSubjects = useMemo(() => {
    let list = [...subjects];

    const lower = search.trim().toLowerCase();
    if (lower) {
      list = list.filter((s) =>
        s.title?.toLowerCase().includes(lower)
      );
    }

    if (difficultyFilter !== "all") {
      list = list.filter(
        (s) =>
          s.difficulty?.toLowerCase() === difficultyFilter
      );
    }

    if (sortBy === "az") {
      list.sort((a, b) =>
        (a.title ?? "").localeCompare(b.title ?? "")
      );
    }

    if (sortBy === "progress") {
      list.sort(
        (a, b) => (b.progress ?? 0) - (a.progress ?? 0)
      );
    }

    if (sortBy === "difficulty") {
      const order = { easy: 1, medium: 2, hard: 3 };

      list.sort((a, b) => {
        const aKey =
          order[a.difficulty?.toLowerCase()] ?? 99;
        const bKey =
          order[b.difficulty?.toLowerCase()] ?? 99;
        return aKey - bKey;
      });
    }

    return list;
  }, [subjects, search, sortBy, difficultyFilter]);

  const continueSubject = lastAttempt
    ? subjects.find(
        (s) => s.id === lastAttempt.subjectId
      )
    : null;

  /* ================= RENDER ================= */

  return (
    <div className="subjects-container">

      {/* HERO */}

      <div className="subjects-hero">
        <div className="hero-text">
          <h1 className="page-title">
            Welcome back{" "}
            <span className="wave">👋</span>
          </h1>
          <p className="page-subtitle">
            Continue your journey toward mastery.
          </p>
        </div>

        <div className="hero-actions">
          {continueSubject && (
            <button
              className="btn-primary hero-btn"
              onClick={() =>
                navigate(
                  `/subjects/${continueSubject.id}/topics`
                )
              }
            >
              Resume Learning
            </button>
          )}

          <button
            className="btn-secondary hero-btn"
            onClick={() => navigate("/leaderboard")}
          >
            View Leaderboard
          </button>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="subject-grid" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card subject-card"
            >
              <div className="skeleton skeleton-title" />
              <div
                className="skeleton skeleton-text"
                style={{ width: "90%", marginTop: 8 }}
              />
              <div
                className="skeleton skeleton-text"
                style={{ width: "60%", marginTop: 4 }}
              />
              <div className="skeleton skeleton-progress" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="glass-card subjects-status error">
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={() => {
              setError("");
              setRetryTrigger((t) => t + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* CONTINUE SECTION */}

      {!loading && !error && continueSubject && (
        <div className="subjects-section">
          <h2 className="section-title">
            Continue Learning
          </h2>

          <ContinueLearningCard
            subject={continueSubject}
            onResume={() =>
              navigate(
                `/subjects/${continueSubject.id}/topics`
              )
            }
          />
        </div>
      )}

      {/* EXPLORE SECTION */}

      {!loading && !error && (
        <div className="subjects-section">
          <h2 className="section-title">
            Explore Subjects
          </h2>

          {/* NEW PREMIUM CONTROLS */}

          <div className="subjects-controls">

            <div className="controls-left">
              <span className="controls-label">
                Filter
              </span>

              <div className="filter-chips">
                {["all", "easy", "medium", "hard"].map(
                  (level) => (
                    <button
                      key={level}
                      className={`chip ${
                        difficultyFilter === level
                          ? "chip-active"
                          : ""
                      }`}
                      onClick={() =>
                        setDifficultyFilter(level)
                      }
                    >
                      {level
                        .charAt(0)
                        .toUpperCase() +
                        level.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="controls-right">
              <span className="controls-label">
                Sort
              </span>

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="az">A–Z</option>
                <option value="progress">
                  Progress
                </option>
                <option value="difficulty">
                  Difficulty
                </option>
              </select>
            </div>

          </div>

          <SubjectSearch
            value={search}
            onChange={setSearch}
            resultCount={filteredSubjects.length}
            totalCount={subjects.length}
          />

          {filteredSubjects.length === 0 &&
          subjects.length > 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">
                No subjects match your search
              </p>
              <p>
                Try a different keyword or clear
                the search.
              </p>
              <button
                className="btn-primary"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            </div>
          ) : (
            <SubjectGrid
              subjects={filteredSubjects}
              onSelect={(id) =>
                navigate(`/subjects/${id}/topics`)
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Subjects;