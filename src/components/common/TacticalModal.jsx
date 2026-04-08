import React from 'react';

const TacticalModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/5 hud-card-asymmetric p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <div className="flex flex-col items-center text-center">
          {/* Icon Header */}
          <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 border border-primary/10 shadow-[inner_0_0_20px_rgba(183,109,255,0.1)]">
             <span className="material-symbols-outlined text-4xl text-primary animate-pulse">
               {type === "warning" ? "warning" : "info"}
             </span>
          </div>
          
          <h3 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight mb-2">
            {title}
          </h3>
          
          <p className="text-sm font-label text-slate-400 mb-10 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-surface-container-low border border-white/10 text-slate-400 font-headline font-semibold text-xs uppercase tracking-widest asymmetric-card hover:bg-white/5 transition-all"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-[0.2em] asymmetric-card shadow-[0_0_20px_rgba(183,109,255,0.2)] hover:scale-[1.02] transition-all"
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Tactical Corner accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/40"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/40"></div>
      </div>
    </div>
  );
};

export default TacticalModal;
