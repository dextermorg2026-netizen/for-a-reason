import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const getQuestionsBySubjectAndDifficulty = async (subjectId, difficulty) => {
  const q = query(
    collection(db, "questions"),
    where("subjectId", "==", subjectId),
    where("difficulty", "==", difficulty)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};