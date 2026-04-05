#!/usr/bin/env python3
"""
QUIZZZZ Topics Upload Script
Uploads only topics to Firebase Firestore (requires subjects to exist)
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
    """Get subject by title"""
    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
    docs = list(query)
    return docs[0] if docs else None

def get_topic_by_title_and_subject(db, title, subject_id):
    """Check if topic exists"""
    query = (
        db.collection("topics")
        .where("title", "==", title)
        .where("subjectId", "==", subject_id)
        .limit(1)
        .stream()
    )
    docs = list(query)
    return docs[0] if docs else None

# ----------------------------
# Upload Functions
# ----------------------------

def upload_topics(db):
    """Upload topics from JSON file"""

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

        print("📚 Starting topics upload...\n")

        uploaded_count = 0
        skipped_count = 0
        error_count = 0

        for subject in subjects_list:
            subject_title = subject.get("title", "").strip()
            topics_list = subject.get("topics", [])

            if not subject_title:
                print("⚠️  Skipping subject with empty title")
                continue

            # Get subject ID
            subject_doc = get_subject_by_title(db, subject_title)
            if not subject_doc:
                print(f"❌ Subject not found: {subject_title} (upload subjects first)")
                error_count += len(topics_list)
                continue

            subject_id = subject_doc.id
            print(f"📖 Processing topics for subject: {subject_title}")

            # Process topics
            for topic in topics_list:
                topic_title = topic.get("title", "").strip()
                topic_description = topic.get("description", "").strip()

                if not topic_title:
                    print("⚠️  Skipping topic with empty title")
                    continue

                existing_topic = get_topic_by_title_and_subject(db, topic_title, subject_id)

                if existing_topic:
                    print(f"   ⚠️  Topic already exists: {topic_title}")
                    skipped_count += 1
                else:
                    topic_ref = db.collection("topics").add({
                        "title": topic_title,
                        "description": topic_description,
                        "subjectId": subject_id
                    })
                    uploaded_count += 1
                    print(f"   ✅ Created topic: {topic_title}")

        print(f"\n🎉 Topics upload completed!")
        print(f"   📊 Summary: {uploaded_count} uploaded, {skipped_count} skipped, {error_count} errors")

        if error_count > 0:
            print(f"   ⚠️  {error_count} topics skipped due to missing parent subjects")

        return uploaded_count > 0

    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON file: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error uploading topics: {str(e)}")
        return False

# ----------------------------
# Main Execution
# ----------------------------

def main():
    print("🚀 QUIZZZZ Topics Upload Script")
    print("=" * 40)

    db = initialize_firebase()
    if not db:
        return

    success = upload_topics(db)

    if success:
        print("\n✅ Topics upload completed successfully!")
    else:
        print("\n❌ Topics upload failed!")

if __name__ == "__main__":
    main()