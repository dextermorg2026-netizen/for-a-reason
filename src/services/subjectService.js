import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";

/* ==================================================
   GET ALL SUBJECTS
================================================== */

export const getAllSubjects = async () => {
  const snapshot = await getDocs(collection(db, "subjects"));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

/* ==================================================
   GET TOPICS BY SUBJECT
================================================== */

export const getTopicsBySubject = async (subjectId) => {
  const q = query(
    collection(db, "topics"),
    where("subjectId", "==", subjectId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

/* ==================================================
   GET SINGLE TOPIC
   (Used in quiz pages)
================================================== */

export const getTopicById = async (topicId) => {
  const ref = doc(db, "topics", topicId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
};

/* ==================================================
   GET SUBTOPICS BY TOPIC
================================================== */

export const getSubtopicsByTopic = async (topicId) => {
  const q = query(
    collection(db, "subtopics"),
    where("topicId", "==", topicId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};



/* ==================================================
   GET SINGLE SUBTOPIC
   (Used in SubjectTheoryPage)
================================================== */

export const getSubtopicById = async (subtopicId) => {
  const ref = doc(db, "subtopics", subtopicId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
};

/* ==================================================
   GET QUESTIONS BY TOPIC
================================================== */

export const getQuestionsByTopic = async (topicId) => {
  const q = query(
    collection(db, "questions"),
    where("topicId", "==", topicId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};