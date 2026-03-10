import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# Paths
BASE_DIR = os.path.dirname(__file__)
cred_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")
json_path = os.path.join(BASE_DIR, "cn_topics.json")

# Initialize Firebase
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

SUBJECT_ID = "zq6b0kq2LGarmA6YacTy"

# Load topics
with open(json_path, "r", encoding="utf-8") as f:
    topics = json.load(f)

for topic in topics:

    topic_ref = db.collection("topics").document()

    topic_ref.set({
        "title": topic["title"],
        "description": topic["description"],
        "subjectId": SUBJECT_ID
    })

    topic_id = topic_ref.id

    # upload subtopics
    for sub in topic["subtopics"]:

        db.collection("subtopics").add({
            "title": sub["title"],
            "topicId": topic_id,
            "theory": sub["theory"],
            "images": sub.get("images", [])
        })

    print(f"Uploaded topic: {topic['title']}")

print("✅ Topics + Subtopics uploaded successfully")