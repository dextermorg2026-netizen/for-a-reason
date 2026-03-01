import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";

import ContinueLearningCard from "./components/ContinueLearningCard";
import SubjectSearch from "./components/SubjectSearch";
import SubjectGrid from "./components/SubjectGrid";

import "./Subjects.css";

const Subjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const raw = await getAllSubjects();

        const normalized = raw.map((s) => {
          const progress = clampProgress(s.progress ?? 0);
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
              s.description ?? "No description available",
          };
        });

        if (mounted) setSubjects(normalized);
      } catch (e) {
        if (mounted)
          setError(e?.message || "Failed to load subjects.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  const filteredSubjects = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return subjects.filter((s) =>
      s.title.toLowerCase().includes(lower)
    );
  }, [subjects, search]);

  const continueSubject = subjects.find(
    (s) => s.progress > 0 && s.progress < 100
  );

  return (
    <div className="subjects-container">
      <h1 className="page-title">Learning Roadmap</h1>
      <p className="page-subtitle">
        Structured progression to mastery
      </p>

      {loading && (
        <div className="glass-card subjects-status">
          Loading subjects...
        </div>
      )}

      {!loading && error && (
        <div className="glass-card subjects-status error">
          {error}
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

      <SubjectSearch value={search} onChange={setSearch} />

      <SubjectGrid
        subjects={filteredSubjects}
        onSelect={(id) =>
          navigate(`/subjects/${id}/topics`)
        }
      />
    </div>
  );
};

export default Subjects;