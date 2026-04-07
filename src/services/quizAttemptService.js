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
    where("difficulty", "==", difficulty)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Sort by most recent attempt
  docs.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });

  return docs[0];
};

/* ================= GET ALL PREVIOUSLY CORRECT IDs ================= */
export const getPreviouslyCorrectQuestionIds = async (userId, subjectId, difficulty) => {
  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId),
    where("subjectId", "==", subjectId),
    where("difficulty", "==", difficulty)
  );

  const snapshot = await getDocs(q);
  const correctIds = new Set();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.correctQuestionIds && Array.isArray(data.correctQuestionIds)) {
      data.correctQuestionIds.forEach(id => correctIds.add(id));
    }
  });

  return Array.from(correctIds);
};