#!/usr/bin/env python3
"""
QUIZZZZ Subject Content Cleaner
Deletes all topics and subtopics for 'COMPUTER NETWORK' to allow a fresh sync.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os

# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    key_path = os.path.join(BASE_DIR, "firebase-key.json")
    
    if not os.path.exists(key_path):
        print(f"❌ Error: Firebase key file 'firebase-key.json' not found at {BASE_DIR}")
        return None
    
    print(f"🔑 Using key: firebase-key.json")
    try:
        cred = credentials.Certificate(key_path)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as e:
        print(f"❌ Error initializing Firebase: {str(e)}")
        return None

# ----------------------------
# Deletion Logic
# ----------------------------

def clean_subject_content(db, subject_name="Computer Network"):
    # 1. Find the Subject (Search all and match)
    subjects_ref = db.collection("subjects").stream()
    subject_id = None
    matched_name = None
    
    for s in subjects_ref:
        title = s.to_dict().get("title", "")
        if title.upper() == subject_name.upper() or title == subject_name:
            subject_id = s.id
            matched_name = title
            break
            
    if not subject_id:
        print(f"❌ Error: Subject '{subject_name}' not found in database.")
        return

    print(f"🗑️ Found Subject: {matched_name} (ID: {subject_id})")

    # 2. Find and delete Topics and their Subtopics
    topics_ref = db.collection("topics").where("subjectId", "==", subject_id).stream()
    topics = list(topics_ref)
    
    if not topics:
        print(f"✅ No topics found for subject '{subject_name}'.")
        return

    print(f"🔍 Found {len(topics)} topics to remove. Commencing wipe...")

    for topic in topics:
        topic_id = topic.id
        topic_title = topic.to_dict().get("title", "Unknown")
        
        # A. Delete Subtopics for this Topic
        subtopics_ref = db.collection("subtopics").where("topicId", "==", topic_id).stream()
        subtopics_count = 0
        for sub in subtopics_ref:
            sub.reference.delete()
            subtopics_count += 1
            
        # B. Delete Topic itself
        topic.reference.delete()
        print(f"   ❌ Deleted Topic: {topic_title} (along with {subtopics_count} subtopics)")

    print(f"\n🎉 Subject '{subject_name}' content has been successfully WIPED.")
    print("🚀 You can now run 'upload_flashcard_notes.py' for a fresh sync.")

# ----------------------------
# Main Execution
# ----------------------------

def main():
    print("🧹 QUIZZZZ Subject Content Cleaner v1.0")
    print("=" * 40)
    db = initialize_firebase()
    if not db:
        return
    clean_subject_content(db)

if __name__ == "__main__":
    main()
