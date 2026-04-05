const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Use service account if available, otherwise assume ADC
// Need a way to get service account. For now, let's assume one exists or we use the default.
// Alternatively, I can just write the script and ask the user to run it with their own credentials.
// But as an AI assistant, I should try to make it work.

if (!admin.apps.length) {
  // If the user has a serviceAccount.json, they should use it.
  // For now I will look for one or use default credentials.
  try {
     admin.initializeApp({
        credential: admin.credential.applicationDefault()
     });
  } catch (err) {
     console.error("Please set GOOGLE_APPLICATION_CREDENTIALS or provide a serviceAccount.json.");
     process.exit(1);
  }
}

console.log("Initializing Firebase Admin...");
const db = admin.firestore();

const importNotes = async () => {
    console.log("Importing notes from pythonFiles...");
    const SUBJECT_NAME = "COMPUTER NETWORK";
    const NOTES_DIR = path.join(__dirname, "../pythonFiles/Computer Network");

    // 1. Get Subject Id
    const subjectsSnap = await db.collection("subjects")
        .where("title", "==", SUBJECT_NAME)
        .get();
    
    let subjectId;
    if (subjectsSnap.empty) {
        console.log(`Creating subject: ${SUBJECT_NAME}`);
        const res = await db.collection("subjects").add({
            title: SUBJECT_NAME,
            description: "Fundamental and Advanced Computer Networking Concepts",
            progress: 0,
            order: 1
        });
        subjectId = res.id;
    } else {
        subjectId = subjectsSnap.docs[0].id;
    }

    const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith(".json"));

    for (const file of files) {
        const filePath = path.join(NOTES_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // Topic Title from filename or slides if available
        const topicTitle = file.replace(/^\d+_/, "").replace(".json", "").replace(/([A-Z])/g, ' $1').trim();
        console.log(`Processing Topic: ${topicTitle}`);

        // 2. Check if Topic exists, otherwise create
        const topicSnap = await db.collection("topics")
            .where("subjectId", "==", subjectId)
            .where("title", "==", topicTitle)
            .get();

        let topicId;
        if (topicSnap.empty) {
            const res = await db.collection("topics").add({
                subjectId,
                title: topicTitle,
                description: `${topicTitle} core concepts and protocols.`,
                order: parseInt(file.split("_")[0]) || 99
            });
            topicId = res.id;
        } else {
            topicId = topicSnap.docs[0].id;
        }

        // 3. Import slides as subtopics
        // Clear existing subtopics first to avoid duplicates
        const existingSubs = await db.collection("subtopics").where("topicId", "==", topicId).get();
        for (const s of existingSubs.docs) {
            await s.ref.delete();
        }

        const slides = data.slides || [];
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            await db.collection("subtopics").add({
                topicId,
                title: slide.title,
                theory: Array.isArray(slide.content) ? slide.content.join("\n") : (slide.content || ""),
                order: i + 1
            });
        }
        console.log(`Imported ${slides.length} slides for ${topicTitle}`);
    }

    console.log("Notes synchronization complete.");
};

importNotes().catch(console.error);
