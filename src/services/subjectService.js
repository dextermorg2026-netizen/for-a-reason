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

  const subjects = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  // Sort by order field if present
  subjects.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  return subjects;
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

  const topics = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  // Sort topics by order field
  topics.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  return topics;
};

/* ==================================================
   GET SINGLE TOPIC
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

  const subtopics = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  // Sort by order field
  subtopics.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  return subtopics;
};

/* ==================================================
   GET SINGLE SUBTOPIC
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

  const questions = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return questions;
};