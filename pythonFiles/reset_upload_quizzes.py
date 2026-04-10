#!/usr/bin/env python3
"""
Quiz Reset & Re-upload Script
Deletes ALL existing questions from Firestore, then re-uploads all quizFiles.
"""

import json
import os
import firebase_admin
from firebase_admin import credentials, firestore

# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    key_path = os.path.join(BASE_DIR, "firebase-key.json")
    if not os.path.exists(key_path):
        raise FileNotFoundError(f"Firebase key not found at {key_path}")
    cred = credentials.Certificate(key_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    return firestore.client()

# ----------------------------
# Subject Title -> Firestore Title Mapping
# ----------------------------

SUBJECT_MAPPING = {
    "Database Management Systems": "DBMS",
    "Object Oriented Programming":  "OOPS",
    "Operating Systems":            "OPERATINGSYSTEMS",
    "System Design":                "SystemDesign",
    "Computer Network":             "Computer Network",
    "Computer Networks":            "Computer Network",
}

def get_subject_id(db, subject_title):
    search_title = SUBJECT_MAPPING.get(subject_title, subject_title)
    docs = list(db.collection("subjects").where("title", "==", search_title).limit(1).stream())
    if docs:
        return docs[0].id
    # fallback: original title
    docs = list(db.collection("subjects").where("title", "==", subject_title).limit(1).stream())
    return docs[0].id if docs else None

# ----------------------------
# Step 1: Delete ALL questions
# ----------------------------

def delete_all_questions(db):
    print("\n🗑️  Deleting ALL existing questions from Firestore...")
    deleted = 0
    while True:
        batch_docs = list(db.collection("questions").limit(400).stream())
        if not batch_docs:
            break
        batch = db.batch()
        for doc in batch_docs:
            batch.delete(doc.reference)
        batch.commit()
        deleted += len(batch_docs)
        print(f"   Deleted {deleted} so far...")
    print(f"✅ Total deleted: {deleted} questions\n")

# ----------------------------
# Step 2: Upload all quiz files
# ----------------------------

def upload_all_quizzes(db):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    quiz_folder = os.path.join(BASE_DIR, "quizFiles")

    if not os.path.exists(quiz_folder):
        print("❌ quizFiles folder not found")
        return

    total_uploaded = 0

    for filename in sorted(os.listdir(quiz_folder)):
        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(quiz_folder, filename)
        print(f"📂 Processing: {filename}")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        subject_title = data.get("subject")
        subject_id = get_subject_id(db, subject_title)

        if not subject_id:
            print(f"  ❌ Subject not found in Firestore: '{subject_title}' — skipping.")
            continue

        print(f"  📚 Subject: {subject_title} → ID: {subject_id}")

        file_uploaded = 0

        for difficulty in ["easy", "medium", "hard"]:
            questions = data.get(difficulty, [])
            print(f"  🔹 {difficulty.upper()} → {len(questions)} questions")

            for index, q in enumerate(questions, start=1):
                question_data = {
                    "question":      q["question"],
                    "options":       q["options"],
                    "correctAnswer": q["correctAnswer"],
                    "difficulty":    difficulty,
                    "subjectId":     subject_id,
                    "order":         index,
                    "topicId":       q.get("topicId", "general"),
                    "topicName":     q.get("topicName", "General"),
                }
                if "explanation" in q:
                    question_data["explanation"] = q["explanation"]

                # Clean doc ID (no version suffix needed since we start fresh)
                doc_id = f"{subject_id}_{difficulty}_{index}"
                db.collection("questions").document(doc_id).set(question_data)
                file_uploaded += 1
                total_uploaded += 1

        print(f"  ✅ Uploaded {file_uploaded} questions from {filename}\n")

    print(f"🎉 All quizzes uploaded! Total: {total_uploaded} questions")

# ----------------------------
# Main
# ----------------------------

def main():
    print("🚀 Quiz Reset & Re-upload Tool")
    print("=" * 40)
    db = initialize_firebase()

    delete_all_questions(db)
    upload_all_quizzes(db)

if __name__ == "__main__":
    main()
