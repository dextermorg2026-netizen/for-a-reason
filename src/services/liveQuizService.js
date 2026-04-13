import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
  updateDoc,
  increment,
  query,
  orderBy,
  where,
  collectionGroup,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { updateUserStats } from "./userService";

// ==============================
// 🔹 JOIN PARTICIPANT
// ==============================
export const joinParticipant = async ({
  sessionId,
  userId,
  username,
}) => {
  const ref = doc(
    db,
    "liveQuizzes",
    sessionId,
    "participants",
    userId
  );

  const sessionSnap = await getDoc(doc(db, "liveQuizzes", sessionId));
  const sessionData = sessionSnap.data();

  // If already playing, start the timer immediately for this user
  const startedAt = sessionData?.status === "playing" ? Date.now() : null;

  await setDoc(
    ref,
    {
      userId,
      username,
      joinedAt: Date.now(),
      startedAt,
      answers: {},
      score: 0,
      coins: 0,
      finished: false,
      // Denormalized for History (Reduces Reads)
      subject: sessionData?.subject || "General",
      totalQuestions: sessionData?.totalQuestions || 0,
      sessionId
    },
    { merge: true }
  );
};

// ==============================
// 🔹 RECORD START TIME (USER ENTERED EXAM)
// ==============================
export const recordParticipantStartTime = async (sessionId, userId) => {
  try {
    const ref = doc(db, "liveQuizzes", sessionId, "participants", userId);
    const snap = await getDoc(ref);
    if (snap.exists() && !snap.data().startedAt) {
      await updateDoc(ref, { startedAt: Date.now() });
    }
  } catch (err) {
    console.warn("[liveQuizService] Failed to record start time:", err.message);
  }
};

// ==============================
// 🔹 GET SESSION DATA
// ==============================
export const getLiveQuizSession = async (sessionId) => {
  if (!sessionId) return null;
  const snap = await getDoc(doc(db, "liveQuizzes", sessionId));
  if (snap.exists()) return snap.data();

  // ✅ Fallback to history if not found in active sessions
  const historySnap = await getDoc(doc(db, "liveQuizHistory", sessionId));
  return historySnap.exists() ? historySnap.data() : null;
};

