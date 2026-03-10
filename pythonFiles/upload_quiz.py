import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# -----------------------------
# Firebase Initialization
# -----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cred = credentials.Certificate(
    os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")
)

firebase_admin.initialize_app(cred)

db = firestore.client()

# -----------------------------
# Load Quiz File
# -----------------------------

file_path = os.path.join(BASE_DIR, "quizFiles", "system_design_quiz.json")

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

subject = data["subject"]

count = 0

# -----------------------------
# Upload Questions
# -----------------------------

for difficulty in ["easy", "medium", "hard"]:
    for q in data[difficulty]:

        db.collection("questions").add({
            "subject": subject,
            "difficulty": difficulty,
            "question": q["question"],
            "options": q["options"],
            "correctAnswer": q["correctAnswer"]
        })

        count += 1

print(f"✅ Uploaded {count} questions successfully")