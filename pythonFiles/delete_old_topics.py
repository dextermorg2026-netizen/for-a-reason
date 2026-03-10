import firebase_admin
from firebase_admin import credentials, firestore
import os

# Paths
BASE_DIR = os.path.dirname(__file__)
cred_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")

# Initialize Firebase
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

SUBJECT_ID = "zq6b0kq2LGarmA6YacTy"

topics_ref = db.collection("subjects").document(SUBJECT_ID).collection("topics").stream()

for doc in topics_ref:
    print(f"Deleting topic: {doc.id}")
    db.collection("subjects").document(SUBJECT_ID).collection("topics").document(doc.id).delete()

print("✅ Old topics subcollection deleted.")