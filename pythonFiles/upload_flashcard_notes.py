#!/usr/bin/env python3
"""
QUIZZZZ Flashcard Notes Upload Script
Uploads topics and subtopics from subject folders with new 'slides' format
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
# Helper Functions
# ----------------------------

def get_subject_by_title(db, title):
    query = db.collection("subjects").where("title", "==", title.upper()).limit(1).stream()
    docs = list(query)
    if docs: return docs[0]
    
    # Try case-insensitive search
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

# ----------------------------
# Upload Logic
# ----------------------------

def upload_flashcard_notes(db):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Scan for subject folders (e.g., "Computer Network")
    subject_folders = [
        f for f in os.listdir(BASE_DIR)
        if os.path.isdir(os.path.join(BASE_DIR, f))
        and f not in ["__pycache__", "LiveQuizFiles", "quizFiles"]
    ]

    if not subject_folders:
        print("❌ No subject folders found.")
        return False

    print(f"📂 Found subject folders: {subject_folders}")

    for subject_folder in subject_folders:
        subject_title = subject_folder # e.g., "Computer Network"
        subject_path = os.path.join(BASE_DIR, subject_folder)
        
        # 1. Get Subject
        existing_subject = get_subject_by_title(db, subject_title)
        if existing_subject:
            subject_id = existing_subject.id
            print(f"\n📚 SUBJECT: {subject_title} (Exists)")
        else:
            print(f"\n📚 SUBJECT: {subject_title} (Creating New)")
            subject_ref = db.collection("subjects").add({
                "title": subject_title.upper(),
                "description": f"Master the core protocols and architectures of {subject_title}.",
                "order": 1
            })
            subject_id = subject_ref[1].id

        # 2. Get JSON files (topics)
        json_files = [f for f in os.listdir(subject_path) if f.endswith(".json")]
        json_files.sort() # Ensure correct order

        for file in json_files:
            file_path = os.path.join(subject_path, file)
            # Topic title from filename: "1_Introduction_to_Computer_Networks.json" -> "Introduction to Computer Networks"
            parts = file.replace(".json", "").split("_")
            topic_order = int(parts[0]) if parts[0].isdigit() else 99
            
            # Join the rest of the parts with spaces, not underscores
            raw_title = " ".join(parts[1:]) if len(parts) > 1 else parts[0]
            topic_title = raw_title.strip()
            
            print(f"  🔹 TOPIC: {topic_title} (Order: {topic_order})")
            
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Use 'slides' or 'topics' if available
            slides = data.get("slides", [])
            if not slides and "topics" in data:
                # Handle old format if some files are still old
                slides = data["topics"][0].get("subtopics", [])
                
            if not slides:
                print(f"    ⚠️ No slides found in {file}")
                continue

            # 3. Create/Sync Topic
            existing_topic = get_topic_by_title(db, topic_title, subject_id)
            if existing_topic:
                topic_id = existing_topic.id
                # Update description and order
                db.collection("topics").document(topic_id).update({
                    "order": topic_order
                })
            else:
                topic_ref = db.collection("topics").add({
                    "title": topic_title,
                    "subjectId": subject_id,
                    "description": f"Detailed cognitive reinforcement for {topic_title}.",
                    "order": topic_order
                })
                topic_id = topic_ref[1].id

            # 4. Import slides as subtopics (Clear existing first to avoid duplication)
            existing_subs = db.collection("subtopics").where("topicId", "==", topic_id).stream()
            for s in existing_subs:
                s.reference.delete()
            
            for i, slide in enumerate(slides):
                slide_title = slide.get("title", f"Concept {i+1}")
                # Convert content array to string theory
                content = slide.get("content", [])
                if isinstance(content, list):
                    theory = "\n".join(content)
                else:
                    theory = slide.get("theory", "") # Handle old format
                
                db.collection("subtopics").add({
                    "topicId": topic_id,
                    "title": slide_title,
                    "theory": theory,
                    "order": i
                })
            print(f"    ✅ Uploaded {len(slides)} cognitive cards.")

    print("\n🎉 FLASHCARD SYNC COMPLETED SUCCESSFULLY!")
    return True

# ----------------------------
# Main Execution
# ----------------------------

def main():
    print("🚀 QUIZZZZ Flashcard Sync Tool v2")
    print("=" * 40)
    db = initialize_firebase()
    if not db:
        return
    upload_flashcard_notes(db)

if __name__ == "__main__":
    main()
