import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# Firebase setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cred = credentials.Certificate(
    os.path.join(BASE_DIR, "firebase-key.json")
)

firebase_admin.initialize_app(cred)

db = firestore.client()

# Load JSON
with open(
    os.path.join(BASE_DIR, "content/computer_networks.json"),
    "r",
    encoding="utf-8"
) as f:
    data = json.load(f)

# Create Subject
subject_data = data["subject"]

subject_ref = db.collection("subjects").add(subject_data)
subject_id = subject_ref[1].id

print("Created subject:", subject_id)

# Create Topics
for topic in data["topics"]:

    topic_ref = db.collection("topics").add({
        "title": topic["title"],
        "subjectId": subject_id
    })

    topic_id = topic_ref[1].id

    print("  Topic:", topic["title"])

    # Create Subtopics
    for sub in topic["subtopics"]:

        db.collection("subtopics").add({
            "title": sub["title"],
            "topicId": topic_id,
            "theory": sub["theory"]
        })

        print("     Subtopic:", sub["title"])

print("Upload complete!")