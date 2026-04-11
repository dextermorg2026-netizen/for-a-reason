import { createContext, useContext, useState, useEffect } from "react";
import { useCoins } from "./CoinContext";
import { getLevelData } from "../services/statsService";

const XPContext = createContext();

export const useXP = () => useContext(XPContext);

export const XPProvider = ({ children }) => {
  const coinContext = useCoins();
  const coins = coinContext?.coins || 0;
  
  const [levelData, setLevelData] = useState({
    level: 1,
    progress: 0,
    xpToNext: 100,
  });

  useEffect(() => {
    let mounted = true;
    const computeLevel = async () => {
      const data = await getLevelData(coins);
      if (mounted) {
        setLevelData(data);
      }
    };
    computeLevel();
    return () => {
      mounted = false;
    };
  }, [coins]);

  return (
    <XPContext.Provider
      value={{
        totalXP: coins, // treat coins identically to global XP
        level: levelData.level,
        progress: levelData.progress,
        xpToNext: levelData.xpToNext,
        addXP: () => {}, // Deprecated, state naturally relies on CoinContext logic now
      }}
    >
      {children}
    </XPContext.Provider>
  );
};