import { collection, query, where, getDocs,orderBy, limit, } from "firebase/firestore";
import { db } from "./firebase";

export const getGlobalScore = async (userId) => {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId)
    );
  
    const snapshot = await getDocs(q);
  
    let totalScore = 0;
  
    snapshot.docs.forEach(doc => {
      totalScore += doc.data().score;
    });
  
    return totalScore;
  };



export const getLastAttemptedSubject = async (userId) => {
  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return {
    subjectId: data.subjectId,
    topicId: data.topicId,
  };
};