import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment
} from "firebase/firestore";
import { db } from "./firebase";

/* =====================================================
   🔹 CREATE USER PROFILE (Runs on Signup / Google Login)
===================================================== */
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
      totalScore: 0,
      quizzesAttempted: 0,
      streak: 0,
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
   🔹 UPDATE USER QUIZ STATS
   Adds score instead of replacing it
===================================================== */
export const updateUserStats = async (uid, scoreToAdd) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    totalScore: increment(scoreToAdd),
    quizzesAttempted: increment(1)
  });
};

/* =====================================================
   🔹 ADD COINS
   Used by CoinContext when quiz completes
===================================================== */
export const addUserCoins = async (uid, coinsToAdd, subjectId) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    coins: increment(coinsToAdd),
    [`subjectCoins.${subjectId}`]: increment(coinsToAdd)
  });
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