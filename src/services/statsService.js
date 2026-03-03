import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// -----------------------------------------------------
// Coins-based statistics (previously called "score")
// -----------------------------------------------------

/**
 * Returns the total number of coins a user has earned.
 * This reads the `coins` field on the user document, which
 * is maintained via `addUserCoins` during quiz completion.
 */
export const getGlobalCoins = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data().coins || 0 : 0;
};

// Deprecated helper – kept for backwards compatibility only
// (not used anywhere in the codebase).
export const getGlobalScore = getGlobalCoins;



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