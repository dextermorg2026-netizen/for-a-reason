import firebase_admin
from firebase_admin import credentials, firestore
import os

BASE_DIR = os.path.dirname(__file__)
key_path = os.path.join(BASE_DIR, "firebase-key.json")
cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

subjects = db.collection("subjects").stream()
print("📋 Current Subjects in Firestore:")
for s in subjects:
    print(f"- {s.to_dict().get('title')} (ID: {s.id})")
