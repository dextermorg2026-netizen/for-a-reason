import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getSubtopicById,
  getSubtopicsByTopic,
  getTopicsBySubject,
  getTopicById
} from "../../services/subjectService";

const SubjectTheoryPage = () => {

  const { subtopicId } = useParams();
  const navigate = useNavigate();

  const [subtopic, setSubtopic] = useState(null);
  const [subjectId, setSubjectId] = useState(null);

  const [nextSubtopicId, setNextSubtopicId] = useState(null);
  const [nextTopicFirstSubtopic, setNextTopicFirstSubtopic] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    let mounted = true;

    const loadSubtopic = async () => {

      try {

        setLoading(true);
        setError("");

        const data = await getSubtopicById(subtopicId);

        if (!mounted) return;

        if (!data) {
          setError("Subtopic not found.");
          return;
        }

        setSubtopic(data);

        /* -------- GET SUBJECT -------- */

        const topicDoc = await getTopicById(data.topicId);
        setSubjectId(topicDoc.subjectId);

        /* -------- NEXT SUBTOPIC -------- */

        const subs = await getSubtopicsByTopic(data.topicId);

        const index = subs.findIndex(
          s => s.id === subtopicId
        );

        if (index !== -1 && index < subs.length - 1) {

          setNextSubtopicId(subs[index + 1].id);

        } else {

          setNextSubtopicId(null);

          /* -------- NEXT TOPIC -------- */

          const subjectTopics = await getTopicsBySubject(
            topicDoc.subjectId
          );

          const topicIndex = subjectTopics.findIndex(
            t => t.id === data.topicId
          );

          if (
            topicIndex !== -1 &&
            topicIndex < subjectTopics.length - 1
          ) {

            const nextTopic =
              subjectTopics[topicIndex + 1];

            const nextTopicSubs =
              await getSubtopicsByTopic(nextTopic.id);

            if (nextTopicSubs.length > 0) {
              setNextTopicFirstSubtopic(
                nextTopicSubs[0].id
              );
            }

          } else {

            setNextTopicFirstSubtopic(null);

          }

        }

      } catch (err) {

        console.error(err);

        if (mounted) {
          setError("Failed to load theory.");
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    };

    if (subtopicId) {
      loadSubtopic();
    }

    return () => {
      mounted = false;
    };

  }, [subtopicId]);

  return (
    <main className="max-w-4xl mx-auto pb-20">
      {/* Navigation Header */}
      <nav className="mb-10 flex items-center justify-between">
        <button
          onClick={() => navigate(`/subjects/${subjectId}`)}
          className="flex items-center gap-2 text-slate-500 font-headline text-[10px] font-semibold uppercase tracking-widest hover:text-primary transition-all group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Operational Sector
        </button>

        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary pulse-emerald"></span>
          <span className="font-headline text-[9px] font-semibold text-slate-600 uppercase tracking-widest">LIVE_INTEL_FEED</span>
        </div>
      </nav>

      {loading ? (
        <div className="asymmetric-card hud-border p-12 bg-surface-container-low animate-pulse">
           <div className="h-8 w-64 bg-white/5 rounded mb-8"></div>
           <div className="space-y-4">
              <div className="h-4 w-full bg-white/5 rounded"></div>
              <div className="h-4 w-5/6 bg-white/5 rounded"></div>
              <div className="h-4 w-4/6 bg-white/5 rounded"></div>
           </div>
        </div>
      ) : error ? (
        <div className="glass-panel p-20 text-center border border-error/20">
          <span className="material-symbols-outlined text-error text-5xl mb-4">gpp_maybe</span>
          <p className="font-headline font-semibold text-error uppercase tracking-widest">{error}</p>
        </div>
      ) : (
        <article className="space-y-10 animate-in fade-in duration-700">
           {/* Header Area */}
           <section>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tighter uppercase mb-3">
                {subtopic.title}
              </h1>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-primary font-headline text-[9px] font-semibold uppercase tracking-widest">PROTOCOL_INFO // {subtopicId?.slice(-6).toUpperCase()}</span>
                <span className="w-[1px] h-4 bg-white/10"></span>
                <p className="text-slate-500 font-body text-[10px] uppercase tracking-widest">Estimated synchronization: 5m</p>
              </div>
           </section>

           {/* Theory Body */}
           <section className="bg-[#131313] asymmetric-card hud-border p-8 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 border-b border-l border-white/5 text-white/5 font-bold font-headline text-lg">INTEL_00</div>
              
              <div className="prose prose-invert max-w-none">
                {subtopic.theory?.split("\n").filter(line => line.trim() !== "").map((line, index) => (
                  <p key={index} className="font-body text-sm md:text-base text-slate-400 leading-relaxed uppercase tracking-wide mb-6">
                    {line}
                  </p>
                ))}
              </div>

              {/* Action Footer */}
              <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-base">verified</span>
                    <p className="font-headline text-[10px] font-semibold text-slate-500 uppercase tracking-widest">End of module synchronization</p>
                 </div>

                 <div className="flex gap-4 w-full md:w-auto">
                    {nextSubtopicId ? (
                      <button
                        onClick={() => navigate(`/subjects/theory/${nextSubtopicId}`)}
                        className="flex-1 md:flex-none px-12 py-5 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_20px_rgba(183,109,255,0.3)] hover:scale-[1.05] transition-all"
                      >
                        Next Intel Layer
                      </button>
                    ) : nextTopicFirstSubtopic ? (
                      <button
                        onClick={() => navigate(`/subjects/theory/${nextTopicFirstSubtopic}`)}
                        className="flex-1 md:flex-none px-12 py-5 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_20px_rgba(183,109,255,0.3)] hover:scale-[1.05] transition-all"
                      >
                        Next Mission Sector
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/quizzes/${subtopic.topicId}`)}
                        className="flex-1 md:flex-none px-12 py-5 bg-secondary text-on-secondary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_30px_rgba(78,222,163,0.3)] hover:scale-[1.05] transition-all"
                      >
                        Initiate Assessment
                      </button>
                    )}
                 </div>
              </div>
           </section>
        </article>
      )}
    </main>
  );
};

export default SubjectTheoryPage;