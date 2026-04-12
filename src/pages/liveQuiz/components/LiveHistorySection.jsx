import React, { useEffect, useState } from "react";
import { subscribeToMyLiveHistory, getLiveQuizQuestions } from "../../../services/liveQuizService";
import DetailedReportModal from "./DetailedReportModal";

const LiveHistorySection = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingReport, setFetchingReport] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const unsub = subscribeToMyLiveHistory(userId, (data) => {
      setHistory(data);
      setLoading(false);
    });

    return () => unsub && unsub();
  }, [userId]);

  const handleViewReport = async (session) => {
    setSelectedSession(session);
    setFetchingReport(true);
    setIsModalOpen(true);
    try {
      const qs = await getLiveQuizQuestions(session.id);
      setQuestions(qs);
    } catch (err) {
      console.error("Failed to load report questions:", err);
    } finally {
      setFetchingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mt-12 animate-pulse">
        <div className="h-4 w-32 bg-white/5 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded asymmetric-card"></div>)}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="w-full max-w-2xl mt-8 px-4 text-center">
        <div className="flex items-center gap-3 mb-6 opacity-30">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <h3 className="font-headline font-bold text-[9px] text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">
            Mission History Locked
          </h3>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>
        <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl flex flex-col items-center gap-3">
           <span className="material-symbols-outlined text-slate-700 text-3xl">history_toggle_off</span>
           <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-slate-600">No mission logs detected in your local core.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
        <h3 className="font-headline font-bold text-[10px] text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">
          Previous Missions
        </h3>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
      </div>

      <div className="space-y-4">
        {history.map((session) => {
          const date = new Date(session.date).toLocaleDateString();
          const participation = session.participation || {};
          const accuracy = session.totalQuestions > 0 
            ? Math.round((participation.score / session.totalQuestions) * 100) 
            : 0;

          return (
            <div 
              key={session.id} 
              className="group bg-[#131313] asymmetric-card hud-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">{accuracy > 70 ? 'military_tech' : 'assignment_turned_in'}</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-on-surface uppercase tracking-tight mb-0.5">
                    {session.subject}
                  </h4>
                  <p className="font-headline text-[10px] text-slate-500 uppercase tracking-widest">
                    {date} • {session.totalQuestions} Questions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 px-4 border-l border-white/5 md:border-l-0">
                <div className="text-center">
                  <p className="text-[9px] font-headline font-bold text-slate-600 uppercase tracking-widest mb-1">Intel Score</p>
                  <p className="font-headline font-bold text-lg text-secondary">
                    {participation.score}<span className="text-xs text-slate-500">/{session.totalQuestions}</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-headline font-bold text-slate-600 uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="font-headline font-bold text-lg text-primary">
                    {accuracy}%
                  </p>
                </div>
              </div>

              <button 
                onClick={() => handleViewReport(session)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded font-headline font-bold text-[9px] text-on-surface uppercase tracking-[0.2em] hover:bg-primary/20 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">history_edu</span>
                View Detailed Report
              </button>
            </div>
          );
        })}
      </div>

      <DetailedReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={selectedSession}
        questions={questions}
        isLoading={fetchingReport}
      />
    </div>
  );
};

export default LiveHistorySection;
