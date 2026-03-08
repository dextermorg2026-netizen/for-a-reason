#!/usr/bin/env python3
"""
QUIZZZZ Questions Upload Script
Uploads questions from CSV file to Firebase Firestore
"""

import csv
import os
import firebase_admin
from firebase_admin import credentials, firestore

# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
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
# Validation Functions
# ----------------------------

def validate_question_row(row):
    """Validate a question row from CSV"""
    errors = []

    # Required fields
    if not row.get("question", "").strip():
        errors.append("Missing question text")

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
        errors.append("correctAnswer must be A, B, C, or D")

    if not row.get("topicId", "").strip():
        errors.append("Missing topicId")

    difficulty = row.get("difficulty", "medium").strip().lower()
    if difficulty not in ["easy", "medium", "hard"]:
        errors.append("difficulty must be easy, medium, or hard")

    return errors

# ----------------------------
# Upload Functions
# ----------------------------

def upload_questions(db):
    """Upload questions from CSV file"""

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(BASE_DIR, "questions.csv")

    if not os.path.exists(csv_path):
        print(f"❌ Error: {csv_path} not found!")
        return False

    try:
        with open(csv_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            # Validate CSV headers
            required_headers = ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "topicId"]
            missing_headers = [h for h in required_headers if h not in reader.fieldnames]

            if missing_headers:
                print(f"❌ Error: Missing required CSV headers: {', '.join(missing_headers)}")
                print(f"   Required headers: {', '.join(required_headers)}")
                return False

            questions = list(reader)
            if not questions:
                print("⚠️  Warning: No questions found in CSV file")
                return False

            print(f"📝 Starting question upload: {len(questions)} questions\n")

            uploaded_count = 0
            skipped_count = 0
            error_count = 0

            for i, row in enumerate(questions, 1):
                # Validate row
                errors = validate_question_row(row)
                if errors:
                    print(f"❌ Row {i}: {', '.join(errors)}")
                    error_count += 1
                    continue

                # Prepare question data
                question_data = {
                    "question": row.get("question", "").strip(),
                    "options": [
                        row.get("optionA", "").strip(),
                        row.get("optionB", "").strip(),
                        row.get("optionC", "").strip(),
                        row.get("optionD", "").strip()
                    ],
                    "correctAnswer": row.get("correctAnswer", "").strip().upper(),
                    "topicId": row.get("topicId", "").strip(),
                    "difficulty": row.get("difficulty", "medium").strip().lower()
                }

                # Optional explanation
                explanation = row.get("explanation", "").strip()
                if explanation:
                    question_data["explanation"] = explanation

                try:
                    # Add to Firestore
                    db.collection("questions").add(question_data)
                    uploaded_count += 1

                    if uploaded_count <= 5:  # Show first 5 uploads
                        print(f"✅ Uploaded question {uploaded_count}: {question_data['question'][:50]}...")
                    elif uploaded_count % 10 == 0:  # Show progress every 10 questions
                        print(f"✅ Uploaded {uploaded_count} questions...")

                except Exception as e:
                    print(f"❌ Error uploading question {i}: {str(e)}")
                    error_count += 1

            print(f"\n🎉 Questions upload completed!")
            print(f"   📊 Summary: {uploaded_count} uploaded, {skipped_count} skipped, {error_count} errors")

            if error_count > 0:
                print(f"   ⚠️  {error_count} questions had errors and were not uploaded")

            return uploaded_count > 0

    except Exception as e:
        print(f"❌ Error reading CSV file: {str(e)}")
        return False

# ----------------------------
# Main Execution
# ----------------------------

def main():
    print("🚀 QUIZZZZ Questions Upload Script")
    print("=" * 40)

    db = initialize_firebase()
    if not db:
        return

    success = upload_questions(db)

    if success:
        print("\n✅ Questions upload completed successfully!")
    else:
        print("\n❌ Questions upload failed!")

if __name__ == "__main__":
    main()