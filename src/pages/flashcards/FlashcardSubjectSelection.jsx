import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";
import { useAuth } from "../../context/AuthContext";

const FlashcardSubjectSelection = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const glowColors = [
        { text: "glow-text-secondary", border: "border-secondary/50", shadow: "shadow-[0_0_5px_#4cd7f6]", textCol: "text-secondary", bg: "bg-secondary/10", borderPlain: "border-secondary/20" },
        { text: "glow-text-primary", border: "border-primary/50", shadow: "shadow-[0_0_5px_#ddb7ff]", textCol: "text-primary", bg: "bg-primary/10", borderPlain: "border-primary/20" },
        { text: "glow-text-tertiary", border: "border-tertiary/50", shadow: "shadow-[0_0_5px_#4edea3]", textCol: "text-tertiary", bg: "bg-tertiary/10", borderPlain: "border-tertiary/20" },
        { text: "glow-text-rose", border: "border-[#fb7185]/50", shadow: "shadow-[0_0_5px_#fb7185]", textCol: "text-[#fb7185]", bg: "bg-[#fb7185]/10", borderPlain: "border-[#fb7185]/20" },
        { text: "glow-text-amber", border: "border-[#fbbf24]/50", shadow: "shadow-[0_0_5px_#fbbf24]", textCol: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", borderPlain: "border-[#fbbf24]/20" },
    ];

    const getIcon = (title = "") => {
        const t = title.toLowerCase();
        if (t.includes("physic")) return "atm";
        if (t.includes("neural") || t.includes("ai") || t.includes("intell")) return "psychology";
        if (t.includes("security") || t.includes("cyber")) return "shield_lock";
        if (t.includes("crypto")) return "key_visualizer";
        if (t.includes("robot")) return "precision_manufacturing";
        return "database";
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAllSubjects();
                setSubjects(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <main className="pb-20">
            {/* Mission Status Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#4edea3]"></div>
                        <span className="text-[10px] font-headline tracking-[0.2em] text-tertiary uppercase">Operational Status: Active</span>
                    </div>
                    <h1 className="text-4xl font-headline font-bold tracking-tighter text-on-surface">SUBJECT_ARCHIVE</h1>
                    <p className="text-neutral-500 font-headline text-xs tracking-widest mt-1">SELECT_SECTOR_FOR_COGNITIVE_REINFORCEMENT</p>
                </div>
                <div className="bg-surface-container-low p-4 asymmetric-card border-l-2 border-primary min-w-[280px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-headline text-neutral-400 tracking-widest">FLASHCARD_MASTERY</span>
                        <span className="text-xs font-headline text-primary">74.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[74.2%] shadow-[0_0_10px_rgba(221,183,255,0.5)]"></div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="asymmetric-card h-64 bg-surface-container-low animate-pulse border border-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject, index) => {
                        const style = glowColors[index % glowColors.length];
                        return (
                            <div 
                                key={subject.id}
                                onClick={() => navigate(`/subjects/${subject.id}`)}
                                className="group relative bg-surface-container-low asymmetric-card p-6 border-t border-l border-white/5 hover:bg-surface-container-high transition-all cursor-pointer"
                            >
                                <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 ${style.border} rounded-tl-lg`}></div>
                                
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`material-symbols-outlined ${style.textCol} text-3xl transition-transform group-hover:scale-110`}>
                                        {getIcon(subject.title)}
                                    </span>
                                    <span className={`${style.bg} ${style.textCol} text-[9px] font-bold px-2 py-0.5 tracking-tighter border ${style.borderPlain}`}>CLASS_{index === 0 ? 'S' : index % 2 === 0 ? 'A' : 'B'}</span>
                                </div>

                                <h3 className={`text-2xl font-headline font-bold ${style.textCol} ${style.text} mb-8 uppercase line-clamp-1`}>
                                    {subject.title || subject.name}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-headline tracking-widest text-neutral-400 uppercase font-semibold">
                                        <span>Current Mastery</span>
                                        <span className={style.textCol}>{Math.floor(Math.random() * 40) + 60}%</span>
                                    </div>
                                    <div className="h-1 bg-surface-container-highest overflow-hidden">
                                        <div className={`h-full ${style.textCol.replace('text-', 'bg-')} w-[${Math.floor(Math.random() * 40) + 60}%] ${style.shadow}`} style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-neutral-500 font-headline uppercase font-bold tracking-tight">Last Sync</span>
                                            <span className="text-xs font-headline text-on-surface uppercase font-semibold">{(new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '.')}</span>
                                        </div>
                                        <span className={`material-symbols-outlined text-neutral-600 text-lg group-hover:${style.textCol} group-hover:translate-x-1 transition-all`}>arrow_forward_ios</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* System Telemetry Footer */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest p-3 border-l border-secondary/20">
                    <p className="text-[8px] font-headline text-neutral-500 uppercase tracking-widest font-bold">System Latency</p>
                    <p className="text-sm font-headline text-secondary font-bold">12ms</p>
                </div>
                <div className="bg-surface-container-lowest p-3 border-l border-primary/20">
                    <p className="text-[8px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Active Threads</p>
                    <p className="text-sm font-headline text-primary font-bold">2.4k</p>
                </div>
                <div className="bg-surface-container-lowest p-3 border-l border-tertiary/20">
                    <p className="text-[8px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Cognitive Node</p>
                    <p className="text-sm font-headline text-tertiary font-bold">OPTIMIZED</p>
                </div>
                <div className="bg-surface-container-lowest p-3 border-l border-[#fb7185]/20">
                    <p className="text-[8px] font-headline text-neutral-500 uppercase tracking-widest font-bold">Encryption Level</p>
                    <p className="text-sm font-headline text-[#fb7185] font-bold">AES-4096</p>
                </div>
            </div>
        </main>
    );
};

export default FlashcardSubjectSelection;
