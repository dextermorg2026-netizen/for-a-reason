import React, { createContext, useContext, useState, useEffect } from 'react';
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../services/firebase";

const LiveOpsContext = createContext();

export const LiveOpsProvider = ({ children }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [liveCode, setLiveCode] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "liveQuizzes"), 
      where("status", "==", "playing")
    );

    const unsub = onSnapshot(q, (snap) => {
      const active = snap.docs.map(doc => ({
        code: doc.id,
        id: doc.id,
        type: doc.data().type || 'competitive',
        subject: doc.data().subject || 'General'
      }));
      
      setActiveSessions(active);
      setIsLive(active.length > 0);
      setLiveCode(active.length > 0 ? active[0].code : "");
    });

    return () => unsub();
  }, []);

  return (
    <LiveOpsContext.Provider value={{ activeSessions, isLive, liveCode }}>
      {children}
    </LiveOpsContext.Provider>
  );
};

export const useLiveOps = () => {
  const context = useContext(LiveOpsContext);
  if (!context) {
    throw new Error('useLiveOps must be used within a LiveOpsProvider');
  }
  return context;
};
