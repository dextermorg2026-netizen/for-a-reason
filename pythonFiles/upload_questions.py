import csv
import os
import firebase_admin
from firebase_admin import credentials, firestore

# ---------- Initialize Firebase Properly ----------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")

cred = credentials.Certificate(key_path)

firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------- Upload Questions ----------

csv_path = os.path.join(BASE_DIR, "questions.csv")

with open(csv_path, newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        question_data = {
            "questionText": row["questionText"],
            "subjectId": row["subjectId"],
            "topicId": row["topicId"],
            "correctAnswer": row["correctAnswer"],
            "explanation": row["explanation"],
            "options": [
                {"id": "A", "text": row["optionA"]},
                {"id": "B", "text": row["optionB"]},
                {"id": "C", "text": row["optionC"]},
                {"id": "D", "text": row["optionD"]},
            ]
        }

        db.collection("questions").add(question_data)

print("✅ Questions uploaded successfully!")