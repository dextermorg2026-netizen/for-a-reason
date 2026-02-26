import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

// Create user document
export const createUserProfile = async (uid, name, email) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      name,
      email,
      totalScore: 0,
      quizzesAttempted: 0,
      createdAt: new Date()
    });
  }
};

// Get user profile
export const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

// Update user stats
export const updateUserStats = async (uid, newScore) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    totalScore: newScore
  });
};