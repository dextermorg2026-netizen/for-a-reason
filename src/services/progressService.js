import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const getTopicProgress = async (userId, topicId) => {
  try {
    // Get total questions in topic
    const questionsSnapshot = await getDocs(
      query(
        collection(db, "questions"),
        where("topicId", "==", topicId)
      )
    );

    const totalQuestions = questionsSnapshot.size;

    // Get all attempts by user for topic
    const attemptsSnapshot = await getDocs(
      query(
        collection(db, "quizAttempts"),
        where("userId", "==", userId),
        where("topicId", "==", topicId)
      )
    );

    const attempts = attemptsSnapshot.docs.map(doc => doc.data());

    const allCorrect = attempts.flatMap(
      a => a.correctQuestionIds || []
    );

    const allWrong = attempts.flatMap(
      a => a.wrongQuestionIds || []
    );

    const uniqueCorrect = [...new Set(allCorrect)];

    const masteredCount = uniqueCorrect.length;

    const totalAttempted = allCorrect.length + allWrong.length;
    const totalCorrect = allCorrect.length;

    const masteryPercent =
      totalQuestions === 0
        ? 0
        : Math.round((masteredCount / totalQuestions) * 100);

    const accuracyPercent =
      totalAttempted === 0
        ? 0
        : Math.round((totalCorrect / totalAttempted) * 100);

    return {
      totalQuestions,
      masteredCount,
      masteryPercent,
      accuracyPercent,
    };
  } catch (error) {
    console.error("Progress error:", error);
    return {
      totalQuestions: 0,
      masteredCount: 0,
      masteryPercent: 0,
      accuracyPercent: 0,
    };
  }
};