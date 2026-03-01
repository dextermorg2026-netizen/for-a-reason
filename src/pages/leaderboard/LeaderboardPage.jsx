import { useEffect, useState } from "react";
import useLeaderboard from "../../hooks/useLeaderboard";
import { getAllSubjects } from "../../services/subjectService";

import SubjectTabs from "./components/SubjectTabs";
import PodiumSection from "./components/PodiumSection";
import LeaderboardTable from "./components/LeaderboardTable";

import "./Leaderboard.css";

const LeaderboardPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");

  const { entries, loading } = useLeaderboard(selectedSubject);

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

        // Auto-select first subject only once
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

      {error && (
        <div className="glass-card" style={{ marginTop: 30, color: "#ef4444" }}>
          {error}
        </div>
      )}

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

      <LeaderboardTable
        users={others}
        loading={loading}
      />
    </div>
  );
};

export default LeaderboardPage;