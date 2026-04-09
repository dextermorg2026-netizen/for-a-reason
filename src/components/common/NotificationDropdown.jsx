import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = ({ isOpen, onClose, events = [] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop to close on click outside */}
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-4 w-80 bg-[#0d0d0d] border border-white/10 hud-card-asymmetric z-[70] shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-1 overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <span className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-[0.2em]">Intel Feed</span>
                <span className="text-[9px] font-mono text-primary/60">SGN_L_04</span>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                    <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-slate-600 text-2xl">notifications_off</span>
                    </div>
                    <p className="text-[10px] font-headline text-slate-500 uppercase tracking-widest leading-relaxed">
                      No upcoming events<br/>detected in current sector.
                    </p>
                  </div>
                ) : (
                  events.map((event, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden"
                      onClick={() => {
                        if (event.code) {
                          navigator.clipboard.writeText(event.code);
                          // We could add a local state for 'copied' per item if needed, 
                          // but for simplicity, we'll use a temporary visual indicator.
                          const el = document.getElementById(`copy-indicator-${idx}`);
                          if (el) {
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0)';
                            setTimeout(() => {
                              el.style.opacity = '0';
                              el.style.transform = 'translateY(10px)';
                            }, 2000);
                          }
                        }
                      }}
                    >
                      <div id={`copy-indicator-${idx}`} className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center opacity-0 transform translate-y-2 transition-all duration-300 pointer-events-none z-10">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          Code Copied to Clipboard
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-headline font-bold text-primary group-hover:text-glow transition-all uppercase">{event.type || 'Mission'}</span>
                        <span className="text-[8px] font-mono text-slate-500">{event.time || 'T-Minus 0h'}</span>
                      </div>
                      <p className="text-[11px] font-body text-slate-300 line-clamp-2">
                        {event.message}
                      </p>
                      {event.code && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary font-mono rounded select-all font-bold tracking-widest">
                            {event.code}
                          </span>
                          <span className="text-[8px] text-slate-500 italic">Click to copy</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5">
                <button className="w-full py-2 text-[9px] font-headline font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-[0.3em]">
                   Clear Local Cache
                </button>
              </div>
            </div>
            
            {/* Tactical Corner accents */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/30"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/30"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
