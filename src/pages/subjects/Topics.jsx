import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import {
  getTopicsBySubject,
  getSubtopicsByTopic,
  getAllSubjects
} from "../../services/subjectService";

import { getTopicProgress } from "../../services/progressService";
import { useAuth } from "../../context/AuthContext";

const Topics = () => {

  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { currentUser } = useAuth();

  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState({});
  const [topicProgress, setTopicProgress] = useState({});
  const [openTopic, setOpenTopic] = useState(null);
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
    <main className="max-w-4xl mx-auto pb-20">
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
        <div className="space-y-6">
          {topics.length === 0 && (
            <div className="glass-panel p-20 text-center border border-white/5">
              <p className="font-headline font-semibold text-slate-600 uppercase tracking-widest">No modules identified in this sector</p>
            </div>
          )}

          {topics.map((topic, index) => {
            const isOpen = openTopic === topic.id;
            const progress = topicProgress[topic.id]?.masteryPercent || 0;

            return (
              <div key={topic.id} className={`group border-l-4 transition-all duration-300 ${isOpen ? 'border-primary' : 'border-white/5'}`}>
                <div 
                  className={`asymmetric-card-small hud-border p-6 cursor-pointer transition-all ${isOpen ? 'bg-primary/5' : 'bg-surface-container-low hover:bg-white/5'}`}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded border flex items-center justify-center font-headline text-[10px] font-bold transition-all ${isOpen ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-slate-500 border-white/10'}`}>
                        0{index + 1}
                      </div>
                      <h3 className={`font-headline font-semibold text-sm uppercase tracking-tight ${isOpen ? 'text-on-surface' : 'text-slate-400 group-hover:text-on-surface'}`}>
                        {topic.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end gap-1">
                        <span className="font-headline text-[8px] font-semibold text-slate-600 uppercase tracking-widest">Synchronization</span>
                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${progress >= 100 ? 'bg-secondary' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      <span className="font-headline text-xs font-semibold text-on-surface w-8 text-right">{progress}%</span>
                      <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                       <div className="font-headline text-[9px] font-semibold text-slate-600 uppercase tracking-[0.3em] mb-4">Module Components</div>
                       {subtopics[topic.id]?.length === 0 ? (
                         <p className="text-[10px] font-headline text-slate-700 uppercase tracking-widest italic">Scanning for sub-protocols...</p>
                       ) : (
                         <div className="grid gap-2">
                           {subtopics[topic.id]?.map((sub) => (
                             <button
                               key={sub.id}
                               onClick={(e) => { e.stopPropagation(); navigate(`/subjects/theory/${sub.id}`); }}
                               className="flex items-center justify-between p-4 bg-surface-container-lowest border border-white/5 rounded hover:border-primary/30 group/sub transition-all"
                             >
                               <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-sm text-slate-600 group-hover/sub:text-primary transition-colors">integration_instructions</span>
                                 <span className="font-body text-xs text-on-surface uppercase tracking-wider">{sub.title}</span>
                               </div>
                               <span className="material-symbols-outlined text-xs text-slate-700 opacity-0 group-hover/sub:opacity-100 group-hover/sub:translate-x-1 transition-all">arrow_forward</span>
                             </button>
                           ))}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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