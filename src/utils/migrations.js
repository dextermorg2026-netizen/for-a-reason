import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  increment,
  getDoc,
  setDoc,
  collectionGroup,
  query,
  where
} from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * MIGRATION PROTOCOL 001: Denormalized Stats
 * 
 * Sets up existing users with totalCorrectAnswers and totalQuestionsAttempted
 * by scanning their quizAttempts once.
 */
export const migrateUserStats = async () => {
  console.log("Starting User Stats Migration...");
  const usersSnap = await getDocs(collection(db, "users"));
  
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Skip if already has stats
    if (userData.totalQuestionsAttempted !== undefined) continue;

    console.log(`Migrating user: ${userData.name || userId}`);

    const attemptsSnap = await getDocs(
      query(collection(db, "quizAttempts"), where("userId", "==", userId))
    );

    let totalQuestions = 0;
    let totalCorrect = 0;
    const historyDates = new Set();

    attemptsSnap.forEach(snap => {
      const data = snap.data();
      totalCorrect += data.score || 0;
      totalQuestions += data.questions?.length || 0;
      
      if (data.createdAt) {
        const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        d.setHours(0,0,0,0);
        historyDates.add(d.getTime());
      }
    });

    // Calculate Streak (Simple consecutive day check from today backwards)
    let streak = 0;
    const sortedDates = Array.from(historyDates).sort((a,b) => b - a);
    const now = new Date();
    now.setHours(0,0,0,0);

    if (sortedDates.length > 0) {
      let current = now.getTime();
      let i = 0;
      
      // If no activity today, check if they did something yesterday
      if (sortedDates[0] < current) {
        current -= (1000 * 60 * 60 * 24);
      }

      while (i < sortedDates.length && sortedDates[i] === current) {
        streak++;
        current -= (1000 * 60 * 60 * 24);
        i++;
      }
    }

    await updateDoc(doc(db, "users", userId), {
      totalQuestionsAttempted: totalQuestions,
      totalCorrectAnswers: totalCorrect,
      quizzesAttempted: attemptsSnap.size,
      streak: streak
    });
  }
  console.log("User Stats Migration Complete.");
};

/**
 * MIGRATION PROTOCOL 002: Live History Metadata
 * 
 * Injects 'subject' and 'totalQuestions' into old participation records
 * so the new optimized History listener doesn't need to fetch session meta.
 */
export const migrateLiveHistoryMetadata = async () => {
  console.log("Starting Live History Metadata Migration...");
  
  // Use collectionGroup to find all participant records
  const participantsSnap = await getDocs(collectionGroup(db, "participants"));
  const sessionCache = {};

  for (const pDoc of participantsSnap.docs) {
    const pData = pDoc.data();
    
    // Skip if already denormalized
    if (pData.subject && pData.totalQuestions) continue;

    const parentId = pDoc.ref.parent.parent?.id; // This is the sessionId
    if (!parentId) continue;

    try {
      let sessionMeta = sessionCache[parentId];
      
      if (!sessionMeta) {
        // Check history first
        let sSnap = await getDoc(doc(db, "liveQuizHistory", parentId));
        if (!sSnap.exists()) {
          // Check live quizzes
          sSnap = await getDoc(doc(db, "liveQuizzes", parentId));
        }

        if (sSnap.exists()) {
          sessionMeta = sSnap.data();
          sessionCache[parentId] = sessionMeta;
        }
      }

      if (sessionMeta) {
        await updateDoc(pDoc.ref, {
          subject: sessionMeta.subject || "General",
          totalQuestions: sessionMeta.totalQuestions || 0,
          sessionId: parentId
        });
      }
    } catch (e) {
      console.warn(`Failed to migrate pDoc ${pDoc.id}:`, e.message);
    }
  }
  
  console.log("Live History Metadata Migration Complete.");
};
