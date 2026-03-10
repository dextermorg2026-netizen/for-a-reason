import firebase_admin
from firebase_admin import credentials, firestore

# 🔑 Your firebase key file
cred = credentials.Certificate("court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")

firebase_admin.initialize_app(cred)

db = firestore.client()

# your System Design subjectId
SYSTEM_DESIGN_ID = "sk0nCzNXu5YyczvxY9gP"

questions_ref = db.collection("questions")
docs = questions_ref.stream()

updated = 0

for doc in docs:
    data = doc.to_dict()

    if data.get("subject") == "SystemDesign":
        doc.reference.update({
            "subjectId": SYSTEM_DESIGN_ID
        })
        updated += 1

print(f"✅ Updated {updated} quiz documents with subjectId")