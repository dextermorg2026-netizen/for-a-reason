import { collection, addDoc, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "./firebase";

/* ================= SAVE QUIZ ATTEMPT ================= */

export const saveQuizAttempt = async (data) => {
  await addDoc(collection(db, "quizAttempts"), data);
};

/* ================= GET ATTEMPTS BY TOPIC (OLD SYSTEM) ================= */

export const getUserAttemptsByTopic = async (userId, topicId) => {
  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId),
    where("topicId", "==", topicId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ================= NEW FUNCTION ================= */
/* Used to block retakes of subject quiz */

export const getUserQuizAttempt = async (userId, subjectId, difficulty) => {
  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId),
    where("subjectId", "==", subjectId),
    where("difficulty", "==", difficulty),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  };
};