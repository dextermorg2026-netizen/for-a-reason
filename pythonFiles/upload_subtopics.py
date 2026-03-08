#!/usr/bin/env python3
"""
QUIZZZZ Subtopics Upload Script
Uploads only subtopics to Firebase Firestore (requires topics to exist)
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
# Helper Functions
# ----------------------------

def get_subject_by_title(db, title):
    """Get subject by title"""
    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
    docs = list(query)
    return docs[0] if docs else None

def get_topic_by_title_and_subject(db, title, subject_id):
    """Get topic by title and subject ID"""
    query = (
        db.collection("topics")
        .where("title", "==", title)
        .where("subjectId", "==", subject_id)
        .limit(1)
        .stream()
    )
    docs = list(query)
    return docs[0] if docs else None

def get_subtopic_by_title_and_topic(db, title, topic_id):
    """Check if subtopic exists"""
    query = (
        db.collection("subtopics")
        .where("title", "==", title)
        .where("topicId", "==", topic_id)
        .limit(1)
        .stream()
    )
    docs = list(query)
    return docs[0] if docs else None

# ----------------------------
# Upload Functions
# ----------------------------

def upload_subtopics(db):
    """Upload subtopics from JSON file"""

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

        print("📚 Starting subtopics upload...\n")

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
                # Count all subtopics under this subject
                for topic in topics_list:
                    error_count += len(topic.get("subtopics", []))
                continue

            subject_id = subject_doc.id

            # Process topics to get to subtopics
            for topic in topics_list:
                topic_title = topic.get("title", "").strip()
                subtopics_list = topic.get("subtopics", [])

                if not topic_title:
                    print("⚠️  Skipping topic with empty title")
                    continue

                # Get topic ID
                topic_doc = get_topic_by_title_and_subject(db, topic_title, subject_id)
                if not topic_doc:
                    print(f"❌ Topic not found: {topic_title} (upload topics first)")
                    error_count += len(subtopics_list)
                    continue

                topic_id = topic_doc.id
                print(f"📖 Processing subtopics for topic: {topic_title}")

                # Process subtopics
                for subtopic in subtopics_list:
                    subtopic_title = subtopic.get("title", "").strip()
                    subtopic_theory = subtopic.get("theory", "").strip()
                    subtopic_images = subtopic.get("images", [])

                    if not subtopic_title:
                        print("⚠️  Skipping subtopic with empty title")
                        continue

                    existing_subtopic = get_subtopic_by_title_and_topic(db, subtopic_title, topic_id)

                    if existing_subtopic:
                        print(f"      ⚠️  Subtopic already exists: {subtopic_title}")
                        skipped_count += 1
                    else:
                        db.collection("subtopics").add({
                            "title": subtopic_title,
                            "topicId": topic_id,
                            "theory": subtopic_theory,
                            "images": subtopic_images
                        })
                        uploaded_count += 1
                        print(f"      ✅ Created subtopic: {subtopic_title}")

        print(f"\n🎉 Subtopics upload completed!")
        print(f"   📊 Summary: {uploaded_count} uploaded, {skipped_count} skipped, {error_count} errors")

        if error_count > 0:
            print(f"   ⚠️  {error_count} subtopics skipped due to missing parent subjects/topics")

        return uploaded_count > 0

    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON file: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error uploading subtopics: {str(e)}")
        return False

# ----------------------------
# Main Execution
# ----------------------------

def main():
    print("🚀 QUIZZZZ Subtopics Upload Script")
    print("=" * 40)

    db = initialize_firebase()
    if not db:
        return

    success = upload_subtopics(db)

    if success:
        print("\n✅ Subtopics upload completed successfully!")
    else:
        print("\n❌ Subtopics upload failed!")

if __name__ == "__main__":
    main()