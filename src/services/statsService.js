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

/**
 * Optimized: Uses denormalized stats on the user document.
 * Cost: 1 Read (instead of N reads for all attempts).
 */
export const getSkillRating = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) return "B";

    const data = snap.data();
    const totalCorrect = data.totalCorrectAnswers || 0;
    const totalQuestions = data.totalQuestionsAttempted || 0;

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

/**
 * Optimized: Removed full 'questions' collection scan (which cost hundreds of reads).
 * Uses a system constant for level calculation.
 */
export const getLevelData = async (userCoins) => {
  try {
    // Optimization: Hardcoded max coins target to avoid scanning entire DB
    // In a production app, this could be stored in a single 'system_meta' document.
    const maxCoinsEstimate = 5000; 

    const NUMBER_OF_BASE_LEVELS = 10;
    const xpPerLevel = 250; // Every 250 coins = 1 level
    
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