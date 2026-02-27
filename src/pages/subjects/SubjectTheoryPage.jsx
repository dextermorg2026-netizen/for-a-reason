import { useParams, useNavigate } from "react-router-dom";

const SubjectTheoryPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const dummyTheory = {
    dsa: {
      title: "Data Structures",
      content:
        "Data structures are ways of organizing data efficiently...",
    },
    algorithms: {
      title: "Algorithms",
      content:
        "Algorithms are step-by-step procedures for solving problems...",
    },
    dp: {
      title: "Dynamic Programming",
      content:
        "Dynamic Programming is an optimization technique...",
    },
  };

  const subject = dummyTheory[subjectId];

  if (!subject) return <div>Subject not found</div>;

  return (
    <div>
      <h1 className="page-title">
        {subject.title} Theory
      </h1>

      <div
        className="glass-card"
        style={{ marginTop: "40px" }}
      >
        <p style={{ lineHeight: "1.8" }}>
          {subject.content}
        </p>

        <button
          className="btn-primary"
          style={{ marginTop: "30px" }}
          onClick={() =>
            navigate(`/quizzes/${subjectId}`)
          }
        >
          Start {subject.title} Quiz
        </button>
      </div>
    </div>
  );
};

export default SubjectTheoryPage;