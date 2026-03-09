#!/usr/bin/env python3
"""
QUIZZZZ Questions Upload Script
Uploads questions from CSV file to Firebase Firestore
Now links questions using subjectTitle instead of topicId
"""

import csv
import os
import firebase_admin
from firebase_admin import credentials, firestore


# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    key_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")

    if not os.path.exists(key_path):
        print(f"❌ Error: Firebase key file not found at {key_path}")
        return None

    try:
        cred = credentials.Certificate(key_path)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        return firestore.client()

    except Exception as e:
        print(f"❌ Error initializing Firebase: {str(e)}")
        return None


# ----------------------------
# Helper Function
# ----------------------------

def get_subject_id_by_title(db, title):
    """Find subjectId using subject title"""

    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
    docs = list(query)

    if not docs:
        return None

    return docs[0].id


# ----------------------------
# Validation Functions
# ----------------------------

def validate_question_row(row):
    errors = []

    if not row.get("question", "").strip():
        errors.append("Missing question")

    if not row.get("optionA", "").strip():
        errors.append("Missing optionA")

    if not row.get("optionB", "").strip():
        errors.append("Missing optionB")

    if not row.get("optionC", "").strip():
        errors.append("Missing optionC")

    if not row.get("optionD", "").strip():
        errors.append("Missing optionD")

    correct_answer = row.get("correctAnswer", "").strip().upper()

    if correct_answer not in ["A", "B", "C", "D"]:
        errors.append("correctAnswer must be A/B/C/D")

    if not row.get("subjectTitle", "").strip():
        errors.append("Missing subjectTitle")

    difficulty = row.get("difficulty", "").strip().lower()

    if difficulty not in ["easy", "medium", "hard"]:
        errors.append("difficulty must be easy/medium/hard")

    return errors


# ----------------------------
# Upload Questions
# ----------------------------

def upload_questions(db):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(BASE_DIR, "questions.csv")

    if not os.path.exists(csv_path):
        print(f"❌ Error: {csv_path} not found")
        return False

    try:

        with open(csv_path, newline="", encoding="utf-8") as csvfile:

            reader = csv.DictReader(csvfile)

            required_headers = [
                "question",
                "optionA",
                "optionB",
                "optionC",
                "optionD",
                "correctAnswer",
                "subjectTitle",
                "difficulty"
            ]

            missing = [h for h in required_headers if h not in reader.fieldnames]

            if missing:
                print(f"❌ Missing CSV headers: {', '.join(missing)}")
                return False

            questions = list(reader)

            print(f"📝 Uploading {len(questions)} questions...\n")

            uploaded = 0
            errors = 0

            for i, row in enumerate(questions, 1):

                validation = validate_question_row(row)

                if validation:
                    print(f"❌ Row {i}: {', '.join(validation)}")
                    errors += 1
                    continue

                subject_title = row.get("subjectTitle").strip()
                subject_id = get_subject_id_by_title(db, subject_title)

                if not subject_id:
                    print(f"❌ Row {i}: Subject not found → {subject_title}")
                    errors += 1
                    continue

                question_data = {
                    "question": row.get("question").strip(),
                    "options": [
                        row.get("optionA").strip(),
                        row.get("optionB").strip(),
                        row.get("optionC").strip(),
                        row.get("optionD").strip()
                    ],
                    "correctAnswer": row.get("correctAnswer").strip().upper(),
                    "subjectId": subject_id,
                    "difficulty": row.get("difficulty").strip().lower()
                }

                explanation = row.get("explanation", "").strip()

                if explanation:
                    question_data["explanation"] = explanation

                try:

                    db.collection("questions").add(question_data)

                    uploaded += 1

                    if uploaded <= 5:
                        print(f"✅ {question_data['question'][:50]}...")

                    elif uploaded % 10 == 0:
                        print(f"✅ Uploaded {uploaded} questions")

                except Exception as e:
                    print(f"❌ Upload error row {i}: {str(e)}")
                    errors += 1

            print("\n🎉 Upload Finished")
            print(f"Uploaded: {uploaded}")
            print(f"Errors: {errors}")

            return uploaded > 0

    except Exception as e:
        print(f"❌ CSV read error: {str(e)}")
        return False


# ----------------------------
# Main
# ----------------------------

def main():

    print("🚀 QUIZZZZ Questions Upload Script")
    print("=" * 40)

    db = initialize_firebase()

    if not db:
        return

    success = upload_questions(db)

    if success:
        print("\n✅ Questions uploaded successfully")

    else:
        print("\n❌ Upload failed")


if __name__ == "__main__":
    main()