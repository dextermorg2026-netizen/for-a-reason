import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getQuestionsByTopic } from "../../services/subjectService";
import {
  getUserAttemptsByTopic,
  saveQuizAttempt,
} from "../../services/quizAttemptService";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const QUESTION_TIME = 15;

const Quiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [completedAll, setCompletedAll] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [showReviewScreen, setShowReviewScreen] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const allQuestions = await getQuestionsByTopic(topicId);

        const previousAttempts = await getUserAttemptsByTopic(
          currentUser.uid,
          topicId
        );

        const correctIds = previousAttempts.flatMap(
          (attempt) => attempt.correctQuestionIds || []
        );

        const available = allQuestions.filter(
          (q) => !correctIds.includes(q.id)
        );

        if (available.length === 0) {
          setCompletedAll(true);
          setLoading(false);
          return;
        }

        const shuffled = available.sort(() => 0.5 - Math.random());
        const limited =
          shuffled.length >= 5
            ? shuffled.slice(0, 5)
            : shuffled;

        setQuestions(limited);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchQuestions();
  }, [topicId, currentUser]);

  // ================= TIMER =================
  useEffect(() => {
    if (!questions.length) return;

    if (timeLeft === 0) {
      handleNext();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, questions]);

  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
  }, [currentIndex]);

  if (loading) return <p className="muted">Loading quiz...</p>;

  if (completedAll) {
    return (
      <div>
        <h1 className="page-title">Topic Mastered 🎉</h1>
        <div className="page-card" style={{ marginTop: "2rem" }}>
          <p>You have answered all questions correctly.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/subjects")}
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }));
  };

  const handleNext = () => {
    setSelectedAnswer(null);

    if (currentIndex === questions.length - 1) {
      setShowReviewScreen(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinalSubmit = async () => {
    const correctIds = [];
    const wrongIds = [];

    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctIds.push(q.id);
      } else {
        wrongIds.push(q.id);
      }
    });

    const score = correctIds.length;

    await saveQuizAttempt({
      userId: currentUser.uid,
      topicId,
      correctQuestionIds: correctIds,
      wrongQuestionIds: wrongIds,
      score,
      createdAt: new Date(),
    });

    navigate("/quiz/result", {
      state: {
        score,
        total: questions.length,
      },
      replace: true,
    });
  };

  // ================= REVIEW SCREEN =================
  if (showReviewScreen) {
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    return (
      <div>
        <h1 className="page-title">Review Your Answers</h1>

        <div className="page-card" style={{ marginTop: "2rem" }}>
          <p>Total Questions: {questions.length}</p>
          <p>Answered: {answeredCount}</p>
          <p>Unanswered: {unansweredCount}</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            {questions.map((q, index) => (
              <div
                key={q.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowReviewScreen(false);
                }}
                style={{
                  padding: "10px",
                  textAlign: "center",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: answers[q.id]
                    ? "#6366f1"
                    : "#e5e7eb",
                  color: answers[q.id] ? "white" : "black",
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "30px" }}>
            <button
              className="btn-secondary"
              style={{ marginRight: "10px" }}
              onClick={() => setShowReviewScreen(false)}
            >
              Back to Quiz
            </button>

            <button
              className="btn-primary"
              onClick={handleFinalSubmit}
            >
              Submit Final
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(
    ((currentIndex + 1) / questions.length) * 100
  );

  return (
    <div>
      <h1 className="page-title">Topic Quiz</h1>

      <div className="page-card" style={{ marginTop: "2rem" }}>
        {/* TIMER */}
        <div style={{ width: "80px", marginBottom: "20px" }}>
          <CircularProgressbar
            value={(timeLeft / QUESTION_TIME) * 100}
            text={`${timeLeft}s`}
            styles={buildStyles({
              pathColor:
                timeLeft <= 5 ? "#ef4444" : "#6366f1",
              textColor: "#fff",
              trailColor: "rgba(255,255,255,0.1)",
            })}
          />
        </div>

        <span className="badge">
          Question {currentIndex + 1} of {questions.length}
        </span>

        <h3 style={{ marginTop: "20px" }}>
          {currentQuestion.questionText}
        </h3>

        <div style={{ marginTop: "1rem" }}>
          {currentQuestion.options.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedAnswer(option.id)}
              style={{
                padding: "10px",
                border:
                  selectedAnswer === option.id
                    ? "2px solid #6366f1"
                    : "1px solid #ddd",
                borderRadius: "6px",
                marginBottom: "8px",
                cursor: "pointer",
                background:
                  selectedAnswer === option.id
                    ? "#eef2ff"
                    : "white",
              }}
            >
              {option.id}. {option.text}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <button
            className="btn-primary"
            onClick={() => {
              handleSubmit();
              handleNext();
            }}
            disabled={!selectedAnswer}
          >
            {currentIndex === questions.length - 1
              ? "Review Answers"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;