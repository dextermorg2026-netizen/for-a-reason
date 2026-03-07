# 🚀 Firestore Data Upload Guide

This folder contains scripts to upload **Subjects**, **Topics**, **Subtopics**, **Questions**, and other data to Firebase Firestore automatically.

---

## 📋 Files Overview

| File | Purpose |
|------|---------|
| **subjects_topics.json** | Contains all subjects, topics, and subtopics with theory content |
| **questions.csv** | Contains quiz questions with options and difficulty levels |
| **upload_all.py** | 🌟 **RECOMMENDED** - Uploads everything (subjects, topics, subtopics, questions) in one go |
| **upload_subjects_topics.py** | (Alternative) Uploads only subjects, topics, and subtopics |
| **upload_questions.py** | (Alternative) Uploads only questions from CSV |

---

## ✅ Quick Start (No Effort Required!)

### Step 1: Edit Your Data

#### **For Content (Subjects, Topics, Subtopics):**
Edit `subjects_topics.json` and add your data like this:

```json
{
  "subjects": [
    {
      "title": "Your Subject Name",
      "description": "Subject description",
      "topics": [
        {
          "title": "Topic Title",
          "description": "Topic description",
          "subtopics": [
            {
              "title": "Subtopic Title",
              "theory": "Detailed explanation of the subtopic...",
              "images": []
            }
          ]
        }
      ]
    }
  ]
}
```

#### **For Questions:**
Edit `questions.csv` and add rows like this:

```csv
question,optionA,optionB,optionC,optionD,correctAnswer,topicId,difficulty,explanation
What is networking?,A concept,A field,A system,All of above,D,topic_id_here,easy,Networking is a field that studies data communication.
```

**Important CSV Fields:**
- `question`: The quiz question
- `optionA`, `optionB`, `optionC`, `optionD`: Answer choices
- `correctAnswer`: Which option (A, B, C, or D)
- `topicId`: ID of the topic this question belongs to
- `difficulty`: One of `easy`, `medium`, or `hard`
- `explanation`: Explanation for the correct answer

---

### Step 2: Run the Upload Script

Open PowerShell/Terminal in the `pythonFiles` folder and run:

```bash
python upload_all.py
```

That's it! 🎉 All your data will be uploaded automatically.

---

## 🔄 Alternative: Upload Individually

If you prefer to upload separately:

```bash
# Upload only subjects, topics, and subtopics
python upload_subjects_topics.py

# Upload only questions
python upload_questions.py
```

---

## 📊 Data Structure Reference

### Subjects
```json
{
  "title": "Computer Networks",
  "description": "Core networking concepts"
}
```

### Topics
```json
{
  "title": "OSI Model",
  "description": "7-layer architecture",
  "subjectId": "auto-linked"
}
```

### Subtopics
```json
{
  "title": "Physical Layer",
  "topicId": "auto-linked",
  "theory": "Detailed explanation...",
  "images": []
}
```

### Questions
```json
{
  "question": "How many layers in OSI?",
  "options": ["5", "6", "7", "8"],
  "correctAnswer": "7",
  "topicId": "auto-linked",
  "difficulty": "medium",
  "explanation": "Optional explanation"
}
```

---

## 🛡️ Features

✅ **Automatic Duplicate Prevention** - Won't re-upload existing data
✅ **Error Handling** - Shows clear error messages
✅ **Progress Tracking** - See what's being uploaded in real-time
✅ **No Manual IDs Required** - Firestore auto-generates IDs
✅ **Easy to Update** - Just edit JSON/CSV and re-run the script

---

## ⚠️ Important Notes

1. **Firebase Credentials:** The script uses `court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json` (already in folder)
2. **TopicId in Questions:** Must match an existing topic ID from your upload
3. **Difficulty Levels:** Use only `easy`, `medium`, or `hard` (case-insensitive)
4. **CSV Format:** Keep the header row and use commas as separators

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No module named firebase_admin" | Install: `pip install firebase-admin` |
| "File not found" | Make sure files are in the same folder as the script |
| "TopicId not found" | Ensure the topicId in CSV matches a topic you uploaded |
| "Connection error" | Check your internet connection and Firebase credentials |

---

## 📝 Example: Full Workflow

1. Edit `subjects_topics.json` with your subjects, topics, subtopics
2. Edit `questions.csv` with your quiz questions
3. Run: `python upload_all.py`
4. Check Firestore console to verify data was uploaded
5. Your frontend will automatically show all the data! 🎊

---

**That's it! No manual database work needed.** 🚀
