import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
import csv

# ----------------------------
# Initialize Firebase
# ----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(BASE_DIR, "court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")

cred = credentials.Certificate(key_path)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ----------------------------
# Helper Functions
# ----------------------------

def get_subject_by_title(title):
    """Check if subject exists by title"""
    query = db.collection("subjects").where("title", "==", title).limit(1).stream()
    docs = list(query)
    return docs[0] if docs else None

def get_topic_by_title(title, subject_id):
    """Check if topic exists"""
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
    """Check if subtopic exists"""
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
# Upload Subjects, Topics, Subtopics
# ----------------------------

def upload_content():
    """Upload subjects, topics, and subtopics from JSON"""
    
    json_path = os.path.join(BASE_DIR, "subjects_topics.json")
    
    try:
        with open(json_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        
        subjects_list = data.get("subjects", [])
        
        for subject in subjects_list:
            subject_title = subject["title"]
            subject_description = subject.get("description", "")
            topics_list = subject.get("topics", [])
            
            # ----- Upload/Check Subject -----
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
            
            # ----- Upload/Check Topics -----
            for topic in topics_list:
                topic_title = topic["title"]
                topic_description = topic.get("description", "")
                subtopics_list = topic.get("subtopics", [])
                
                existing_topic = get_topic_by_title(topic_title, subject_id)
                
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
                
                # ----- Upload/Check Subtopics -----
                for subtopic in subtopics_list:
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
        
        print("\n🔥 Content upload completed!")
        return True
        
    except FileNotFoundError:
        print(f"❌ Error: {json_path} not found!")
        return False
    except Exception as e:
        print(f"❌ Error uploading content: {str(e)}")
        return False

# ----------------------------
# Upload Questions from CSV
# ----------------------------

def upload_questions():
    """Upload questions from CSV file"""
    
    csv_path = os.path.join(BASE_DIR, "questions.csv")
    
    try:
        if not os.path.exists(csv_path):
            print(f"⚠️  Warning: {csv_path} not found. Skipping question upload.")
            return False
        
        with open(csv_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            
            question_count = 0
            for row in reader:
                question_data = {
                    "question": row.get("question", ""),
                    "options": [
                        row.get("optionA", ""),
                        row.get("optionB", ""),
                        row.get("optionC", ""),
                        row.get("optionD", "")
                    ],
                    "correctAnswer": row.get("correctAnswer", ""),
                    "topicId": row.get("topicId", ""),
                    "difficulty": row.get("difficulty", "medium").lower()
                }
                
                # Optional fields
                if "explanation" in row and row["explanation"]:
                    question_data["explanation"] = row["explanation"]
                
                db.collection("questions").add(question_data)
                question_count += 1
            
            print(f"✅ Uploaded {question_count} questions!")
            return True
            
    except Exception as e:
        print(f"❌ Error uploading questions: {str(e)}")
        return False

# ----------------------------
# Main Execution
# ----------------------------

if __name__ == "__main__":
    print("🚀 Starting Firestore data upload...\n")
    
    print("📚 Uploading content (subjects, topics, subtopics)...")
    content_success = upload_content()
    
    print("\n📝 Uploading questions...")
    questions_success = upload_questions()
    
    if content_success and questions_success:
        print("\n🎉 All data uploaded successfully!")
    else:
        print("\n⚠️  Some uploads were skipped or failed. Check the errors above.")
