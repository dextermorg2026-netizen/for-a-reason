import { useParams } from "react-router-dom";

const SubjectQuizPage = () => {
  const { subjectId } = useParams();

  const dummyQuizzes = {
    dsa: ["Arrays Quiz", "Stacks Quiz", "Queues Quiz"],
    algorithms: [
      "Sorting Quiz",
      "Searching Quiz",
    ],
    dp: [
      "Knapsack Quiz",
      "LIS Quiz",
    ],
  };

  const quizzes = dummyQuizzes[subjectId];

  if (!quizzes) return <div>No quizzes found</div>;

  return (
    <div>
      <h1 className="page-title">
        {subjectId.toUpperCase()} Quizzes
      </h1>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gap: "20px",
        }}
      >
        {quizzes.map((quiz, index) => (
          <div
            key={index}
            className="glass-card"
          >
            <h3>{quiz}</h3>
            <button
              className="btn-primary"
              style={{ marginTop: "15px" }}
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectQuizPage;