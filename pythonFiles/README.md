# 🚀 QUIZZZZ Firestore Data Upload Guide

This folder contains clean, organized scripts to upload **Subjects**, **Topics**, **Subtopics**, and **Questions** to Firebase Firestore automatically.

---

## 📋 Files Overview

| File | Purpose |
|------|---------|
| **format.md** | 📖 **MUST READ** - Complete data format documentation for all content types |
| **subjects_topics.json** | Contains all subjects, topics, and subtopics with theory content |
| **subjects_topics_template.json** | 📋 **TEMPLATE** - Full example with sample educational content |
| **subjects_topics_minimal.json** | 📋 **QUICK START** - Minimal template for creating your own content |
| **questions.csv** | Contains quiz questions with options and difficulty levels |
| **upload_all.py** | 🌟 **RECOMMENDED** - Uploads everything in one go |
| **upload_content.py** | Uploads subjects, topics, and subtopics together |
| **upload_subjects.py** | Uploads only subjects |
| **upload_topics.py** | Uploads only topics (requires subjects to exist) |
| **upload_subtopics.py** | Uploads only subtopics (requires topics to exist) |
| **upload_questions.py** | Uploads only questions from CSV |
| **firebase-key.json** | Firebase service account key (keep secure!) |

---

## ✅ Quick Start

### Step 1: Read the Format Guide
**IMPORTANT:** Before creating any data, read `format.md` for complete format specifications and examples.

### Step 1.5: Use Templates (Optional)
- **`subjects_topics_minimal.json`** - Copy this for a quick start with minimal structure
- **`subjects_topics_template.json`** - Copy this for a full example with sample content

### Step 2: Edit Your Data

#### **For Content (Subjects, Topics, Subtopics):**
Edit `subjects_topics.json` following the format in `format.md`.

#### **For Questions:**
Edit `questions.csv` following the CSV format in `format.md`.

### Step 3: Upload Data

#### **Option A: Upload Everything (Recommended)**
```bash
python upload_all.py
```

#### **Option B: Upload Content Together**
```bash
python upload_content.py
```

#### **Option C: Upload Individually (Maximum Control)**
```bash
# Upload in this order (dependencies matter!)
python upload_subjects.py     # 1. Upload subjects first
python upload_topics.py       # 2. Upload topics (needs subjects)
python upload_subtopics.py    # 3. Upload subtopics (needs topics)
python upload_questions.py    # 4. Upload questions (needs topics)
```

---

## 🔧 Script Details

### upload_all.py
- Runs both content and questions upload scripts sequentially
- Provides a summary of what was uploaded
- **Best for complete data refreshes**

### upload_content.py
- Uploads subjects, topics, and subtopics from `subjects_topics.json`
- Checks for duplicates to avoid re-uploading existing content
- Validates data before upload

### Individual Upload Scripts

#### upload_subjects.py
- Uploads only subjects from `subjects_topics.json`
- **Run this first** when uploading individually

#### upload_topics.py
- Uploads only topics from `subjects_topics.json`
- **Requires subjects to exist** - automatically finds subject IDs by title
- **Run after upload_subjects.py**

#### upload_subtopics.py
- Uploads only subtopics from `subjects_topics.json`
- **Requires topics to exist** - automatically finds topic IDs by title
- **Run after upload_topics.py**

#### upload_questions.py
- Uploads questions from `questions.csv`
- **Requires topics to exist** for topicId validation
- Validates CSV format and required fields

### Dependencies
```
upload_subjects.py     → None
upload_topics.py       → Requires subjects
upload_subtopics.py    → Requires topics
upload_questions.py    → Requires topics
```

---

## 📊 Data Validation

All scripts include comprehensive validation:
- ✅ Required fields checking
- ✅ Data type validation
- ✅ Duplicate detection
- ✅ Firebase connection verification
- ✅ Detailed error reporting

---

## 🛠 Troubleshooting

### Common Issues:
1. **"Firebase key file not found"** → Ensure `firebase-key.json` exists
2. **"subjects_topics.json not found"** → Create the file following `format.md`
3. **"questions.csv not found"** → Create the CSV file following `format.md`
4. **Permission errors** → Check Firebase security rules

### Getting Help:
- Check `format.md` for data format requirements
- Run individual scripts to isolate issues
- Check console output for detailed error messages

---

## � Templates

### subjects_topics_minimal.json
A minimal template to get you started quickly. Copy this file and rename it to `subjects_topics.json`, then fill in your content.

### subjects_topics_template.json
A comprehensive template with real educational examples across Computer Science, Mathematics, and Physics subjects. Use this as a reference for content structure and depth.

### How to Use Templates:
```bash
# Option 1: Start with minimal template
cp subjects_topics_minimal.json subjects_topics.json

# Option 2: Use full template as reference
cp subjects_topics_template.json subjects_topics.json
# Then edit the content to match your needs
```

---

1. **Always read `format.md` first** - It contains all format specifications
2. **Test with small data sets** - Upload a few items first to verify formats
3. **Use upload_all.py** for complete uploads
4. **Keep backups** of your data files
5. **Validate data** before running upload scripts

---

*Happy uploading! 🎉*

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

1. **Firebase Credentials:** The script uses `firebase-key.json` (already in folder)
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
