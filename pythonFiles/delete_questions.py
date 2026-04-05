import firebase_admin
from firebase_admin import credentials, firestore
import os

# ----------------------------
# Firebase Initialization
# ----------------------------

def initialize_firebase():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    key_path = os.path.join(
        BASE_DIR,
        "firebase-key.json"
    )

    cred = credentials.Certificate(key_path)

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    return firestore.client()


# ----------------------------
# Delete Questions Collection
# ----------------------------

def delete_all_questions(db):
    collection_ref = db.collection("questions")

    docs = collection_ref.stream()

    batch = db.batch()
    count = 0
    total_deleted = 0

    print("⚠️ WARNING: You are about to delete ALL questions.")
    confirm = input("Type 'DELETE' to confirm: ")

    if confirm != "DELETE":
        print("❌ Operation cancelled.")
        return

    print("\n🗑 Deleting questions...\n")

    for doc in docs:
        batch.delete(doc.reference)
        count += 1
        total_deleted += 1

        # Firestore batch limit ~500
        if count == 400:
            batch.commit()
            print(f"Deleted {total_deleted} so far...")
            batch = db.batch()
            count = 0

    # Commit remaining
    if count > 0:
        batch.commit()

    print("\n✅ Deletion complete")
    print(f"Total deleted: {total_deleted}")


# ----------------------------
# Main
# ----------------------------

def main():
    print("🚀 Delete Questions Script")
    print("=" * 40)

    db = initialize_firebase()
    delete_all_questions(db)


if __name__ == "__main__":
    main()