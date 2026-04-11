import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function useLeaderboard(subjectId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subjectId) {
      setEntries([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const snapshot = await getDocs(collection(db, "users"));

        const users = snapshot.docs.map((doc) => {
          const data = doc.data();

          const subjectCoins =
            data?.subjectCoins?.[subjectId] ?? 0;

          return {
            id: doc.id,
            name: data?.name || "Unknown",
            photoURL: data?.photoURL || null,
            coins: subjectCoins,
          };
        });

        // 🔥 SORT ONLY (no filtering)
        users.sort((a, b) => b.coins - a.coins);

        const ranked = users.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

        if (!cancelled) setEntries(ranked);
      } catch (err) {
        console.error(err);
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  return { entries, loading };
}

export default useLeaderboard;