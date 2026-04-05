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
    const [isFlipped, setIsFlipped] = useState(false);
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
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % flashcards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-headline">SYNCING_PROTOCOL_DATA...</div>;

    const currentCard = flashcards[currentIndex];

    return (
        <main className="pb-20 max-w-4xl mx-auto">
            <nav className="mb-12 flex items-center gap-2 text-slate-500 font-headline text-[10px] font-semibold uppercase tracking-widest">
                <Link to="/subjects" className="hover:text-primary transition-colors">Operational Sectors</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                {topic && <span className="text-on-surface uppercase">{topic.title}</span>}
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-on-surface uppercase">Cognitive Reinforcement</span>
            </nav>

            <div className="flex flex-col items-center">
                <section className="mb-12 text-center">
                    <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tighter mb-4 uppercase">Cognitive Reinforcement</h1>
                    <p className="text-slate-500 font-body text-xs uppercase tracking-[0.3em] font-semibold">Active Synchronization Task</p>
                </section>

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-12">
                    {flashcards.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 cursor-pointer transition-all ${i === currentIndex ? 'w-8 bg-primary shadow-[0_0_10px_#ddb7ff]' : 'w-4 bg-white/5 hover:bg-white/10'}`} 
                            onClick={() => { setIsFlipped(false); setCurrentIndex(i); }}
                        ></div>
                    ))}
                </div>

                {/* The Flashcard Container */}
                <div className="relative w-full max-w-3xl min-h-[36rem] perspective-1000 group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full cursor-pointer preserve-3d transition-transform duration-700 pointer-events-auto"
                            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            {/* Front of Card */}
                            <div 
                                className="absolute inset-0 bg-surface-container-low asymmetric-card hud-border p-12 flex flex-col items-center justify-center text-center backface-hidden"
                                style={{ backfaceVisibility: 'hidden' }}
                            >
                                <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.3em] mb-6">INTEL_NODE 0{currentIndex + 1}</span>
                                <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface uppercase tracking-tight leading-tight mb-6 border-b border-primary/20 pb-4 w-full">
                                    {currentCard?.title}
                                </h3>
                                <p className="text-sm md:text-base font-body text-slate-300 leading-relaxed uppercase tracking-wider px-4">
                                    {currentCard?.theory}
                                </p>
                                <div className="mt-12 flex items-center gap-2 text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                                    <span className="material-symbols-outlined text-sm">touch_app</span>
                                    Reveal Intel
                                </div>
                            </div>

                            {/* Back of Card */}
                            <div 
                                className="absolute inset-0 bg-primary/10 asymmetric-card hud-border p-12 flex flex-col items-center justify-center text-center backface-hidden"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                                <span className="text-[10px] font-headline font-bold text-secondary uppercase tracking-[0.3em] mb-8">NODE_INTEGRATED</span>
                                <div className="space-y-6">
                                    <h4 className="text-lg font-headline font-bold text-primary uppercase tracking-widest italic font-semibold">"Knowledge is Power"</h4>
                                    <p className="text-xs font-body text-slate-400 uppercase tracking-widest leading-relaxed">
                                        Module: {topic?.title}<br/>
                                        Operator: {currentUser?.displayName || 'SYSTEM'}<br/>
                                        Status: VERIFIED
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="mt-12 flex items-center gap-8">
                    <button 
                        onClick={handlePrev}
                        className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all bg-surface-container-lowest"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    
                    <span className="font-headline font-bold text-xs uppercase tracking-widest text-slate-500">
                        Entry <span className="text-on-surface">{currentIndex + 1}</span> / {flashcards.length}
                    </span>

                    <button 
                        onClick={handleNext}
                        className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all bg-surface-container-lowest"
                    >
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>

                <div className="mt-16 flex flex-col items-center">
                    <button 
                        className="flex items-center gap-2 px-8 py-4 bg-surface-container-low border border-white/10 text-slate-400 font-headline font-bold text-xs uppercase tracking-widest asymmetric-card hover:bg-white/5"
                        onClick={() => navigate(`/subjects/${topic?.subjectId}`)}
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Abort Reinforcement
                    </button>
                </div>
            </div>
        </main>
    );
};

export default FlashcardViewer;
