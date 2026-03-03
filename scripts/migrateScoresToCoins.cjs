// one‑time migration: convert existing score data into coins
// run with `node scripts/migrateScoresToCoins.cjs` from workspace root
// requires `npm install firebase-admin` before running

const admin = require("firebase-admin");

// path to service account key already checked into repo
const serviceAccount = require("../pythonFiles/court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json");

// reuse the same constant used throughout the app so the migration isn't out of sync
const { COINS_PER_CORRECT } = require("../src/utils/constants");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  const usersSnap = await db.collection("users").get();
  console.log(`Found ${usersSnap.size} users`);

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const updates = {};

    // if a legacy totalScore field exists, convert it
    if (typeof data.totalScore === "number" && !data.coins) {
      updates.coins = data.totalScore * COINS_PER_CORRECT;
      console.log(`user ${userDoc.id}: setting coins=${updates.coins}`);
    }

    // build per-subject coins map from past quizAttempts
    const subjMap = {};
    const attemptsSnap = await db
      .collection("quizAttempts")
      .where("userId", "==", userDoc.id)
      .get();

    attemptsSnap.forEach((a) => {
      const d = a.data();
      const sid = d.subjectId || "unknown";
      const earned = (d.score || 0) * COINS_PER_CORRECT; // old score→coins
      subjMap[sid] = (subjMap[sid] || 0) + earned;
    });

    if (Object.keys(subjMap).length) {
      updates.subjectCoins = subjMap;
    }

    if (Object.keys(updates).length) {
      // uncomment to remove legacy field:
      // updates.totalScore = admin.firestore.FieldValue.delete();
      await userDoc.ref.set(updates, { merge: true });
    }
  }

  console.log("Migration complete");
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});