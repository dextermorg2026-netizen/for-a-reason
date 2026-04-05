import { useEffect, useState } from "react";
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
  getUserQuizAttempt,
} from "../../services/quizAttemptService";

const QUESTION_TIME = 30;

const Quiz = () => {
  const { subjectId, level } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const { addCoins } = useCoins();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= FETCH QUESTIONS ================= */

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (!currentUser) return;

        const previousAttempt = await getUserQuizAttempt(
          currentUser.uid,
          subjectId,
          level
        );

        // ✅ If already attempted → go directly to result
        if (previousAttempt && previousAttempt.questions) {
          navigate("/quiz/result", {
            state: {
              score: previousAttempt.score ?? 0,
              total: previousAttempt.questions?.length ?? 0,
              coinsEarned: previousAttempt.coinsEarned ?? 0,
              questions: previousAttempt.questions ?? [],
              answers: previousAttempt.answers ?? {},
            },
            replace: true,
          });
          return;
        }

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
      } catch (err) {
        console.error("[Quiz ERROR]", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [subjectId, level, currentUser, navigate]);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!questions.length) return;

    if (timeLeft === 0) {
      saveAnswerAndNext();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, questions, currentIndex]);

  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
  }, [currentIndex]);

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

  const saveAnswerAndNext = () => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: selectedAnswer,
    };

    setAnswers(updatedAnswers);
    setSelectedAnswer(null);

    if (currentIndex === questions.length - 1) {
      handleFinalSubmit(updatedAnswers);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  /* ================= FINAL SUBMIT ================= */

  const handleFinalSubmit = async (finalAnswers) => {
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

    const correctCount = correctIds.length;

    let coinsPerQuestion = 5;
    if (level === "medium") coinsPerQuestion = 10;
    if (level === "hard") coinsPerQuestion = 15;

    const coinsEarned = correctCount * coinsPerQuestion;

    /* ================= NAVIGATE FIRST ================= */

    navigate("/quiz/result", {
      state: {
        score: correctCount,
        total: questions.length,
        coinsEarned,
        questions,
        answers: finalAnswers,
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

  return (
    <main className="max-w-4xl mx-auto pb-20">
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
              <span className={`font-headline text-2xl font-bold tracking-tighter ${timeLeft <= 5 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                00:{String(timeLeft).padStart(2, "0")}
              </span>
           </div>
           <div className="w-[1px] h-8 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="font-headline text-[8px] font-semibold text-slate-600 uppercase tracking-widest">Progress</span>
              <span className="font-headline text-2xl font-bold text-on-surface tracking-tighter">
                {String(currentIndex + 1).padStart(2, "0")}<span className="text-xs text-slate-600">/{questions.length}</span>
              </span>
           </div>
        </div>
      </section>

      {/* Main Question Card */}
      <section className="bg-[#131313] asymmetric-card hud-border p-8 md:p-14 mb-10 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-error' : 'bg-primary'}`}
              style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
            ></div>
         </div>

         <div className="mb-12">
            <span className="font-headline text-[10px] font-bold text-primary uppercase tracking-widest mb-4 block">Question_Payload_0{currentIndex + 1}</span>
            <h2 className="text-2xl md:text-3xl font-headline font-semibold text-on-surface uppercase tracking-tight leading-tight">
              {currentQuestion.question}
            </h2>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {(currentQuestion.options || []).map((option, index) => {
              const isSelected = selectedAnswer === index;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`group relative p-6 text-left border transition-all duration-300 asymmetric-card-small ${
                    isSelected 
                      ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(183,109,255,0.2)]" 
                      : "bg-surface-container-lowest border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-10 h-10 rounded border flex items-center justify-center font-headline text-xs font-bold transition-all ${
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

         <div className="mt-12 flex justify-end">
            <button
              onClick={saveAnswerAndNext}
              disabled={selectedAnswer === null || isSubmitting}
              className="px-12 py-5 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card shadow-[0_0_20px_rgba(183,109,255,0.3)] hover:scale-[1.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting
                ? "Synchronizing..."
                : currentIndex === questions.length - 1
                ? "Finalize Mission"
                : "Next Protocol"}
            </button>
         </div>
      </section>

      {/* Footer Status */}
      <div className="flex items-center justify-between px-4">
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
               <span className="font-headline text-[8px] font-semibold text-slate-700 uppercase tracking-widest">Auth_Token</span>
               <span className="font-headline text-[10px] text-slate-500 font-semibold uppercase tracking-tighter truncate w-32">{currentUser?.uid}</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-700">encryption</span>
            <span className="font-headline text-[8px] font-semibold text-slate-700 uppercase tracking-widest">End-to-End Encrypted</span>
         </div>
      </div>
    </main>
  );
};

export default Quiz;