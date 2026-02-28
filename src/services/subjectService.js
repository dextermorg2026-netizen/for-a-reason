import { 
  collection, 
  getDocs, 
  getDoc,
  query, 
  where,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";

// Fetch all subjects
export const getAllSubjects = async () => {
  const snapshot = await getDocs(collection(db, "subjects"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getTopicsBySubject = async (subjectId) => {
  const q = query(
    collection(db, "topics"),
    where("subjectId", "==", subjectId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getQuestionsByTopic = async (topicId) => {
  const q = query(
    collection(db, "questions"),
    where("topicId", "==", topicId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getTopicById = async (topicId) => {
  const ref = doc(db, "topics", topicId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
};