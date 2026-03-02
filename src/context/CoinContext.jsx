import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const CoinContext = createContext();

export const useCoins = () => useContext(CoinContext);

export const CoinProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [coins, setCoins] = useState(0);

  // ================= LOAD COINS =================
  useEffect(() => {
    const loadCoins = async () => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setCoins(userSnap.data().coins ?? 0);
      } else {
        await setDoc(
          userRef,
          {
            coins: 0,
            subjectCoins: {},
          },
          { merge: true }
        );
        setCoins(0);
      }
    };

    loadCoins();
  }, [currentUser]);

  // ================= ADD COINS =================
  const addCoins = async (amount, subjectId) => {
    if (!currentUser || amount <= 0 || !subjectId) return;

    const userRef = doc(db, "users", currentUser.uid);

    // 🔥 Update BOTH global + subject coins
    await updateDoc(userRef, {
      coins: increment(amount),
      [`subjectCoins.${subjectId}`]: increment(amount),
    });

    // Instant UI update
    setCoins((prev) => prev + amount);
  };

  return (
    <CoinContext.Provider value={{ coins, addCoins }}>
      {children}
    </CoinContext.Provider>
  );
};