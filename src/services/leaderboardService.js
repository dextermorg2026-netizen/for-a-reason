import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const getSubjectLeaderboard = async (subjectId) => {
  const q = query(
    collection(db, "quizAttempts"),
    where("subjectId", "==", subjectId)
  );

  const snapshot = await getDocs(q);

  const userScores = {};

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    userScores[data.userId] =
      (userScores[data.userId] || 0) + data.score;
  });

  const leaderboard = Object.entries(userScores)
    .map(([userId, totalScore]) => ({
      userId,
      totalScore
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return leaderboard;
};

export const getGlobalLeaderboard = async () => {
    const snapshot = await getDocs(collection(db, "quizAttempts"));
  
    const userScores = {};
  
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      userScores[data.userId] =
        (userScores[data.userId] || 0) + data.score;
    });
  
    return Object.entries(userScores)
      .map(([userId, totalScore]) => ({
        userId,
        totalScore
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  };