import firebase_admin
from firebase_admin import credentials, firestore
import json
import os


# -----------------------------
# Firebase Initialization
# -----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cred = credentials.Certificate(
    os.path.join(
        BASE_DIR,
        "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json"
    )
)

if not firebase_admin._apps:
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
    for index, q in enumerate(data.get(difficulty, []), start=1):

        topic_id = q.get("topicId", "general")
        topic_name = q.get("topicName", "General")

        question_data = {
            "subject": subject,
            "difficulty": difficulty,
            "question": q["question"],
            "options": q["options"],
            "correctAnswer": q["correctAnswer"],

            # 🔥 NEW
            "topicId": topic_id,
            "topicName": topic_name,
        }

        if "explanation" in q:
            question_data["explanation"] = q["explanation"]

        db.collection("questions").add(question_data)

        count += 1

print(f"✅ Uploaded {count} questions successfully")