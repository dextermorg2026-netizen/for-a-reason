import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

/* =====================================================
   🔹 CREATE USER PROFILE (Runs on Signup / Google Login)
==================================================== */
export const createUserProfile = async (uid, name, email) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  // If user does NOT exist → create document
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      name: name || "",
      email: email || "",
      coins: 0,
      xp: 0,
      quizzesAttempted: 0,
      totalQuestionsAttempted: 0,
      totalCorrectAnswers: 0,
      streak: 0,
      lastActivityDate: null,
      subjectCoins: {}, // per-subject breakdown
      createdAt: new Date()
    });
  }
};

/* =====================================================
   🔹 GET USER PROFILE
===================================================== */
export const getUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
};

/* =====================================================
   🔹 UPDATE USER STREAK logic
   This is called whenever a user completes a meaningful action (quiz/mission).
==================================================== */
export const updateUserStreak = async (uid) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const data = userSnap.data();
  const now = new Date();
  now.setHours(0,0,0,0);
  
  const lastActivity = data.lastActivityDate ? data.lastActivityDate.toDate() : null;
  if (lastActivity) lastActivity.setHours(0,0,0,0);

  let newStreak = data.streak || 0;

  if (!lastActivity) {
    newStreak = 1;
  } else {
    const diffTime = now.getTime() - lastActivity.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1; // Consecutive day
    } else if (diffDays > 1) {
      newStreak = 1; // Streak broken
    }
    // If diffDays is 0, they already did something today, no change
  }

  await updateDoc(userRef, {
    streak: newStreak,
    lastActivityDate: Timestamp.fromDate(now)
  });
};

/* =====================================================
   🔹 ADD COINS
===================================================== */
export const addUserCoins = async (uid, coinsToAdd, subjectId) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    coins: increment(coinsToAdd),
    [`subjectCoins.${subjectId}`]: increment(coinsToAdd)
  });
};

/* =====================================================
   🔹 UPDATE GLOBAL STATS
===================================================== */
export const updateUserStats = async (uid, questionsCount, correctCount) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    totalQuestionsAttempted: increment(questionsCount),
    totalCorrectAnswers: increment(correctCount),
    quizzesAttempted: increment(1)
  });
  
  // Also trigger streak update
  await updateUserStreak(uid);
};

/* =====================================================
   🔹 ADD XP (Optional for XP system)
===================================================== */
export const addUserXP = async (uid, xpToAdd) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    xp: increment(xpToAdd)
  });
};