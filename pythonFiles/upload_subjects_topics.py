import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# ----------------------------
# Initialize Firebase
# ----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")

cred = credentials.Certificate(key_path)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ----------------------------
# Load JSON
# ----------------------------

json_path = os.path.join(BASE_DIR, "subjects_topics.json")

with open(json_path, "r", encoding="utf-8") as file:
    data = json.load(file)

subjects = data.get("subjects", [])

# ----------------------------
# Helper Functions
# ----------------------------

def get_subject_by_name(name):
    query = db.collection("subjects").where("name", "==", name).limit(1).stream()
    docs = list(query)
    return docs[0] if docs else None

def get_topic_by_title(title, subject_id):
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

for subject in subjects:
    subject_name = subject["name"]
    subject_description = subject.get("description", "")
    topics = subject.get("topics", [])

    # ----- Check if subject exists -----
    existing_subject = get_subject_by_name(subject_name)

    if existing_subject:
        subject_id = existing_subject.id
        print(f"⚠ Subject already exists: {subject_name}")
    else:
        subject_ref = db.collection("subjects").add({
            "name": subject_name,
            "description": subject_description
        })
        subject_id = subject_ref[1].id
        print(f"✅ Created subject: {subject_name}")

    # ----- Handle Topics -----
    for topic in topics:
        topic_title = topic["title"]
        topic_description = topic.get("description", "")

        existing_topic = get_topic_by_title(topic_title, subject_id)

        if existing_topic:
            print(f"   ⚠ Topic already exists: {topic_title}")
        else:
            db.collection("topics").add({
                "title": topic_title,
                "description": topic_description,
                "subjectId": subject_id,
                "questionCount": 0
            })
            print(f"   ➜ Created topic: {topic_title}")

print("\n🔥 Upload process completed successfully!")