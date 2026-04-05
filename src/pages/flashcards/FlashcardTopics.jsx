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
            <nav className="mb-8 flex items-center gap-2 text-slate-500 font-headline text-[10px] font-semibold uppercase tracking-widest">
                <Link to="/subjects" className="hover:text-primary transition-colors">Operational Sectors</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-on-surface">{subjectName}</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-on-surface">Flashcards</span>
            </nav>

            <section className="mb-12">
                <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tighter uppercase">{subjectName} // FLASHCARDS</h1>
                <p className="text-slate-500 font-body text-sm uppercase tracking-[0.3em] mt-2">Select a module to begin cognitive reinforcement</p>
            </section>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="asymmetric-card hud-border h-48 bg-surface-container-low animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {topics.map((topic, index) => (
                        <div 
                            key={topic.id}
                            onClick={() => navigate(`/flashcards/view/${topic.id}`)}
                            className="group relative bg-surface-container-low asymmetric-card hud-border p-8 cursor-pointer hover:bg-primary/5 transition-all duration-300 border-l-4 border-white/5 hover:border-primary"
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-headline font-bold text-slate-600 uppercase tracking-widest group-hover:text-primary transition-colors">Module 0{index + 1}</span>
                                    <h3 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                                        {topic.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 mt-8 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-primary">Initialize</span>
                                    <span className="material-symbols-outlined text-sm text-primary">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default FlashcardTopics;
