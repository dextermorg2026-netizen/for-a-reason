import firebase_admin
from firebase_admin import credentials, firestore
import os

BASE_DIR = os.path.dirname(__file__)

cred = credentials.Certificate(
os.path.join(BASE_DIR,"court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")
)

firebase_admin.initialize_app(cred)

db = firestore.client()

subtopics_ref = db.collection("subtopics").stream()

topic_subtopics = {}

# group subtopics by topicId
for doc in subtopics_ref:
    data = doc.to_dict()
    topicId = data["topicId"]

    if topicId not in topic_subtopics:
        topic_subtopics[topicId] = []

    topic_subtopics[topicId].append((doc.id,data["title"]))


# assign order
for topicId, subs in topic_subtopics.items():

    # sort alphabetically first (temporary order)
    subs_sorted = sorted(subs, key=lambda x: x[1])

    for index,(docId,title) in enumerate(subs_sorted, start=1):

        db.collection("subtopics").document(docId).update({
            "order": index
        })

        print(f"Updated {title} → order {index}")

print("✅ Subtopic ordering complete")