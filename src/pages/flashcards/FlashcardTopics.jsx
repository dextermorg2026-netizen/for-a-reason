import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTopicsBySubject, getAllSubjects } from "../../services/subjectService";
import { useAuth } from "../../context/AuthContext";

const FlashcardTopics = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [topics, setTopics] = useState([]);
    const [subjectName, setSubjectName] = useState("");
    const [loading, setLoading] = useState(true);

    const glowColors = [
        { text: "glow-text-secondary", border: "border-secondary/30", shadow: "shadow-[0_0_2px_#4cd7f6]", textCol: "text-secondary", bg: "bg-secondary/5", borderPlain: "border-secondary/10" },
        { text: "glow-text-primary", border: "border-primary/30", shadow: "shadow-[0_0_2px_#ddb7ff]", textCol: "text-primary", bg: "bg-primary/5", borderPlain: "border-primary/10" },
        { text: "glow-text-tertiary", border: "border-tertiary/30", shadow: "shadow-[0_0_2px_#4edea3]", textCol: "text-tertiary", bg: "bg-tertiary/5", borderPlain: "border-tertiary/10" },
        { text: "glow-text-rose", border: "border-[#fb7185]/30", shadow: "shadow-[0_0_2px_#fb7185]", textCol: "text-[#fb7185]", bg: "bg-[#fb7185]/5", borderPlain: "border-[#fb7185]/10" },
        { text: "glow-text-amber", border: "border-[#fbbf24]/30", shadow: "shadow-[0_0_2px_#fbbf24]", textCol: "text-[#fbbf24]", bg: "bg-[#fbbf24]/5", borderPlain: "border-[#fbbf24]/10" },
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const subjects = await getAllSubjects();
                const subject = subjects.find(s => s.id === subjectId);
                setSubjectName(subject?.title || subject?.name || "Subject");

                const topicData = await getTopicsBySubject(subjectId);
                setTopics(topicData || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [subjectId]);

    return (
        <main className="pb-20">
            {/* Intel Path Breadcrumbs */}
            <nav className="mb-12 flex items-center gap-2 text-slate-500 font-headline text-[10px] font-bold uppercase tracking-[0.25em]">
                <Link to="/flashcards" className="hover:text-primary transition-colors">Sector Archive</Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-on-surface">{subjectName}</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-on-surface">Cognitive Modules</span>
            </nav>

            {/* Mission Status Header */}
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#4cd7f6]"></div>
                        <span className="text-[10px] font-headline tracking-[0.2em] text-secondary uppercase font-bold">Sector: {subjectName}</span>
                    </div>
                    <h1 className="text-5xl font-headline font-bold tracking-tighter text-on-surface uppercase">MODULE_LIBRARY</h1>
                    <p className="text-neutral-500 font-headline text-xs tracking-widest mt-1 uppercase font-bold">AVAILABLE_INTEL_NODES_FOR_REINFORCEMENT</p>
                </div>
                <div className="bg-surface-container-low p-5 asymmetric-card border-l-2 border-secondary min-w-[300px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-headline text-neutral-400 tracking-widest uppercase font-bold">MODULES_IDENTIFIED</span>
                        <span className="text-xs font-headline text-secondary font-black">{topics.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-secondary shadow-[0_0_10px_rgba(76,215,246,0.6)] transition-all ease-out duration-1000" style={{ width: topics.length > 0 ? '100%' : '0%' }}></div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="asymmetric-card h-48 bg-surface-container-low animate-pulse border border-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[9px] font-headline font-bold ${style.textCol} opacity-70 uppercase tracking-[0.3em]`}>Node_0{index + 1}</span>
                                            <span className={`material-symbols-outlined text-[14px] ${style.textCol} opacity-40 group-hover:opacity-80 group-hover:rotate-45 transition-all`}>hub</span>
                                        </div>
                                        <h3 className={`text-lg font-headline font-semibold text-on-surface uppercase tracking-tight leading-tight group-hover:${style.textCol} ${style.text} transition-all duration-300`}>
                                            {topic.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="mt-8 space-y-4">
                                        <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                                            <div className={`h-full ${style.textCol.replace('text-', 'bg-')} bg-opacity-20 group-hover:bg-opacity-100 transition-all duration-700 w-1/4 group-hover:w-full ${style.shadow}`}></div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                                            <span className={`text-[10px] font-headline font-black uppercase tracking-widest ${style.textCol}`}>Initialize_Sync</span>
                                            <span className={`material-symbols-outlined text-sm ${style.textCol}`}>arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Empty Slot placeholder */}
                    <div className="border-2 border-dashed border-neutral-800 asymmetric-card p-8 flex flex-col items-center justify-center hover:border-primary/20 transition-all cursor-not-allowed group">
                         <span className="material-symbols-outlined text-neutral-800 group-hover:text-neutral-600 text-3xl mb-4 transition-all">add_circle</span>
                         <p className="font-headline text-[9px] font-bold text-neutral-800 group-hover:text-neutral-700 tracking-[0.2em] uppercase">Pending_Data_Entry</p>
                    </div>
                </div>
            )}

            {/* System Telemetry Footer */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 opacity-60 hover:opacity-100 transition-opacity">
                <div className="bg-surface-container-lowest p-4 border-l border-primary/30">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold font-headline">Protocol</p>
                    <p className="text-sm font-headline text-primary font-bold">TC_CORE_v1.2</p>
                </div>
                <div className="bg-surface-container-lowest p-4 border-l border-secondary/30">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold font-headline">Link Speed</p>
                    <p className="text-sm font-headline text-secondary font-bold">RELIABLE</p>
                </div>
                <div className="bg-surface-container-lowest p-4 border-l border-tertiary/30">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold font-headline">Packet Status</p>
                    <p className="text-sm font-headline text-tertiary font-bold">ENCRYPTED</p>
                </div>
                <div className="bg-surface-container-lowest p-4 border-l border-rose-glow/30">
                    <p className="text-[9px] font-headline text-neutral-500 uppercase tracking-widest font-bold font-headline">Uptime</p>
                    <p className="text-sm font-headline text-rose-glow font-bold">99.98%</p>
                </div>
            </div>
        </main>
    );
};

export default FlashcardTopics;
