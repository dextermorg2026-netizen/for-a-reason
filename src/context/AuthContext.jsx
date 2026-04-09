import { createContext, useContext, useEffect, useState } from "react";
import {
  signupUser,
  loginUser,
  logoutUser,
  subscribeToAuthChanges,
  signInWithGoogle
} from "../services/authService";
import { getUserProfile } from "../services/userService";

const AuthContext = createContext();

// 🔹 Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};

// 🔹 Provider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (currentUser) {
      await currentUser.reload();
      const updatedUser = { ...currentUser }; // Clone to ensure reference change
      setCurrentUser(updatedUser);
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  const value = {
    currentUser,
    userProfile,
    signupUser,
    loginUser,
    logoutUser,
    signInWithGoogle,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};