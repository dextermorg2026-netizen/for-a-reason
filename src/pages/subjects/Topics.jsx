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

  const glowColors = [
      { text: "glow-text-secondary", border: "border-secondary/30", shadow: "shadow-[0_0_2px_#4cd7f6]", textCol: "text-secondary", bg: "bg-secondary/5", borderPlain: "border-secondary/10" },
      { text: "glow-text-primary", border: "border-primary/30", shadow: "shadow-[0_0_2px_#ddb7ff]", textCol: "text-primary", bg: "bg-primary/5", borderPlain: "border-primary/10" },
      { text: "glow-text-tertiary", border: "border-tertiary/30", shadow: "shadow-[0_0_2px_#4edea3]", textCol: "text-tertiary", bg: "bg-tertiary/5", borderPlain: "border-tertiary/10" },
      { text: "glow-text-rose", border: "border-[#fb7185]/30", shadow: "shadow-[0_0_2px_#fb7185]", textCol: "text-[#fb7185]", bg: "bg-[#fb7185]/5", borderPlain: "border-[#fb7185]/10" },
      { text: "glow-text-amber", border: "border-[#fbbf24]/30", shadow: "shadow-[0_0_2px_#fbbf24]", textCol: "text-[#fbbf24]", bg: "bg-[#fbbf24]/5", borderPlain: "border-[#fbbf24]/10" },
  ];

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

  /* ================================================= */

  return (
    <main className="pb-20">
      {/* Breadcrumbs */}
      <nav className="mb-12 flex items-center gap-2 text-slate-500 font-headline text-[10px] font-bold uppercase tracking-[0.25em]">
        <Link to="/subjects" className="hover:text-primary transition-colors">Operational Sectors</Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-on-surface">{subjectName}</span>
      </nav>

      {/* Mission Status Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
              <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#4cd7f6]"></div>
                  <span className="text-[10px] font-headline tracking-[0.2em] text-secondary uppercase font-bold">Sector: {subjectName}</span>
              </div>
              <h1 className="text-5xl font-headline font-bold tracking-tighter text-on-surface uppercase">{subjectName}</h1>
              <p className="text-neutral-500 font-headline text-xs tracking-widest mt-1 uppercase font-bold">MISSION_INTEL // SYNC_STATUS_ONLINE</p>
          </div>
          <div className="bg-surface-container-low p-5 asymmetric-card border-l-2 border-primary min-w-[300px]">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-headline text-neutral-400 tracking-widest uppercase font-bold">SECTOR_MODULES</span>
                  <span className="text-xs font-headline text-primary font-black">{topics.length}</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary shadow-[0_0_10px_rgba(221,183,255,0.6)] transition-all ease-out duration-1000" style={{ width: topics.length > 0 ? '100%' : '0%' }}></div>
              </div>
          </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="asymmetric-card h-48 bg-surface-container-low animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-20 text-center border border-error/20 asymmetric-card">
          <span className="material-symbols-outlined text-error text-5xl mb-4">gpp_maybe</span>
          <p className="font-headline font-semibold text-error uppercase tracking-widest">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.length === 0 && (
            <div className="col-span-full glass-panel p-20 text-center border border-white/5 asymmetric-card">
              <p className="font-headline font-semibold text-slate-600 uppercase tracking-widest">No modules identified in this sector</p>
            </div>
          )}
          {topics.map((topic, index) => {
            const style = glowColors[index % glowColors.length];
            return (
              <div 
                key={topic.id}
                onClick={() => navigate(`/flashcards/view/${topic.id}`)}
                className="group relative bg-surface-container-low asymmetric-card p-8 cursor-pointer hover:bg-surface-container-high transition-all duration-300 border-l border-t border-white/5 ring-1 ring-white/0 hover:ring-white/5"
              >
                <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 ${style.border} rounded-tl-lg group-hover:scale-110 transition-transform`}></div>
                
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className={`text-[9px] font-headline font-bold ${style.textCol} opacity-80 uppercase tracking-[0.3em] mb-4 block`}>Module 0{index + 1}</span>
                    <h3 className={`text-lg font-headline font-semibold text-on-surface uppercase tracking-tight leading-tight group-hover:${style.textCol} ${style.text} transition-all duration-300`}>
                      {topic.title}
                    </h3>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                        <div className={`h-full ${style.textCol.replace('text-', 'bg-')} bg-opacity-20 group-hover:bg-opacity-100 transition-all duration-700 w-1/4 group-hover:w-full ${style.shadow}`}></div>
                    </div>
                    <div className="flex justify-between items-center opacity-40 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                        <span className={`text-[10px] font-headline font-black uppercase tracking-widest ${style.textCol}`}>Initiate_Module</span>
                        <span className={`material-symbols-outlined text-sm ${style.textCol}`}>arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Footer */}
      {!loading && !error && topics.length > 0 && (
        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col items-center">
           <div className="flex items-center gap-4 mb-8">
              <span className="w-8 h-[1px] bg-secondary opacity-30"></span>
              <p className="font-headline text-[11px] font-black text-secondary uppercase tracking-[0.5em] glow-text-secondary">Mission_Deployment_Protocol</p>
              <span className="w-8 h-[1px] bg-secondary opacity-30"></span>
           </div>
           <button 
             className="px-16 py-6 bg-secondary text-on-secondary font-headline font-black text-base uppercase tracking-[0.4em] asymmetric-card shadow-[0_0_40px_rgba(76,215,246,0.2)] hover:shadow-[0_0_60px_rgba(76,215,246,0.4)] hover:scale-[1.05] transition-all active:scale-95 group relative overflow-hidden"
             onClick={() => navigate(`/quizzes/${subjectId}`)}
           >
             <span className="relative z-10 flex items-center gap-3">
                <span className="material-symbols-outlined group-hover:animate-spin">bolt</span>
                Launch Subject Mastery
             </span>
             <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
           </button>
        </div>
      )}

      {/* System Telemetry Footer */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 opacity-60 hover:opacity-100 transition-opacity">
          <div className="bg-surface-container-lowest p-4 border-l-2 border-secondary/30">
              <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Latency</p>
              <p className="text-sm font-headline text-secondary font-bold">STABLE</p>
          </div>
          <div className="bg-surface-container-lowest p-4 border-l-2 border-primary/30">
              <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Node_Status</p>
              <p className="text-sm font-headline text-primary font-bold">ONLINE</p>
          </div>
          <div className="bg-surface-container-lowest p-4 border-l-2 border-tertiary/30">
              <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Encryption</p>
              <p className="text-sm font-headline text-tertiary font-bold">ACTIVE</p>
          </div>
          <div className="bg-surface-container-lowest p-4 border-l-2 border-rose-glow/30">
              <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Link_Core</p>
              <p className="text-sm font-headline text-rose-glow font-bold">v4.0.1</p>
          </div>
      </div>
    </main>
  );
};

export default Topics;