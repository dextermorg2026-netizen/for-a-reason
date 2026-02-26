import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Save quiz attempt
export const saveQuizAttempt = async (data) => {
  await addDoc(collection(db, "quizAttempts"), data);
};

// Get user attempts by topic
export const getUserAttemptsByTopic = async (userId, topicId) => {
  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId),
    where("topicId", "==", topicId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data());
};