import { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";

import {
  getTopicsBySubject,
  getSubtopicsByTopic,
  getAllSubjects
} from "../../services/subjectService";

import { getTopicProgress } from "../../services/progressService";
import { useAuth } from "../../context/AuthContext";

const Topics = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId } = useParams();
  const { currentUser } = useAuth();

  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState({});
  const [topicProgress, setTopicProgress] = useState({});
  const [subjectName, setSubjectName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    let mounted = true;

    const load = async () => {

      try {

        setLoading(true);
        setError("");

        /* ---------------- SUBJECT NAME ---------------- */

        const subjects = await getAllSubjects();
        const subject = subjects.find(s => s.id === subjectId);

        if (mounted) {
          setSubjectName(subject?.title || subject?.name || "Subject");
        }

        /* ---------------- LOAD TOPICS ---------------- */

        const topicData = await getTopicsBySubject(subjectId);

        if (!mounted) return;

        setTopics(topicData || []);

        /* ---------------- LOAD SUBTOPICS ---------------- */

        const subtopicPromises = topicData.map(async (topic) => {
          const subs = await getSubtopicsByTopic(topic.id);
          return { topicId: topic.id, subs };
        });

        const subtopicResults = await Promise.all(subtopicPromises);

        const subtopicMap = {};

        subtopicResults.forEach(({ topicId, subs }) => {
          subtopicMap[topicId] = subs || [];
        });

        if (mounted) {
          setSubtopics(subtopicMap);
        }

        /* ---------------- LOAD PROGRESS ---------------- */

        if (currentUser) {

          const progressPromises = topicData.map(async (topic) => {
            const progress = await getTopicProgress(
              currentUser.uid,
              topic.id
            );

            return { topicId: topic.id, progress };
          });

          const progressResults = await Promise.all(progressPromises);

          const progressMap = {};

          progressResults.forEach(({ topicId, progress }) => {
            progressMap[topicId] = progress;
          });

          if (mounted) {
            setTopicProgress(progressMap);
          }
        }

      } catch (err) {

        console.error(err);

        if (mounted) {
          setError("Failed to load topics.");
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    };

    load();

    return () => {
      mounted = false;
    };

  }, [subjectId, currentUser]);

  /* ---------------- TOGGLE MODULE ---------------- */

  const toggleTopic = (topicId) => {
    setOpenTopic(prev => prev === topicId ? null : topicId);
  };

  /* ================================================= */

  return (
    <main className="pb-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 items-center flex gap-2 text-slate-500 font-headline text-[10px] font-semibold uppercase tracking-widest">
        <Link to="/subjects" className="hover:text-primary transition-colors">Operational Sectors</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface">{subjectName}</span>
      </nav>

      <section className="mb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tighter uppercase">{subjectName}</h1>
          <p className="text-slate-500 font-body text-sm uppercase tracking-[0.3em]">MISSION_INTEL // SYNC_STATUS_ONLINE</p>
        </div>
      </section>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="asymmetric-card hud-border h-24 bg-surface-container-low animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-20 text-center border border-error/20">
          <span className="material-symbols-outlined text-error text-5xl mb-4">gpp_maybe</span>
          <p className="font-headline font-semibold text-error uppercase tracking-widest">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
          {topics.length === 0 && (
            <div className="col-span-full glass-panel p-20 text-center border border-white/5">
              <p className="font-headline font-semibold text-slate-600 uppercase tracking-widest">No modules identified in this sector</p>
            </div>
          )}
          {topics.map((topic, index) => (
            <div 
              key={topic.id}
              onClick={() => navigate(`/flashcards/view/${topic.id}`)}
              className="group relative bg-surface-container-low asymmetric-card hud-border p-8 cursor-pointer hover:bg-primary/5 transition-all duration-300 border-l-4 border-white/5 hover:border-primary"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-headline font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary transition-colors">Module 0{index + 1}</span>
                  <h3 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-8 opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-primary">Initiate</span>
                  <span className="material-symbols-outlined text-sm text-primary">arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      {!loading && !error && topics.length > 0 && (
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center">
           <div className="flex items-center gap-3 mb-6">
              <span className="w-4 h-[1px] bg-secondary"></span>
              <p className="font-headline text-[10px] font-semibold text-secondary uppercase tracking-[0.4em]">Final Assessment Protocol</p>
              <span className="w-4 h-[1px] bg-secondary"></span>
           </div>
           <button 
             className="px-12 py-5 bg-secondary text-on-secondary font-headline font-bold text-sm uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_30px_rgba(78,222,163,0.3)] hover:scale-[1.05] transition-all active:scale-95"
             onClick={() => navigate(`/quizzes/${subjectId}`)}
           >
             Launch Subject Mastery
           </button>
        </div>
      )}
    </main>
  );
};

export default Topics;