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

<<<<<<< HEAD
# ----------------------------
# Helper Functions
# ----------------------------

def get_subject_by_title(title):
    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
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

def get_subtopic_by_title(title, topic_id):
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

for subject in subjects:
    subject_title = subject["title"]
=======
for subject in subjects:

    subject_name = subject["name"]
>>>>>>> 793829a044bbbfecbea5faa84a7fd02994b67a3c
    subject_description = subject.get("description", "")

    subject_ref = db.collection("subjects").add({
        "name": subject_name,
        "description": subject_description
    })

    subject_id = subject_ref[1].id

    print(f"Created subject: {subject_name}")

    topics = subject.get("topics", [])

<<<<<<< HEAD
    # ----- Check if subject exists -----
    existing_subject = get_subject_by_title(subject_title)

    if existing_subject:
        subject_id = existing_subject.id
        print(f"⚠️  Subject already exists: {subject_title}")
    else:
        _, subject_ref = db.collection("subjects").add({
            "title": subject_title,
            "description": subject_description
        })
        subject_id = subject_ref.id
        print(f"✅ Created subject: {subject_title}")

    # ----- Handle Topics -----
    for topic in topics:
        topic_title = topic["title"]
        topic_description = topic.get("description", "")
        subtopics = topic.get("subtopics", [])
=======
    for topic in topics:
>>>>>>> 793829a044bbbfecbea5faa84a7fd02994b67a3c

        topic_ref = db.collection("topics").add({
            "title": topic["title"],
            "subjectId": subject_id
        })

<<<<<<< HEAD
        if existing_topic:
            topic_id = existing_topic.id
            print(f"   ⚠️  Topic already exists: {topic_title}")
        else:
            _, topic_ref = db.collection("topics").add({
                "title": topic_title,
                "description": topic_description,
                "subjectId": subject_id
            })
            topic_id = topic_ref.id
            print(f"   ✅ Created topic: {topic_title}")

        # ----- Handle Subtopics -----
        for subtopic in subtopics:
            subtopic_title = subtopic["title"]
            subtopic_theory = subtopic.get("theory", "")
            subtopic_images = subtopic.get("images", [])

            existing_subtopic = get_subtopic_by_title(subtopic_title, topic_id)

            if existing_subtopic:
                print(f"      ⚠️  Subtopic already exists: {subtopic_title}")
            else:
                db.collection("subtopics").add({
                    "title": subtopic_title,
                    "topicId": topic_id,
                    "theory": subtopic_theory,
                    "images": subtopic_images
                })
                print(f"      ✅ Created subtopic: {subtopic_title}")
=======
        topic_id = topic_ref[1].id

        print(f"  Created topic: {topic['title']}")

        subtopics = topic.get("subtopics", [])

        for sub in subtopics:

            db.collection("subtopics").add({
                "title": sub["title"],
                "theory": sub.get("theory", ""),
                "topicId": topic_id
            })
>>>>>>> 793829a044bbbfecbea5faa84a7fd02994b67a3c

            print(f"     Added subtopic: {sub['title']}")

print("\n🔥 Upload completed successfully")