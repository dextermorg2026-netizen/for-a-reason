import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCoins } from "../../context/CoinContext";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import {
  getQuestionsBySubjectAndDifficulty,
} from "../../services/quizService";

import {
  saveQuizAttempt,
  getPreviouslyCorrectQuestionIds,
} from "../../services/quizAttemptService";

const QUESTION_TIME = 30;

const Quiz = () => {
  const { subjectId, level } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const { addCoins } = useCoins();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previouslyCorrectIds, setPreviouslyCorrectIds] = useState([]);

  /* ================= FETCH QUESTIONS ================= */

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (!currentUser) return;

        const previousCorrectIds = await getPreviouslyCorrectQuestionIds(
          currentUser.uid,
          subjectId,
          level
        );
        setPreviouslyCorrectIds(previousCorrectIds);

        const allQuestions =
          await getQuestionsBySubjectAndDifficulty(subjectId, level);

        if (!allQuestions || allQuestions.length === 0) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        const shuffled = [...allQuestions]
          .sort(() => 0.5 - Math.random())
          .map((q, index) => ({
            ...q,
            id: q.id ?? index,
          }));

        setQuestions(shuffled);
        setTimeLeft(shuffled.length * QUESTION_TIME);
      } catch (err) {
        console.error("[Quiz ERROR]", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [subjectId, level, currentUser, navigate]);

  /* ================= TIMER ================= */

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!questions.length || isSubmitting || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [questions.length, isSubmitting, timeLeft <= 0]);

  useEffect(() => {
    if (questions.length > 0 && timeLeft === 0 && !isSubmitting) {
      handleFinalSubmit(answersRef.current);
    }
  }, [timeLeft, questions.length, isSubmitting]);

  if (loading) return <p className="muted">Loading quiz...</p>;

  if (!questions.length) {
    return (
      <div className="page-card">
        <h2>No questions found for this quiz.</h2>
        <button
          className="btn-primary"
          onClick={() => navigate("/quizzes")}
          style={{ marginTop: "20px" }}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  /* ================= ANSWER HANDLING ================= */

  const handleOptionSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  /* ================= FINAL SUBMIT ================= */

  const handleFinalSubmit = async (finalAnswers = answers) => {
    if (!currentUser) {
      console.error("USER NOT READY");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const correctIds = [];
    const wrongIds = [];

    questions.forEach((q) => {
      if (finalAnswers[q.id] === Number(q.correctAnswer)) {
        correctIds.push(q.id);
      } else {
        wrongIds.push(q.id);
      }
    });

    const newlyCorrectIds = correctIds.filter(id => !previouslyCorrectIds.includes(id));
    const newCorrectCount = newlyCorrectIds.length;
    const correctCount = correctIds.length;

    let coinsPerQuestion = 5;
    if (level === "medium") coinsPerQuestion = 10;
    if (level === "hard") coinsPerQuestion = 15;

    const coinsEarned = newCorrectCount * coinsPerQuestion;

    /* ================= NAVIGATE FIRST ================= */

    navigate("/quiz/result", {
      state: {
        score: correctCount,
        total: questions.length,
        coinsEarned,
        questions,
        answers: finalAnswers,
        previouslyCorrectIds,
      },
      replace: true,
    });

    /* ================= FIREBASE SAVE (background) ================= */

    try {
      await addCoins(coinsEarned, subjectId);

      await saveQuizAttempt({
        userId: currentUser.uid,
        subjectId,
        difficulty: level,
        score: correctCount,
        coinsEarned,
        questions,
        answers: finalAnswers,
        correctQuestionIds: correctIds,
        wrongQuestionIds: wrongIds,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("SAVE ERROR:", err);
    }

    setIsSubmitting(false);
  };

  /* ================= UI ================= */

  /* ================= UI ================= */

  const totalQuizTime = questions.length * QUESTION_TIME;

  return (
    <main className="max-w-6xl mx-auto pb-20 px-4 md:px-8">
      {/* Header Info */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary pulse-emerald"></span>
            <span className="font-headline text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Operational_Assessment :: Active</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tighter uppercase">
            {subjectId} <span className="text-primary opacity-50">//</span> {level}
          </h1>
        </div>

        <div className="flex items-center gap-6 bg-surface-container-low asymmetric-card hud-border px-6 py-3">
           <div className="flex flex-col items-end">
              <span className="font-headline text-[8px] font-semibold text-slate-600 uppercase tracking-widest">Chronometer</span>
              <span className={`font-headline text-2xl font-bold tracking-tighter ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Main Question Panel */}
        <div className="lg:col-span-9 space-y-8">
          <div className="bg-[#131313] asymmetric-card hud-border p-8 md:p-12 relative min-h-[400px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-error' : 'bg-primary'}`}
                 style={{ width: `${(timeLeft / (totalQuizTime || 1)) * 100}%` }}
               ></div>
            </div>

            <div className="mt-4 mb-12">
               <span className="font-headline text-[10px] font-bold text-primary uppercase tracking-widest mb-4 block">Question_Payload_0{currentIndex + 1}</span>
               <h2 className="text-2xl md:text-3xl font-headline font-semibold text-on-surface uppercase tracking-tight leading-tight">
                 {currentQuestion.question}
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
               {(currentQuestion.options || []).map((option, index) => {
                 const isSelected = answers[currentQuestion.id] === index;
                 return (
                   <button
                     key={index}
                     onClick={() => handleOptionSelect(index)}
                     className={`group relative p-6 text-left border transition-all duration-300 asymmetric-card-small ${
                       isSelected 
                         ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(183,109,255,0.2)]" 
                         : "bg-surface-container-lowest border-white/5 hover:border-white/20"
                     }`}
                   >
                     <div className="flex items-center gap-4">
                       <div className={`w-8 h-8 rounded border flex items-center justify-center font-headline text-xs font-bold transition-all ${
                         isSelected 
                           ? "bg-primary text-on-primary border-primary" 
                           : "bg-surface-container-low border-white/10 text-slate-500 group-hover:border-primary/50 group-hover:text-primary"
                       }`}>
                         {String.fromCharCode(65 + index)}
                       </div>
                       <span className={`font-body text-sm md:text-base uppercase tracking-wider ${isSelected ? 'text-on-surface font-semibold' : 'text-slate-400 group-hover:text-on-surface'}`}>
                         {option}
                       </span>
                     </div>
                   </button>
                 );
               })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1 md:flex-none px-8 py-4 bg-surface-container-low border border-white/10 text-slate-400 font-headline font-semibold text-xs uppercase tracking-widest asymmetric-card hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous Protocol
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="flex-1 md:flex-none px-8 py-4 bg-surface-container-low border border-white/10 text-slate-400 font-headline font-semibold text-xs uppercase tracking-widest asymmetric-card hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next Protocol
              </button>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => handleFinalSubmit(answers)}
                disabled={isSubmitting}
                className="flex-1 md:flex-none px-12 py-4 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_20px_rgba(183,109,255,0.3)] hover:scale-[1.05] transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Synchronizing..." : "Finalize Mission"}
              </button>
            </div>
          </div>
        </div>

        {/* Side HUD Palette */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#131313] asymmetric-card hud-border p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <h3 className="font-headline font-semibold text-[10px] text-slate-500 uppercase tracking-[0.3em]">Telemetry Palette</h3>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = i === currentIndex;
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`aspect-square rounded flex items-center justify-center font-headline text-[10px] font-bold transition-all ${
                      isActive 
                        ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(183,109,255,0.5)] border-primary" 
                        : isAnswered 
                          ? "bg-secondary/20 text-secondary border border-secondary/30" 
                          : "bg-surface-container-lowest text-slate-700 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-headline font-semibold">
                 <span className="text-slate-600 uppercase tracking-widest">Completed</span>
                 <span className="text-secondary">{Object.keys(answers).length} / {questions.length}</span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary transition-all" 
                    style={{ width: `${(Object.keys(answers).length / (questions.length || 1)) * 100}%` }}
                  ></div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 opacity-50">
            <span className="material-symbols-outlined text-sm text-slate-500">encryption</span>
            <span className="font-headline text-[8px] font-semibold text-slate-500 uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Quiz;