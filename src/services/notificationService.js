import { collection, addDoc, onSnapshot, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "./firebase";

// ==============================
// 🔹 CREATE GLOBAL NOTIFICATION
// ==============================
export const createGlobalNotification = async (title, message, code) => {
  await addDoc(collection(db, "notifications"), {
    title,
    message,
    code,
    type: "live_quiz",
    createdAt: Date.now()
  });
};

// ==============================
// 🔹 SUBSCRIBE TO SURFACED NOTIFICATIONS
// ==============================
export const subscribeToNotifications = (callback) => {
  // Listen to recent notifications (e.g. within the last 5 minutes)
  const recentTime = Date.now() - 5 * 60 * 1000;
  
  const q = query(
    collection(db, "notifications"),
    where("createdAt", ">", recentTime),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const doc = snap.docs[0];
      callback({ id: doc.id, ...doc.data() });
    }
  });
};
