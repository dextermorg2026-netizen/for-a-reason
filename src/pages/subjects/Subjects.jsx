import { useEffect, useState } from "react";
import { getAllSubjects } from "../../services/subjectService";
import { useNavigate } from "react-router-dom";

const Subjects = () => {
  const [subjects, setSubjects] = useState([{id:1,title:"Subject 1",description:"Description 1",topicCount:10},{id:2,title:"Subject 2",description:"Description 2",topicCount:20},{id:3,title:"Subject 3",description:"Description 3",topicCount:30}]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchSubjects = async () => {
  //     try {
  //       const data = await getAllSubjects();
  //       setSubjects(data);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };


  //   fetchSubjects();
  // }, []);



  // if (loading) return <p>Loading subjects...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Subjects</h1>

      {subjects.map(subject => (
        <div
          key={subject.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
          onClick={() =>
            navigate(`/subjects/${subject.id}/topics`)
          }
        >
          <h3>{subject.title}</h3>
          <p>{subject.description}</p>
          <small>Topics: {subject.topicCount}</small>
        </div>
      ))}
    </div>
  );
};

export default Subjects;