// ==============================
// 🔹 SUBSCRIBE SESSION
// ==============================
export const subscribeToLiveQuiz = (sessionId, callback) => { if (!sessionId) return () => {};
  const sessionRef = doc(db, "liveQuizzes", sessionId);

  return onSnapshot(sessionRef, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
};

// ==============================
// 🔹 SUBSCRIBE PARTICIPANT
// ==============================
export const subscribeToParticipant = (sessionId, userId, callback) => {
  if (!sessionId || !userId) return () => {};
  const ref = doc(db, "liveQuizzes", sessionId, "participants", userId);

  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
};

// ==============================
// 🔹 GET QUESTIONS
// ==============================
export const getLiveQuizQuestions = async (sessionId) => {
  if (!sessionId) return [];
  const snap = await getDocs(
    collection(db, "liveQuizzes", sessionId, "questions")
  );

  if (!snap.empty) {
    const questions = [];
    snap.forEach((docSnap) => {
      const index = parseInt(docSnap.id);
      questions[index] = docSnap.data();
    });
    return questions;
  }

  // ✅ Fallback to history
  return getHistoryQuestions(sessionId);
};

// ==============================
// 🔹 AUTO SAVE ANSWER
// ==============================
export const submitLiveAnswer = async ({
  sessionId,
  userId,
  questionIndex,
  selectedOptionIndex,
}) => {
  try {
    const ref = doc(
      db,
      "liveQuizzes",
      sessionId,
      "participants",
      userId
    );

    await updateDoc(ref, {
      [`answers.${questionIndex}`]: selectedOptionIndex,
    });
  } catch (err) {
    console.warn("[liveQuizService] Failed to submit answer:", err.message);
  }
};

// ==============================
// 🔹 UPDATE CURRENT INDEX
// ==============================
export const updateParticipantIndex = async (sessionId, userId, index) => {
  // Optimization: Removed high-frequency write to stop read-multiplier on leaderboard
  return;
};

// ==============================
// 🔹 START QUIZ (HOST)
// ==============================
export const startLiveQuiz = async (sessionId) => {
  try {
    const ref = doc(db, "liveQuizzes", sessionId);

    await updateDoc(ref, {
      status: "playing",
      startTime: Date.now()
    });
  } catch (err) {
    console.error("[liveQuizService] Failed to start quiz:", err.message);
    throw err;
  }
};

// ==============================
// 🔹 FINISH QUIZ (HOST)
// ==============================
export const finishLiveQuiz = async (sessionId) => {
  try {
    const ref = doc(db, "liveQuizzes", sessionId);

    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const session = snap.data();

    await updateDoc(ref, {
      status: "finished",
    });

    // ✅ STORE QUIZ HISTORY META
    await setDoc(
      doc(db, "liveQuizHistory", sessionId),
      {
        subject: session?.subject || "General",
        id: sessionId,
        date: Date.now(),
        totalQuestions: session?.totalQuestions || 0,
      },
      { merge: true }
    );

    // ✅ ARCHIVE QUESTIONS
    const qSnap = await getDocs(collection(db, "liveQuizzes", sessionId, "questions"));
    for (const qDoc of qSnap.docs) {
      await setDoc(
        doc(db, "liveQuizHistory", sessionId, "questions", qDoc.id),
        qDoc.data()
      );
    }
  } catch (err) {
    console.error("[liveQuizService] Failed to finish quiz:", err.message);
    throw err;
  }
};

// ==============================
// 🔹 CALCULATE SCORE + COINS + HISTORY
// ==============================
export const calculateScore = async (sessionId, userId, clientAnswers = null) => {
  try {
    const qSnap = await getDocs(
      collection(db, "liveQuizzes", sessionId, "questions")
    );

    const questions = {};
    qSnap.forEach((docSnap) => {
      questions[docSnap.id] = docSnap.data();
    });

    const userRef = doc(
      db,
      "liveQuizzes",
      sessionId,
      "participants",
      userId
    );

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return 0;

    const userData = userSnap.data();
    
    // ✅ PREVENT REDUNDANT SCORE / COINS
    if (userData.finished) {
      console.warn("[liveQuizService] Participant already finalized. Skipping calculation.");
      return userData.score || 0;
    }

    // Use passed answers if available (Final Sync mode), otherwise fallback to DB
    const answers = clientAnswers || userData.answers || {};

    let score = 0;
    Object.keys(answers).forEach((qIndex) => {
      if (questions[qIndex]?.correctAnswer === answers[qIndex]) {
        score++;
      }
    });

    const coinsEarned = score * 2;

    // ✅ UPDATE PARTICIPANT (ONE SINGLE BATCH SAVE)
    await updateDoc(userRef, {
      score,
      coins: coinsEarned,
      finished: true,
      submittedAt: Date.now(),
      answers, // Save the full answer map now
    });

    // ✅ UPDATE USER ASSETS & STATS
    await updateUserStats(userId, Object.keys(questions).length, score);
    
    const userDoc = doc(db, "users", userId);
    await setDoc(
      userDoc,
      {
        coins: increment(coinsEarned),
      },
      { merge: true }
    );

    // ✅ STORE HISTORY
    const sessionRef = doc(db, "liveQuizzes", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    const sessionData = sessionSnap.data();
    const isAnalysis = sessionData?.type === "analysis";

    if (Object.keys(answers).length > 0 || isAnalysis) {
      const histRef = doc(db, "liveQuizHistory", sessionId);
      await setDoc(histRef, {
        subject: sessionData?.subject || "General",
        id: sessionId,
        date: Date.now(),
        totalQuestions: Object.keys(questions).length,
        updatedAt: Date.now() 
      }, { merge: true });

      await setDoc(
        doc(db, "liveQuizHistory", sessionId, "participants", userId),
        {
          userId,
          sessionId,
          subject: sessionData?.subject || "General",
          username: userData.username,
          score,
          totalQuestions: Object.keys(questions).length,
          answers,
          coins: coinsEarned,
          submittedAt: Date.now(),
          date: sessionData?.date || Date.now()
        }
      );
    }

    return score;
  } catch (err) {
    console.error("[liveQuizService] Failed to calculate and sync score:", err.message);
    return 0;
  }
};

// ==============================
// 🔹 REALTIME LEADERBOARD
// ==============================
export const subscribeToLeaderboard = (sessionId, callback) => {
  const ref = collection(
    db,
    "liveQuizzes",
    sessionId,
    "participants"
  );
  const q = query(
    ref,
    orderBy("score", "desc"),
    limit(20)
  );

  return onSnapshot(q, (snap) => {
    const users = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();

      users.push({
        userId: docSnap.id,
        username: data.username || "Anonymous",
        score: data.score || 0,
        coins: data.coins || 0,
        submittedAt: data.submittedAt || Infinity,
      });
    });

    // ✅ SORT: score → time
    users.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.submittedAt - b.submittedAt;
    });

    callback(users);
  });
};

