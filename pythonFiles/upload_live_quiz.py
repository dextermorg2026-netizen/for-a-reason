#!/usr/bin/env python3

import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime


# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    key_path = os.path.join(
        BASE_DIR,
        "firebase-key.json"
    )

    cred = credentials.Certificate(key_path)

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    return firestore.client()


# ----------------------------
# Create Live Quiz Session
# ----------------------------

def create_live_quiz(db, data):

    questions = data.get("questions", [])
    title = data.get("title", "Live Quiz")

    if len(questions) < 25:
        print("❌ Minimum 25 questions required")
        return None

    # limit max 30
    questions = questions[:30]

    session_ref = db.collection("liveQuizzes").document()

    session_ref.set({
        "title": title,
        "status": "waiting",
        "currentQuestionIndex": 0,
        "totalQuestions": len(questions),
        "createdAt": datetime.utcnow()
    })

    print(f"🧠 Creating session: {session_ref.id}")

    # Upload questions as subcollection
    for i, q in enumerate(questions):

        question_data = {
            "question": q["question"],
            "options": q["options"],
            "correctAnswer": q["correctAnswer"],
            "order": i
        }

        session_ref.collection("questions").document(str(i)).set(question_data)

    return session_ref.id


# ----------------------------
# Upload Live Quiz Files
# ----------------------------

def upload_live_quizzes(db):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    quiz_folder = os.path.join(BASE_DIR, "liveQuizFiles")

    if not os.path.exists(quiz_folder):
        print("❌ liveQuizFiles folder not found")
        return

    for filename in os.listdir(quiz_folder):

        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(quiz_folder, filename)

        print(f"\n📂 Processing file: {filename}")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        session_id = create_live_quiz(db, data)

        if session_id:
            print(f"✅ Live Quiz Created!")
            print(f"🎯 JOIN CODE: {session_id}")
        else:
            print("❌ Failed to create quiz")


# ----------------------------
# Main
# ----------------------------

def main():

    print("🚀 LIVE QUIZ UPLOADER")
    print("=" * 40)

    db = initialize_firebase()

    upload_live_quizzes(db)


if __name__ == "__main__":
    main()