import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

// The leaderboard now reads directly from the users collection and
// sorts by coins (or subjectCoins for a particular subject).  This
// keeps leaderboard logic aligned with the coin-based economy and
// avoids recalculating scores from past attempts.

export const getSubjectLeaderboard = async (subjectId) => {
  // NOTE: Ordering by a map field like subjectCoins.[id] requires a dynamic index.
  // We reduce the fetch limit to 40 users to prevent quota exhaustion.
  const q = query(collection(db, "users"), limit(40));
  const snapshot = await getDocs(q);

  const users = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      coins: data?.subjectCoins?.[subjectId] || 0,
      username: data?.name || data?.displayName || "OPERATOR"
    };
  });

  return users.sort((a, b) => b.coins - a.coins).slice(0, 20);
};

export const getGlobalLeaderboard = async () => {
  const q = query(
    collection(db, "users"), 
    orderBy("coins", "desc"), 
    limit(20)
  );
  
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      coins: data?.coins || 0,
      username: data?.name || data?.displayName || "OPERATOR"
    };
  });
};