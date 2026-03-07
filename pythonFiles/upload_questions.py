import csv
import os
import firebase_admin
from firebase_admin import credentials, firestore

# ---------- Initialize Firebase Properly ----------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")

cred = credentials.Certificate(key_path)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------- Upload Questions ----------

csv_path = os.path.join(BASE_DIR, "questions.csv")

try:
    with open(csv_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        
        question_count = 0
        for row in reader:
            question_data = {
                "question": row.get("question", ""),
                "options": [
                    row.get("optionA", ""),
                    row.get("optionB", ""),
                    row.get("optionC", ""),
                    row.get("optionD", "")
                ],
                "correctAnswer": row.get("correctAnswer", ""),
                "topicId": row.get("topicId", ""),
                "difficulty": row.get("difficulty", "medium").lower()
            }
            
            # Optional fields
            if "explanation" in row and row["explanation"]:
                question_data["explanation"] = row["explanation"]
            
            db.collection("questions").add(question_data)
            question_count += 1
        
        print(f"✅ Uploaded {question_count} questions successfully!")
        
except FileNotFoundError:
    print(f"❌ Error: {csv_path} not found!")
except Exception as e:
    print(f"❌ Error uploading questions: {str(e)}")