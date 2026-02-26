import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getQuestionsByTopic } from "../../services/subjectService";
import {
  getUserAttemptsByTopic,
  saveQuizAttempt,
} from "../../services/quizAttemptService";

const Quiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [completedAll, setCompletedAll] = useState(false);

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

  if (loading) return <p>Loading...</p>;

  if (completedAll)
    return (
      <div>
        <h2>🎉 You mastered this topic!</h2>
        <button onClick={() => navigate("/subjects")}>
          Back to Subjects
        </button>
      </div>
    );

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (!selectedAnswer) {
      alert("Select an option");
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }));

    setShowResult(true);
  };

  const handleNext = async () => {
    setSelectedAnswer(null);
    setShowResult(false);

    if (currentIndex === questions.length - 1) {
      // Calculate correct & wrong
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
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Question {currentIndex + 1} / {questions.length}
      </h2>

      <h3>{currentQuestion.questionText}</h3>

      {currentQuestion.options.map((option) => (
        <div key={option.id}>
          <label>
            <input
              type="radio"
              disabled={showResult}
              checked={selectedAnswer === option.id}
              onChange={() => setSelectedAnswer(option.id)}
            />
            {option.id}. {option.text}
          </label>
        </div>
      ))}

      {showResult && (
        <div>
          {selectedAnswer === currentQuestion.correctAnswer ? (
            <p style={{ color: "green" }}>You are correct.</p>
          ) : (
            <p style={{ color: "red" }}>
              Not correct. Correct answer:{" "}
              {currentQuestion.correctAnswer}
            </p>
          )}
          <p>
            <strong>Explanation:</strong>{" "}
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      <br />

      {!showResult ? (
        <button onClick={handleSubmit}>Submit</button>
      ) : (
        <button onClick={handleNext}>
          {currentIndex === questions.length - 1
            ? "Finish Quiz"
            : "Next"}
        </button>
      )}
    </div>
  );
};

export default Quiz;