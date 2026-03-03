import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// The leaderboard now reads directly from the users collection and
// sorts by coins (or subjectCoins for a particular subject).  This
// keeps leaderboard logic aligned with the coin-based economy and
// avoids recalculating scores from past attempts.

export const getSubjectLeaderboard = async (subjectId) => {
  const snapshot = await getDocs(collection(db, "users"));

  const users = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      coins: data?.subjectCoins?.[subjectId] || 0,
    };
  });

  return users.sort((a, b) => b.coins - a.coins);
};

export const getGlobalLeaderboard = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  const users = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      coins: data?.coins || 0,
    };
  });

  return users.sort((a, b) => b.coins - a.coins);
};