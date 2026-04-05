const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(path.join(__dirname, "../pythonFiles/firebase-key.json"))
  });
}

const db = admin.firestore();

async function list() {
  const snapshot = await db.collection("subjects").get();
  console.log("📋 Current Subjects:");
  snapshot.forEach(doc => {
    console.log(`- ${doc.data().title} (ID: ${doc.id})`);
  });
}

list();
