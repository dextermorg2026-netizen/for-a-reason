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

  return (
    <div>
      <h1 className="page-title">Quiz</h1>

      <div className="page-card" style={{ marginTop: "2rem" }}>
        <div style={{ width: "80px", marginBottom: "20px" }}>
          <CircularProgressbar
            value={(timeLeft / QUESTION_TIME) * 100}
            text={`${timeLeft}s`}
            styles={buildStyles({
              pathColor: timeLeft <= 5 ? "#ef4444" : "#6366f1",
              textColor: "#fff",
              trailColor: "rgba(255,255,255,0.1)",
            })}
          />
        </div>

        <span className="badge">
          Question {currentIndex + 1} of {questions.length}
        </span>

        <h3 style={{ marginTop: "20px" }}>
          {currentQuestion.question}
        </h3>

        <div style={{ marginTop: "1rem" }}>
          {(currentQuestion.options || []).map((option, index) => (
            <div
              key={index}
              onClick={() => setSelectedAnswer(index)}
              style={{
                padding: "10px",
                border:
                  selectedAnswer === index
                    ? "2px solid #6366f1"
                    : "1px solid #ddd",
                borderRadius: "6px",
                marginBottom: "8px",
                cursor: "pointer",
                background:
                  selectedAnswer === index ? "#eef2ff" : "white",
              }}
            >
              {option}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <button
            className="btn-primary"
            onClick={saveAnswerAndNext}
            disabled={selectedAnswer === null || isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : currentIndex === questions.length - 1
              ? "Finish Quiz"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;