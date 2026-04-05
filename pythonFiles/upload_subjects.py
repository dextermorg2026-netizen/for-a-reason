#!/usr/bin/env python3
"""
QUIZZZZ Subjects Upload Script
Uploads only subjects to Firebase Firestore
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    key_path = os.path.join(BASE_DIR, "firebase-key.json")

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
# Helper Functions
# ----------------------------

def get_subject_by_title(db, title):
    """Check if subject exists by title"""
    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
    docs = list(query)
    return docs[0] if docs else None

# ----------------------------
# Upload Functions
# ----------------------------

def upload_subjects(db):
    """Upload subjects from JSON file"""

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(BASE_DIR, "subjects_topics.json")

    if not os.path.exists(json_path):
        print(f"❌ Error: {json_path} not found!")
        return False

    try:
        with open(json_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        subjects_list = data.get("subjects", [])

        if not subjects_list:
            print("⚠️  Warning: No subjects found in JSON file")
            return False

        print(f"📚 Starting subjects upload: {len(subjects_list)} subjects\n")

        uploaded_count = 0
        skipped_count = 0

        for subject in subjects_list:
            subject_title = subject.get("title", "").strip()
            subject_description = subject.get("description", "").strip()

            if not subject_title:
                print("⚠️  Skipping subject with empty title")
                continue

            # Check if subject exists
            existing_subject = get_subject_by_title(db, subject_title)

            if existing_subject:
                print(f"⚠️  Subject already exists: {subject_title}")
                skipped_count += 1
            else:
                subject_ref = db.collection("subjects").add({
                    "title": subject_title,
                    "description": subject_description
                })
                uploaded_count += 1
                print(f"✅ Created subject: {subject_title}")

        print(f"\n🎉 Subjects upload completed!")
        print(f"   📊 Summary: {uploaded_count} uploaded, {skipped_count} skipped")
        return uploaded_count > 0

    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON file: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error uploading subjects: {str(e)}")
        return False

# ----------------------------
# Main Execution
# ----------------------------

def main():
    print("🚀 QUIZZZZ Subjects Upload Script")
    print("=" * 40)

    db = initialize_firebase()
    if not db:
        return

    success = upload_subjects(db)

    if success:
        print("\n✅ Subjects upload completed successfully!")
    else:
        print("\n❌ Subjects upload failed!")

if __name__ == "__main__":
    main()