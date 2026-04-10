import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

def initialize_firebase():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    key_path = os.path.join(BASE_DIR, "firebase-key.json")
    if not os.path.exists(key_path):
        raise FileNotFoundError(f"Firebase key not found at {key_path}")
    cred = credentials.Certificate(key_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    return firestore.client()

def get_subject_by_title(db, title):
    # Try exact match first (case-insensitive via upper)
    query = db.collection("subjects").where("title", "==", title.upper()).limit(1).stream()
    docs = list(query)
    if docs: return docs[0]
    
    # Try exact title as folder name
    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
    docs = list(query)
    return docs[0] if docs else None

def process_file(db, subject_id, subject_path, filename):
    # Topic title from filename: "6_Routing&Switching.json" -> "Routing&Switching"
    # But usually we want spaces instead of underscores if any
    parts = filename.replace(".json", "").split("_")
    topic_order = int(parts[0]) if parts[0].isdigit() else 99
    
    # Join the rest of the parts with spaces
    topic_title = " ".join(parts[1:]) if len(parts) > 1 else parts[0]
    topic_title = topic_title.strip()
    
    file_path = os.path.join(subject_path, filename)
    print(f"  🔹 Processing Topic: '{topic_title}' (Order: {topic_order})")
    
    if not os.path.exists(file_path):
        print(f"    ⚠️ File not found: {file_path}")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    slides = data.get("slides", [])
    if not slides:
        print(f"    ⚠️ No slides found in {filename}")
        return

    # 1. Find and Delete existing topic if we want a clean start, 
    # or just update it. User asked to "delete and upload".
    # We'll search for topics with the same order or title.
    topic_query = db.collection("topics").where("subjectId", "==", subject_id).where("order", "==", topic_order).stream()
    for doc in topic_query:
        print(f"    🗑️ Deleting old topic version: {doc.to_dict().get('title')} (ID: {doc.id})")
        # Delete subtopics first
        subs = db.collection("subtopics").where("topicId", "==", doc.id).stream()
        for s in subs: s.reference.delete()
        doc.reference.delete()

    # 2. Create New Topic
    topic_ref = db.collection("topics").add({
        "title": topic_title,
        "subjectId": subject_id,
        "description": f"Detailed cognitive reinforcement for {topic_title}.",
        "order": topic_order
    })
    topic_id = topic_ref[1].id

    # 3. Add Slides
    for i, slide in enumerate(slides):
        content = slide.get("content", [])
        theory = "\n".join(content) if isinstance(content, list) else slide.get("theory", "")
        
        db.collection("subtopics").add({
            "topicId": topic_id,
            "title": slide.get("title", f"Slide {i+1}"),
            "theory": theory,
            "order": i
        })
    print(f"    ✅ Uploaded {len(slides)} slides.")

def main():
    print("🚀 Starting Custom Flashcard Sync...")
    try:
        db = initialize_firebase()
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # 1. System Design
    subject_sd = get_subject_by_title(db, "SystemDesign")
    if subject_sd:
        print(f"\n📚 Subject: System Design (ID: {subject_sd.id})")
        sd_path = os.path.join(os.path.dirname(__file__), "SystemDesign")
        files = sorted([f for f in os.listdir(sd_path) if f.endswith(".json")])
        for f in files:
            process_file(db, subject_sd.id, sd_path, f)
    else:
        print("❌ Subject 'SystemDesign' not found in Firestore.")

    # 2. Computer Network
    subject_cn = get_subject_by_title(db, "Computer Network")
    if subject_cn:
        print(f"\n📚 Subject: Computer Network (ID: {subject_cn.id})")
        cn_path = os.path.join(os.path.dirname(__file__), "Computer Network")
        process_file(db, subject_cn.id, cn_path, "6_Routing&Switching.json")
    else:
        print("❌ Subject 'Computer Network' not found in Firestore.")

    print("\n🎉 Custom Sync Completed!")

if __name__ == "__main__":
    main()
