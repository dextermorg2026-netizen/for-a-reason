import { createContext, useContext, useState } from "react";

const XPContext = createContext();

export const useXP = () => useContext(XPContext);

export const XPProvider = ({ children }) => {
  const [totalXP, setTotalXP] = useState(0);

  const addXP = (amount) => {
    setTotalXP((prev) => prev + amount);
  };

  const level = Math.floor(totalXP / 100);
  const progress = totalXP % 100;

  return (
    <XPContext.Provider
      value={{
        totalXP,
        level,
        progress,
        addXP,
      }}
    >
      {children}
    </XPContext.Provider>
  );
};