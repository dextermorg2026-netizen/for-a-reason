import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects } from "../../services/subjectService";
import { useAuth } from "../../context/AuthContext";

const FlashcardSubjectSelection = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <section className="mb-12">
                <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tighter uppercase">FLASHCARD SECTORS</h1>
                <p className="text-slate-500 font-body text-sm uppercase tracking-[0.3em] mt-2">Select a sector to begin cognitive reinforcement</p>
            </section>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="asymmetric-card hud-border h-64 bg-surface-container-low animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subjects.map((subject) => (
                        <div 
                            key={subject.id}
                            onClick={() => navigate(`/flashcards/${subject.id}`)}
                            className="group bg-surface-container-low asymmetric-card hud-border cursor-pointer hover:bg-surface-container-high transition-all border border-white/5"
                        >
                            <div className="p-8">
                                <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.4em] mb-4 block">ACTIVE_SECTOR</span>
                                <h3 className="text-2xl font-headline font-bold text-on-surface uppercase mb-4 group-hover:text-primary transition-colors">{subject.title || subject.name}</h3>
                                <p className="text-xs text-slate-500 font-body line-clamp-2 uppercase tracking-wide mb-8">{subject.description}</p>
                                <button className="flex items-center gap-2 text-xs font-headline font-bold text-primary tracking-widest uppercase">
                                    INITIATE_STUDY <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default FlashcardSubjectSelection;
