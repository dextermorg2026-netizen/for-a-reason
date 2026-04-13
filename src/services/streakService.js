import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * UNIFIED DASHBOARD ACTIVITY FETCH
 * Fetches quizAttempts for the last 30 days ONCE and calculates all dashboard metrics.
 * Reduces 4 queries -> 1 query.
 */
export const getDashboardActivityData = async (userId) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0,0,0,0);

    // Safer query: Equality on userId + OrderBy. 
    // This uses the most common index pattern and avoids range index errors.
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(150) // More than enough for one month of dashboard history
    );

    const snapshot = await getDocs(q);
    const allRecentAttempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter for 30 days in memory to avoid needing a complex range index
    const attempts = allRecentAttempts.filter(d => {
      const date = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
      return date >= thirtyDaysAgo;
    });

    return {
      last28: calculateLast28(attempts, now),
      weekly: calculateWeekly(attempts, now),
      currentWeek: calculateCurrentWeek(attempts, now),
      totalCount: allRecentAttempts.length // Reliable recent total for achievements
    };
  } catch (error) {
    console.error("Error fetching dashboard activity:", error);
    // Robust fallback: Return early with zeroed data rather than crashing
    return { 
      last28: Array(28).fill(0).map((_, i) => ({ date: i, count: 0 })),
      weekly: [0, 0, 0, 0], 
      currentWeek: [],
      totalCount: 0
    };
  }
};

/** Helpers to process data in memory **/

function calculateLast28(attempts, now) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 27);

  const activityMap = {};
  for (let i = 0; i < 28; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    activityMap[d.toDateString()] = 0;
  }

  attempts.forEach((data) => {
    const date = data.createdAt.toDate();
    date.setHours(0, 0, 0, 0);
    const key = date.toDateString();
    if (activityMap[key] !== undefined) {
      activityMap[key]++;
    }
  });

  return Object.entries(activityMap).map(([date, count]) => ({ date, count }));
}

function calculateWeekly(attempts, now) {
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(now.getDate() - 28);
  const weeklyData = [0, 0, 0, 0];

  attempts.forEach(data => {
    const date = data.createdAt.toDate();
    if (date >= fourWeeksAgo) {
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex < 4) weeklyData[weekIndex]++;
    }
  });
  return weeklyData.reverse();
}

function calculateCurrentWeek(attempts, now) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  attempts.forEach((data) => {
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    date.setHours(0, 0, 0, 0);
    const diffDays = (date - monday) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays < 7) {
      const dayIndex = Math.floor(diffDays);
      // Fallback: If quizAttempt doesn't have detailed question arrays, use score or 5 as a proxy
      const correct = (data.correctQuestionIds || []).length || data.score || 0;
      const wrong = (data.wrongQuestionIds || []).length || 0;
      dayCounts[dayIndex] += Math.max(1, correct + wrong); 
    }
  });

  return dayNames.map((name, i) => ({ day: name, questions: dayCounts[i] }));
}

// -----------------------------------------------------
// Legacy functions (Refactored to be faster / date-filtered)
// -----------------------------------------------------

export const getUserStreak = async (userId) => {
  // Now deprecated as we use userProfile.streak directly.
  // Kept for backward compatibility if needed.
  return 0; 
};

export const getLast28DaysActivity = async (userId) => {
  const { last28 } = await getDashboardActivityData(userId);
  return last28;
};

export const getWeeklyStats = async (userId) => {
  const { weekly } = await getDashboardActivityData(userId);
  return weekly;
};

export const getCurrentWeekStats = async (userId) => {
  const { currentWeek } = await getDashboardActivityData(userId);
  return currentWeek;
};