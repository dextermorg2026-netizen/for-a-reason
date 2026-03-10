import firebase_admin
from firebase_admin import credentials, firestore
import json

# Initialize Firebase using service account key
cred = credentials.Certificate("court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")
firebase_admin.initialize_app(cred)

# Connect to Firestore
db = firestore.client()

# File containing questions
FILE_PATH = "cn_questions.jsonl"

# Firestore batch limit
BATCH_SIZE = 500


def upload_questions():
    batch = db.batch()
    batch_count = 0
    total_uploaded = 0

    with open(FILE_PATH, "r", encoding="utf-8") as file:
        for line in file:
            question = json.loads(line)

            # Create new document in questions collection
            doc_ref = db.collection("questions").document()

            batch.set(doc_ref, question)

            batch_count += 1
            total_uploaded += 1

            # Commit batch every 500 writes
            if batch_count == BATCH_SIZE:
                batch.commit()
                print(f"Uploaded {total_uploaded} questions...")
                batch = db.batch()
                batch_count = 0

    # Commit remaining documents
    if batch_count > 0:
        batch.commit()

    print(f"\n✅ Upload complete! Total questions uploaded: {total_uploaded}")


if __name__ == "__main__":
    upload_questions()