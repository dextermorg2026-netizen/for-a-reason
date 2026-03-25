import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

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

  await setDoc(
    ref,
    {
      username,
      joinedAt: Date.now(),
      answers: {},
      score: 0,
      coins: 0,
      finished: false,
    },
    { merge: true }
  );
};

// ==============================
// 🔹 GET SESSION DATA
// ==============================
export const getLiveQuizSession = async (sessionId) => { if (!sessionId) return null;
  const snap = await getDoc(doc(db, "liveQuizzes", sessionId));
  return snap.exists() ? snap.data() : null;
};

// ==============================
// 🔹 SUBSCRIBE SESSION
// ==============================
export const subscribeToLiveQuiz = (sessionId, callback) => { if (!sessionId) return () => {};
  const sessionRef = doc(db, "liveQuizzes", sessionId);

  return onSnapshot(sessionRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
};

// ==============================
// 🔹 GET QUESTIONS
// ==============================
export const getLiveQuizQuestions = async (sessionId) => { if (!sessionId) return [];
  const snap = await getDocs(
    collection(db, "liveQuizzes", sessionId, "questions")
  );

  const questions = [];

  snap.forEach((docSnap) => {
    const index = parseInt(docSnap.id);
    questions[index] = docSnap.data();
  });

  return questions;
};

// ==============================
// 🔹 AUTO SAVE ANSWER
// ==============================
export const submitLiveAnswer = async ({ sessionId, userId,
  sessionId,
  userId,
  questionIndex,
  selectedOptionIndex,
}) => {
  const ref = doc(
    db,
    "liveQuizzes",
    sessionId,
    "participants",
    userId
  );

  await updateDoc(ref, {
    [`answers.${questionIndex}`]: selectedOptionIndex,
    updatedAt: Date.now(),
  });
};

// ==============================
// 🔹 START QUIZ (HOST)
// ==============================
export const startLiveQuiz = async (
  sessionId,
  durationInSeconds = 1200
) => {
  const ref = doc(db, "liveQuizzes", sessionId);

  const startTime = Date.now();
  const endTime = startTime + durationInSeconds * 1000;

  await updateDoc(ref, {
    status: "playing",
    startTime,
    endTime,
  });
};

// ==============================
// 🔹 FINISH QUIZ (HOST)
// ==============================
export const finishLiveQuiz = async (sessionId) => {
  const ref = doc(db, "liveQuizzes", sessionId);

  const snap = await getDoc(ref);
  const session = snap.data();

  await updateDoc(ref, {
    status: "finished",
  });

  // ✅ STORE QUIZ HISTORY META
  await setDoc(
    doc(db, "liveQuizHistory", sessionId),
    {
      subject: session?.subject || "General",
      date: Date.now(),
      totalQuestions: session?.totalQuestions || 0,
    },
    { merge: true }
  );
};

// ==============================
// 🔹 CALCULATE SCORE + COINS + HISTORY
// ==============================
export const calculateScore = async (sessionId, userId) => {
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
  const answers = userData.answers || {};

  let score = 0;

  Object.keys(answers).forEach((qIndex) => {
    if (questions[qIndex]?.correctAnswer === answers[qIndex]) {
      score++;
    }
  });

  const coinsEarned = score * 20;

  // ✅ UPDATE PARTICIPANT
  await updateDoc(userRef, {
    score,
    coins: coinsEarned,
    finished: true,
    submittedAt: Date.now(),
  });

  // ✅ ADD COINS TO USER PROFILE
  const userDoc = doc(db, "users", userId);
  await setDoc(
    userDoc,
    {
      coins: increment(coinsEarned),
    },
    { merge: true }
  );

  // ✅ STORE HISTORY (ONLY IF ATTEMPTED)
  if (Object.keys(answers).length > 0) {
    await setDoc(
      doc(
        db,
        "liveQuizHistory",
        sessionId,
        "participants",
        userId
      ),
      {
        username: userData.username,
        score,
        coins: coinsEarned,
        submittedAt: Date.now(),
      }
    );
  }

  return score;
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

  return onSnapshot(ref, (snap) => {
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
export const createLiveQuiz = async (roomCode, questions, subject = "General", durationInSeconds = 1200) => {
  const ref = doc(db, "liveQuizzes", roomCode);

  // Set the main session document
  await setDoc(ref, {
    status: "waiting", // waiting for host to start
    subject,
    totalQuestions: questions.length,
    duration: durationInSeconds,
    createdAt: Date.now()
  });

  // Write each question
  for (let i = 0; i < questions.length; i++) {
    const qRef = doc(db, "liveQuizzes", roomCode, "questions", i.toString());
    await setDoc(qRef, questions[i]);
  }
};

// ==============================
// ?? GET PARTICIPANT
// ==============================
export const getParticipant = async (sessionId, userId) => { if (!sessionId || !userId) return null;
  const ref = doc(db, 'liveQuizzes', sessionId, 'participants', userId);
  const snap = await getDoc(ref);
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
