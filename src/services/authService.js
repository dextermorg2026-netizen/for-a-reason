import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";

import { auth } from "./firebase";
import { createUserProfile } from "./userService";

const googleProvider = new GoogleAuthProvider();

// 🔹 EMAIL SIGNUP
export const signupUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await createUserProfile(user.uid, name, email);

  return user;
};

// 🔹 GOOGLE SIGNUP / LOGIN
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Create user profile if first time
  await createUserProfile(user.uid, user.displayName, user.email);

  return user;
};

// 🔹 LOGIN
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

// 🔹 LOGOUT
export const logoutUser = async () => {
  await signOut(auth);
};

// 🔹 AUTH STATE LISTENER
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};