// ==============================
// 🔹 CREATE LIVE QUIZ (ADMIN)
// ==============================
export const createLiveQuiz = async (
  roomCode,
  questions,
  subject = "General",
  durationInSeconds = 1200,
  type = "competitive"
) => {
  const ref = doc(db, "liveQuizzes", roomCode);

  // Set the main session document
  await setDoc(ref, {
    status: "waiting", // waiting for host to start
    subject,
    totalQuestions: questions.length,
    duration: durationInSeconds,
    type,
    createdAt: Date.now(),
  });

  // Write each question
  for (let i = 0; i < questions.length; i++) {
    const qRef = doc(db, "liveQuizzes", roomCode, "questions", i.toString());
    await setDoc(qRef, questions[i]);
  }
};

export const getParticipant = async (sessionId, userId) => {
  if (!sessionId || !userId) return null;
  // Try Live (Active) first
  let ref = doc(db, 'liveQuizzes', sessionId, 'participants', userId);
  let snap = await getDoc(ref);
  
  if (!snap.exists()) {
    // Try History (Archive)
    ref = doc(db, 'liveQuizHistory', sessionId, 'participants', userId);
    snap = await getDoc(ref);
  }
  
  return snap.exists() ? snap.data() : null;
};



// ==============================
// ?? GET ALL PAST SESSIONS
// ==============================
export const getAllPastSessions = async () => {
  const q = query(
    collection(db, "liveQuizHistory"),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==============================
// ?? GET PAST LEADERBOARD 
// ==============================
export const getPastLeaderboard = async (sessionId) => {
  if (!sessionId) return [];
  const ref = collection(db, "liveQuizHistory", sessionId, "participants");
  const q = query(ref, orderBy("score", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ userId: doc.id, ...doc.data() }));
};

// ==============================
// 🔹 SUBSCRIBE TO MY LIVE HISTORY (REAL-TIME)
// ==============================
const sessionCache = {};

export const subscribeToMyLiveHistory = (userId, callback) => {
  if (!userId) return () => {};

  const q = query(
    collectionGroup(db, "participants"),
    where("userId", "==", userId),
    where("submittedAt", ">", 0), 
    orderBy("submittedAt", "desc")
  );

  return onSnapshot(q, async (snap) => {
    const uniqueResults = [];
    const seenSessions = new Set();

    snap.docs.forEach(pDoc => {
      const pData = pDoc.data();
      const sessionId = pData.sessionId || pDoc.ref.parent.parent?.id;
      
      if (!sessionId || seenSessions.has(sessionId)) return;

      uniqueResults.push({
        id: sessionId,
        subject: pData.subject || "General Assessment",
        date: pData.submittedAt || Date.now(),
        totalQuestions: pData.totalQuestions || 0,
        participation: pData
      });
      seenSessions.add(sessionId);
    });
    
    callback(uniqueResults);
  });
};

// ==============================
// 🔹 GET HISTORY QUESTIONS
// ==============================
export const getHistoryQuestions = async (sessionId) => {
  if (!sessionId) return [];
  try {
    const snap = await getDocs(collection(db, "liveQuizHistory", sessionId, "questions"));
    const questions = [];
    snap.forEach((docSnap) => {
      const index = parseInt(docSnap.id);
      questions[index] = docSnap.data();
    });
    return questions;
  } catch (err) {
    console.error("[liveQuizService] Failed to get history questions:", err.message);
    return [];
  }
};
