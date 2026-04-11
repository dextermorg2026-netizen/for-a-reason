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

export const getSkillRating = async (userId) => {
  try {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) return "B";

    let totalQuestions = 0;
    let totalCorrect = 0;
    
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      totalCorrect += data.score || 0;
      totalQuestions += data.questions?.length || 0;
    });

    if (totalQuestions === 0) return "B";

    const accuracy = totalCorrect / totalQuestions;

    if (accuracy >= 0.90) return "A++";
    if (accuracy >= 0.80) return "A+";
    if (accuracy >= 0.65) return "A";
    if (accuracy >= 0.40) return "B+";
    return "B";
  } catch (error) {
    console.error("Error computing skill rating:", error);
    return "B";
  }
};

export const getLevelData = async (userCoins) => {
  try {
    const snap = await getDocs(collection(db, "questions"));
    let maxCoins = 1000; // Safe default
    
    if (!snap.empty) {
      maxCoins = 0;
      snap.forEach((docSnap) => {
        const diff = docSnap.data().difficulty;
        if (diff === "hard") maxCoins += 15;
        else if (diff === "medium") maxCoins += 10;
        else maxCoins += 5;
      });
    }

    const NUMBER_OF_BASE_LEVELS = 10;
    const xpPerLevel = Math.max(10, Math.ceil(maxCoins / NUMBER_OF_BASE_LEVELS));
    
    const currentLevel = Math.floor(userCoins / xpPerLevel) + 1;
    const xpInCurrentLevel = userCoins % xpPerLevel;
    const progressPercent = Math.floor((xpInCurrentLevel / xpPerLevel) * 100);

    return {
      level: currentLevel,
      progress: progressPercent,
      xpToNext: xpPerLevel - xpInCurrentLevel,
      xpPerLevel
    };
  } catch (error) {
    console.error("Error computing level data:", error);
    const xpPerLevel = 100;
    const currentLevel = Math.floor(userCoins / xpPerLevel) + 1;
    const progressPercent = Math.floor(((userCoins % xpPerLevel) / xpPerLevel) * 100);
    return { level: currentLevel, progress: progressPercent, xpToNext: xpPerLevel - (userCoins % xpPerLevel), xpPerLevel };
  }
};