import { collection, query, where, getDocs } from "firebase/firestore";
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