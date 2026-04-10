import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTopicById, getSubtopicsByTopic } from "../../services/subjectService";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const FlashcardViewer = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [topic, setTopic] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [flashcards, setFlashcards] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const topicData = await getTopicById(topicId);
                setTopic(topicData);

                const subtopicData = await getSubtopicsByTopic(topicId);
                setFlashcards(subtopicData || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [topicId]);

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % flashcards.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
            <p className="font-headline font-bold text-xs text-primary uppercase tracking-[0.4em]">Establishing_Neural_Sync...</p>
        </div>
    );

    const currentCard = flashcards[currentIndex];
    const progressPercent = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

    return (
        <main className="pb-20 max-w-5xl mx-auto px-4 print:p-0 print:m-0 print:max-w-none">
            <div className="print:hidden">
            {/* Intel Path Breadcrumbs */}
            <nav className="mb-12 flex items-center gap-2 text-slate-500 font-headline text-[10px] font-bold uppercase tracking-[0.25em]">
                <Link to="/subjects" className="hover:text-primary transition-colors">Sector Archive</Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <Link to={topic ? `/subjects/${topic.subjectId}` : "/subjects"} className="hover:text-primary transition-colors">Modules</Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-on-surface">Cognitive Reinforcement</span>
            </nav>

            {/* Mission Status Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ddb7ff]"></div>
                        <span className="text-[10px] font-headline tracking-[0.2em] text-primary uppercase font-bold">Operation: Reinforce</span>
                    </div>
                    <h1 className="text-4xl font-headline font-bold tracking-tighter text-on-surface uppercase">
                        {topic?.title || "COGNITIVE_TASK"}
                    </h1>
                    <p className="text-neutral-500 font-headline text-xs tracking-widest mt-1 uppercase font-bold">INTEL_NODE_TRAINING_SEQUENCE</p>
                </div>
                <div className="bg-surface-container-low p-5 asymmetric-card border-l-2 border-primary min-w-[300px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-headline text-neutral-400 tracking-widest uppercase font-bold">Sequence_Progress</span>
                        <span className="text-xs font-headline text-primary font-black">{currentIndex + 1}/{flashcards.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_10px_rgba(221,183,255,0.6)] transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center">
                {/* The Flashcard Container - STATIC HUD PANEL */}
                <div className="relative w-full max-w-3xl min-h-[22rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.98, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 1.02, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                        >
                            <div className="bg-[#0c0c0c] asymmetric-card hud-border p-6 md:p-12 flex flex-col items-center justify-center text-center ring-1 ring-white/5 shadow-2xl relative overflow-hidden h-full">
                                {/* Header Accents */}
                                <div className="absolute top-6 left-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded">
                                        <span className="material-symbols-outlined text-primary text-base">psychology</span>
                                    </div>
                                    <div className="flex flex-col items-start translate-y-1">
                                        <span className="text-[8px] font-headline font-bold text-primary uppercase tracking-[0.3em]">Query_Input</span>
                                        <span className="text-[7px] font-headline text-slate-600 uppercase font-bold">Node_Index: 0{currentIndex + 1}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl md:text-2xl font-headline font-semibold text-on-surface uppercase tracking-tight leading-tight mb-4 drop-shadow-lg max-w-lg mt-10">
                                    {currentCard?.title}
                                </h3>

                                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8"></div>

                                {/* Theory Display - ALWAYS SHOWN */}
                                <div className="w-full max-h-[16rem] overflow-y-auto no-scrollbar mb-4 text-left px-4 lg:px-10">
                                    <div className="space-y-4">
                                        {(() => {
                                            const theory = currentCard?.theory;
                                            if (!theory) return <p className="text-sm md:text-base font-body text-slate-500 italic uppercase text-center">No intel data available for this node.</p>;
                                            
                                            const lines = Array.isArray(theory) 
                                                ? theory 
                                                : theory.split('\n').filter(l => l.trim() !== '');

                                            return lines.map((line, i) => (
                                                <div key={i} className="flex gap-4 items-start group/line">
                                                    <span className="text-primary opacity-30 group-hover/line:opacity-100 transition-opacity font-bold mt-1 text-[11px]">▶</span>
                                                    <p className="text-sm md:text-base font-body text-slate-300 leading-relaxed tracking-wider font-medium normal-case">
                                                        {line}
                                                    </p>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                                
                                <div className="absolute bottom-6 right-6 text-neutral-800 font-headline text-[30px] font-black italic select-none opacity-20 pointer-events-none tracking-tighter">
                                    LEARNLOOP
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="mt-8 flex items-center justify-between w-full max-w-3xl px-8">
                    <button 
                        onClick={handlePrev}
                        className="flex items-center gap-4 group transition-all"
                    >
                        <div className="w-10 h-10 rounded bg-surface-container border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/30 transition-all bg-surface-container-lowest">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </div>
                        <span className="hidden md:block text-[9px] font-headline font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">Previous_Node</span>
                    </button>
                    
                    <div className="flex flex-col items-center gap-1">
                        <span className="font-headline font-bold text-xl text-on-surface tracking-tighter">
                            {currentIndex + 1} <span className="text-slate-700 px-1">/</span> {flashcards.length}
                        </span>
                        <span className="text-[7px] font-headline font-bold uppercase tracking-[0.3em] text-slate-600">Sync_Index</span>
                    </div>

                    <button 
                        onClick={handleNext}
                        className="flex items-center gap-4 group transition-all text-right"
                    >
                        <span className="hidden md:block text-[9px] font-headline font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">Next_Node</span>
                        <div className="w-10 h-10 rounded bg-surface-container border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/30 transition-all bg-surface-container-lowest">
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </div>
                    </button>
                </div>

                <div className="mt-16 flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                    <button 
                        className="flex items-center gap-2 text-[10px] font-headline font-bold text-slate-500 hover:text-error transition-colors uppercase tracking-widest"
                        onClick={() => navigate(`/subjects/${topic?.subjectId}`)}
                    >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Terminate_Session
                    </button>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                    <button 
                        className="flex items-center gap-2 text-[10px] font-headline font-bold text-slate-500 hover:text-secondary transition-colors uppercase tracking-widest"
                        onClick={() => window.print()}
                    >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Print_Intel
                    </button>
                </div>
            </div>

            {/* System Telemetry Footer */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-4 opacity-70">
                <div className="bg-surface-container-lowest p-4 border-l-2 border-primary/20">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Neural Sync</p>
                    <p className="text-sm font-headline text-primary font-bold uppercase">Optimized</p>
                </div>
                <div className="bg-surface-container-lowest p-4 border-l-2 border-secondary/20">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Buffer Depth</p>
                    <p className="text-sm font-headline text-secondary font-bold uppercase">Stable</p>
                </div>
                <div className="bg-surface-container-lowest p-4 border-l-2 border-tertiary/20">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Mistake Log</p>
                    <p className="text-sm font-headline text-tertiary font-bold uppercase">Empty</p>
                </div>
                <div className="bg-surface-container-lowest p-4 border-l-2 border-[#fb7185]/20">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Operational</p>
                    <p className="text-sm font-headline text-[#fb7185] font-bold uppercase">Active</p>
                </div>
            </div>
            </div>

            {/* PRINT ONLY SECTION - Renders all cards */}
            <div className="hidden print:block space-y-8">
                {flashcards.map((card, index) => (
                    <div key={index} className="break-after-page min-h-[500px] flex flex-col items-center justify-center p-8 bg-[#0c0c0c] text-white border-2 border-primary/30 relative overflow-hidden mb-12">
                        {/* Print Header */}
                        <div className="absolute top-8 left-8 flex items-center gap-3">
                            <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.3em]">Query_Input</span>
                            <span className="text-[10px] font-headline text-slate-500 uppercase font-bold">Node_Index: 0{index + 1}</span>
                        </div>

                        <div className="mt-12 text-center max-w-2xl px-8">
                            <h3 className="text-2xl md:text-3xl font-headline font-semibold uppercase tracking-tight leading-tight mb-8">
                                {card.title}
                            </h3>
                            
                            <div className="w-24 h-0.5 bg-primary/30 mx-auto mb-8"></div>

                            <div className="space-y-6 text-left">
                                {(() => {
                                    const theory = card.theory;
                                    if (!theory) return <p className="text-sm italic uppercase text-center text-slate-500">No intel data available for this node.</p>;
                                    
                                    const lines = Array.isArray(theory) 
                                        ? theory 
                                        : theory.split('\n').filter(l => l.trim() !== '');

                                    return lines.map((line, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <span className="text-primary font-bold mt-1 text-xs">▶</span>
                                            <p className="text-lg font-body text-slate-200 leading-relaxed tracking-wider normal-case">
                                                {line}
                                            </p>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="absolute bottom-8 right-8 text-neutral-800 font-headline text-[40px] font-black italic select-none opacity-10 tracking-tighter">
                            LEARNLOOP
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default FlashcardViewer;
