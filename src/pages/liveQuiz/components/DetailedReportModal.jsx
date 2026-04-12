import React from "react";
import { createPortal } from "react-dom";

const DetailedReportModal = ({ isOpen, onClose, session, questions }) => {
  if (!isOpen || !session) return null;

  const participation = session.participation || {};
  const answers = participation.answers || {};

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#0f0f0f] hud-border asymmetric-card max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-surface-container-low">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <h2 className="font-headline font-bold text-xl uppercase tracking-tighter text-on-surface">
                Mission Breakdown: {session.subject}
              </h2>
            </div>
            <p className="text-[10px] font-headline font-semibold text-slate-500 uppercase tracking-widest">
              Session ID: {session.id} • {new Date(session.date).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </header>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-white/5">
          <div className="bg-[#0f0f0f] p-6 text-center">
            <p className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Score</p>
            <p className="text-3xl font-headline font-bold text-primary">
              {participation.score} <span className="text-sm font-normal text-slate-600">/ {session.totalQuestions}</span>
            </p>
          </div>
          <div className="bg-[#0f0f0f] p-6 text-center border-x border-white/5">
            <p className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Accuracy</p>
            <p className="text-3xl font-headline font-bold text-secondary">
              {session.totalQuestions > 0 ? Math.round((participation.score / session.totalQuestions) * 100) : 0}%
            </p>
          </div>
          <div className="bg-[#0f0f0f] p-6 text-center">
            <p className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Coins Earned</p>
            <p className="text-3xl font-headline font-bold text-tertiary">
              +{participation.coins || 0}
            </p>
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {questions.length > 0 ? (
            questions.map((q, idx) => {
              const userAnswerIndex = answers[idx];
              const isCorrect = userAnswerIndex === q.correctAnswer;
              
              return (
                <div key={idx} className="bg-surface-container-lowest border border-white/5 p-6 rounded-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${isCorrect ? 'bg-tertiary' : 'bg-error'}`}></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-headline font-bold text-[10px] text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5">
                      Question {idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-[10px] font-headline font-bold text-tertiary uppercase tracking-widest">
                        <span className="material-symbols-outlined text-xs">check_circle</span> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-headline font-bold text-error uppercase tracking-widest">
                        <span className="material-symbols-outlined text-xs">cancel</span> Incorrect
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline font-semibold text-lg text-on-surface mb-6 uppercase tracking-tight">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswerIndex === optIdx;
                      const isCorrectOpt = q.correctAnswer === optIdx;
                      
                      let variantClass = "border-white/5 text-slate-500";
                      if (isSelected && isCorrect) variantClass = "border-tertiary bg-tertiary/10 text-tertiary shadow-[0_0_10px_rgba(78,222,163,0.1)]";
                      else if (isSelected && !isCorrect) variantClass = "border-error bg-error/10 text-error";
                      else if (!isSelected && isCorrectOpt) variantClass = "border-tertiary/50 bg-tertiary/5 text-tertiary/70";

                      return (
                        <div 
                          key={optIdx}
                          className={`flex items-center gap-3 p-4 border rounded-sm text-xs font-headline font-semibold uppercase tracking-wider transition-all ${variantClass}`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] border ${
                            isSelected ? 'bg-current text-on-surface border-transparent' : 'border-white/10'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          {opt}
                          {isSelected && <span className="ml-auto text-[8px] opacity-70">(You)</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="bg-primary/5 border-l-2 border-primary/30 p-4 mt-2 animate-in fade-in slide-in-from-left-2 duration-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-sm">info</span>
                        <span className="font-headline text-[9px] font-bold text-primary uppercase tracking-widest">Tactical Briefing</span>
                      </div>
                      <p className="font-body text-xs text-slate-400 italic leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : Object.keys(answers).length > 0 ? (
            <div className="space-y-4">
              <div className="p-6 bg-error/10 border border-error/20 rounded-xl mb-8">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-error">history_toggle_off</span>
                    <h4 className="font-headline text-xs font-bold text-error uppercase tracking-widest">Question Payload Expired</h4>
                 </div>
                 <p className="text-[10px] font-body text-slate-400 uppercase tracking-tight leading-relaxed">
                    This mission was completed before the central archive system was initialized. While the question text is unavailable, your tactical responses have been recovered below.
                 </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(answers).sort((a,b) => parseInt(a)-parseInt(b)).map((idx) => (
                  <div key={idx} className="bg-surface-container-lowest border border-white/5 p-4 rounded-sm">
                    <p className="text-[8px] font-headline font-semibold text-slate-600 uppercase tracking-widest mb-2">Log_{parseInt(idx)+1}</p>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {String.fromCharCode(65 + answers[idx])}
                       </div>
                       <span className="text-[10px] font-headline font-bold text-slate-400">Response</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-800 mb-4">history_toggle_off</span>
              <p className="font-headline text-xs text-slate-600 uppercase tracking-[0.3em]">No operational data recovered for this session.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/5 text-center bg-surface-container-low">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_20px_rgba(183,109,255,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            Acknowledge Intel
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DetailedReportModal;
