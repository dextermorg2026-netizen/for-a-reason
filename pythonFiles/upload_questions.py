#!/usr/bin/env python3

import json
import os
import firebase_admin
from firebase_admin import credentials, firestore


# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    key_path = os.path.join(
        BASE_DIR,
        "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json"
    )

    cred = credentials.Certificate(key_path)

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    return firestore.client()


# ----------------------------
# Get Subject ID
# ----------------------------

def get_subject_id_by_title(db, title):

    docs = (
        db.collection("subjects")
        .where("title", "==", title)
        .limit(1)
        .stream()
    )

    docs = list(docs)

    if not docs:
        return None

    return docs[0].id


# ----------------------------
# Upload Questions
# ----------------------------

def upload_questions(db):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    quiz_folder = os.path.join(BASE_DIR, "quizFiles")

    if not os.path.exists(quiz_folder):
        print("❌ quizFiles folder not found")
        return

    total_uploaded = 0
    total_skipped = 0

    for filename in os.listdir(quiz_folder):

        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(quiz_folder, filename)

        print(f"\n📂 Processing file: {filename}")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        subject_title = data.get("subject")

        subject_id = get_subject_id_by_title(db, subject_title)

        if not subject_id:
            print(f"❌ Subject not found: {subject_title}")
            continue

        uploaded = 0
        skipped = 0

        for difficulty in ["easy", "medium", "hard"]:

            questions = data.get(difficulty, [])

            print(f"🔹 {difficulty.upper()} → {len(questions)} questions")

            for index, q in enumerate(questions, start=1):

                question_data = {
                    "question": q["question"],
                    "options": q["options"],
                    "correctAnswer": q["correctAnswer"],
                    "difficulty": difficulty,
                    "subjectId": subject_id,
                    "order": index
                }

                if "explanation" in q:
                    question_data["explanation"] = q["explanation"]

                # Unique ID per question
                doc_id = f"{subject_id}_{difficulty}_{index}"

                doc_ref = db.collection("questions").document(doc_id)

                doc = doc_ref.get()

                # Skip if already exists
                if doc.exists:
                    skipped += 1
                    total_skipped += 1
                    continue

                doc_ref.set(question_data)

                uploaded += 1
                total_uploaded += 1

        print(f"✅ Uploaded {uploaded} questions from {filename}")
        print(f"⏭ Skipped {skipped} existing questions")

    print("\n🎉 Upload Complete")
    print(f"Total uploaded: {total_uploaded}")
    print(f"Total skipped: {total_skipped}")


# ----------------------------
# Main
# ----------------------------

def main():

    print("🚀 QUIZZZZ Smart Question Upload")
    print("=" * 40)

    db = initialize_firebase()

    upload_questions(db)


if __name__ == "__main__":
    main()