#!/usr/bin/env python3
"""
QUIZZZZ Content Upload Script
Uploads subjects, topics, and subtopics from subject folders
NOW PRESERVES GLOBAL ORDER
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import os


# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():
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
    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
    docs = list(query)
    return docs[0] if docs else None


def get_topic_by_title(db, title, subject_id):
    query = (
        db.collection("topics")
        .where("title", "==", title)
        .where("subjectId", "==", subject_id)
        .limit(1)
        .stream()
    )
    docs = list(query)
    return docs[0] if docs else None


def get_subtopic_by_title(db, title, topic_id):
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
# Upload Logic
# ----------------------------

def upload_content(db):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    subject_folders = [
        f for f in os.listdir(BASE_DIR)
        if os.path.isdir(os.path.join(BASE_DIR, f))
        and f not in ["__pycache__"]
    ]

    if not subject_folders:
        print("❌ No subject folders found.")
        return False

    uploaded_subjects = 0
    uploaded_topics = 0
    uploaded_subtopics = 0

    for subject_folder in subject_folders:

        subject_title = subject_folder
        subject_path = os.path.join(BASE_DIR, subject_folder)

        existing_subject = get_subject_by_title(db, subject_title)

        if existing_subject:
            subject_id = existing_subject.id
            print(f"⚠️ Subject already exists: {subject_title}")
        else:
            subject_ref = db.collection("subjects").add({
                "title": subject_title,
                "description": f"{subject_title} concepts"
            })
            subject_id = subject_ref[1].id
            uploaded_subjects += 1
            print(f"✅ Created subject: {subject_title}")

        json_files = [
            f for f in os.listdir(subject_path)
            if f.endswith(".json")
        ]

        # Global topic counter per subject (prevents module explosion)
        topic_counter = 0

        for file in json_files:

            file_path = os.path.join(subject_path, file)

            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            topics_list = data.get("topics", [])

            for topic in topics_list:

                topic_title = topic.get("title", "").strip()
                topic_description = topic.get("description", "").strip()
                subtopics_list = topic.get("subtopics", [])

                if not topic_title:
                    continue

                existing_topic = get_topic_by_title(db, topic_title, subject_id)

                if existing_topic:
                    topic_id = existing_topic.id
                    print(f"   ⚠️ Topic exists: {topic_title}")
                else:
                    topic_ref = db.collection("topics").add({
                        "title": topic_title,
                        "description": topic_description,
                        "subjectId": subject_id,
                        "order": topic_counter
                    })
                    topic_id = topic_ref[1].id
                    uploaded_topics += 1
                    print(f"   ✅ Created topic: {topic_title}")

                topic_counter += 1

                # Subtopics
                for sub_index, subtopic in enumerate(subtopics_list):

                    subtopic_title = subtopic.get("title", "").strip()
                    subtopic_theory = subtopic.get("theory", "").strip()
                    subtopic_images = subtopic.get("images", [])

                    if not subtopic_title:
                        continue

                    existing_subtopic = get_subtopic_by_title(db, subtopic_title, topic_id)

                    if existing_subtopic:
                        print(f"      ⚠️ Subtopic exists: {subtopic_title}")
                    else:
                        db.collection("subtopics").add({
                            "title": subtopic_title,
                            "topicId": topic_id,
                            "theory": subtopic_theory,
                            "images": subtopic_images,
                            "order": sub_index
                        })
                        uploaded_subtopics += 1
                        print(f"      ✅ Created subtopic: {subtopic_title}")

    print("\n🎉 Upload Completed!")
    print(f"Subjects: {uploaded_subjects}")
    print(f"Topics: {uploaded_topics}")
    print(f"Subtopics: {uploaded_subtopics}")

    return True


# ----------------------------
# Main
# ----------------------------

def main():

    print("🚀 QUIZZZZ Folder Content Upload")
    print("=" * 40)

    db = initialize_firebase()

    if not db:
        return

    success = upload_content(db)

    if success:
        print("\n✅ Content upload completed successfully!")
    else:
        print("\n❌ Content upload failed!")


if __name__ == "__main__":
    main()