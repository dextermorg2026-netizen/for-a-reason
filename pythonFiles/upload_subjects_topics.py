import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk.json")

cred = credentials.Certificate(key_path)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

json_path = os.path.join(BASE_DIR, "subjects_topics.json")

with open(json_path, "r", encoding="utf-8") as file:
    data = json.load(file)

subjects = data.get("subjects", [])

for subject in subjects:

    subject_name = subject["name"]
    subject_description = subject.get("description", "")

    subject_ref = db.collection("subjects").add({
        "name": subject_name,
        "description": subject_description
    })

    subject_id = subject_ref[1].id

    print(f"Created subject: {subject_name}")

    topics = subject.get("topics", [])

    for topic in topics:

        topic_ref = db.collection("topics").add({
            "title": topic["title"],
            "subjectId": subject_id
        })

        topic_id = topic_ref[1].id

        print(f"  Created topic: {topic['title']}")

        subtopics = topic.get("subtopics", [])

        for sub in subtopics:

            db.collection("subtopics").add({
                "title": sub["title"],
                "theory": sub.get("theory", ""),
                "topicId": topic_id
            })

            print(f"     Added subtopic: {sub['title']}")

print("\n🔥 Upload completed successfully")