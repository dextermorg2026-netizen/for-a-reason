import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
export const getUserStreak = async (userId) => {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId)
    );
  
    const snapshot = await getDocs(q);
  
    const dates = snapshot.docs.map(doc =>
      doc.data().createdAt.toDate().toDateString()
    );
  
    const uniqueDates = [...new Set(dates)]
      .map(date => new Date(date))
      .sort((a, b) => b - a);
  
    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
  
    for (let i = 0; i < uniqueDates.length; i++) {
      const diff =
        (today - uniqueDates[i]) / (1000 * 60 * 60 * 24);
  
      if (diff === streak) {
        streak++;
      } else {
        break;
      }
    }
  
    return streak;
  };

  export const getLast28DaysActivity = async (userId) => {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId)
    );
  
    const snapshot = await getDocs(q);
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 27);
  
    const activityMap = {};
  
    // Initialize all 28 days with 0
    for (let i = 0; i < 28; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      activityMap[d.toDateString()] = 0;
    }
  
    snapshot.docs.forEach((doc) => {
      const date = doc.data().createdAt.toDate();
      date.setHours(0, 0, 0, 0);
  
      if (date >= startDate) {
        const key = date.toDateString();
        if (activityMap[key] !== undefined) {
          activityMap[key]++;
        }
      }
    });
  
    return Object.entries(activityMap).map(([date, count]) => ({
      date,
      count,
    }));
  };

  export const getWeeklyStats = async (userId) => {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId)
    );
  
    const snapshot = await getDocs(q);
  
    const now = new Date();
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(now.getDate() - 28);
  
    const weeklyData = [0, 0, 0, 0];
  
    snapshot.docs.forEach(doc => {
      const date = doc.data().createdAt.toDate();
  
      if (date >= fourWeeksAgo) {
        const diffDays =
          (now - date) / (1000 * 60 * 60 * 24);
  
        const weekIndex = Math.floor(diffDays / 7);
  
        if (weekIndex < 4) {
          weeklyData[weekIndex]++;
        }
      }
    });
  
    return weeklyData.reverse(); // oldest → newest
  };

  /** Current week only: 7 days (Mon–Sun), each value = questions attempted that day */
  export const getCurrentWeekStats = async (userId) => {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysSinceMonday = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt;
      const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
      date.setHours(0, 0, 0, 0);

      const diffDays = (date - monday) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays < 7) {
        const dayIndex = Math.floor(diffDays);
        const correct = (data.correctQuestionIds || []).length;
        const wrong = (data.wrongQuestionIds || []).length;
        dayCounts[dayIndex] += correct + wrong;
      }
    });

    return dayNames.map((name, i) => ({ day: name, questions: dayCounts[i] }));
  };