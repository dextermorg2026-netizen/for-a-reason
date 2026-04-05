# QUIZZZZ Data Format Documentation

This document outlines the data formats used in the QUIZZZZ application for storing subjects, topics, subtopics, and questions in Firebase Firestore.

## Table of Contents
1. [Firebase Collections Structure](#firebase-collections-structure)
2. [JSON Import Formats](#json-import-formats)
3. [CSV Question Format](#csv-question-format)
4. [Upload Scripts](#upload-scripts)

---

## Firebase Collections Structure

### 1. subjects Collection
Each subject document contains:
```json
{
  "id": "auto-generated-firestore-id",
  "title": "Computer Networks",
  "description": "Core networking concepts"
}
```

### 2. topics Collection
Each topic document contains:
```json
{
  "id": "auto-generated-firestore-id",
  "title": "Network Basics",
  "description": "Introduction to networking",
  "subjectId": "reference-to-parent-subject-id"
}
```

### 3. subtopics Collection
Each subtopic document contains:
```json
{
  "id": "auto-generated-firestore-id",
  "title": "What is a Network?",
  "theory": "A network is a group of interconnected devices that can communicate with each other through a set of rules called protocols.",
  "topicId": "reference-to-parent-topic-id"
}
```

### 4. questions Collection
Each question document contains:
```json
{
  "id": "auto-generated-firestore-id",
  "question": "Which protocol is used to assign IP addresses automatically?",
  "options": [
    "FTP",
    "HTTP",
    "DHCP",
    "SMTP"
  ],
  "correctAnswer": "C",
  "topicId": "reference-to-parent-topic-id",
  "difficulty": "easy",
  "explanation": "DHCP assigns IP addresses dynamically."
}
```

---

## JSON Import Formats

### subjects_topics.json Format
Used by `upload_subjects_topics.py` to import subjects, topics, and subtopics.

```json
{
  "subjects": [
    {
      "title": "Computer Networks",
      "description": "Core networking concepts",
      "topics": [
        {
          "title": "Network Basics",
          "description": "Introduction to networking",
          "subtopics": [
            {
              "title": "What is a Network?",
              "theory": "A network is a group of interconnected devices that can communicate with each other through a set of rules called protocols."
            },
            {
              "title": "Types of Networks",
              "theory": "Networks can be classified as LAN, MAN, WAN, etc."
            }
          ]
        },
        {
          "title": "OSI Model",
          "description": "7-layer architecture",
          "subtopics": [
            {
              "title": "Physical Layer",
              "theory": "The physical layer is responsible for the transmission of unstructured raw data between a computer and a physical transmission medium."
            },
            {
              "title": "Data Link Layer",
              "theory": "The data link layer is responsible for the reliable transmission of data frames between nodes over a physical network link."
            }
          ]
        }
      ]
    },
    {
      "title": "Operating Systems",
      "description": "Core OS concepts",
      "topics": [
        {
          "title": "Process Management",
          "description": "Process lifecycle and scheduling",
          "subtopics": [
            {
              "title": "Process States",
              "theory": "Processes can exist in various states: new, ready, running, waiting, and terminated."
            }
          ]
        }
      ]
    }
  ]
}
```

### Alternative Content JSON Format
Used by `upload_content.py` (alternative format for content).

```json
{
  "subject": {
    "title": "Computer Networks",
    "description": "Learn networking fundamentals"
  },
  "topics": [
    {
      "title": "OSI Model",
      "subtopics": [
        {
          "title": "Introduction to OSI",
          "theory": "OSI model divides networking into 7 layers..."
        },
        {
          "title": "Physical Layer",
          "theory": "Physical layer handles bit transmission..."
        }
      ]
    },
    {
      "title": "TCP/IP Model",
      "subtopics": [
        {
          "title": "Overview",
          "theory": "TCP/IP model is a 4-layer architecture..."
        }
      ]
    }
  ]
}
```

---

## CSV Question Format

### questions.csv Format
Used by `upload_questions.py` to import questions.

CSV Header:
```
question,optionA,optionB,optionC,optionD,correctAnswer,topicId,difficulty,explanation
```

### Field Descriptions:
- **question**: The question text
- **optionA, optionB, optionC, optionD**: The four multiple choice options
- **correctAnswer**: The correct option (A, B, C, or D)
- **topicId**: The Firestore ID of the topic this question belongs to
- **difficulty**: Difficulty level (easy, medium, hard)
- **explanation**: Optional explanation for the correct answer

### Example CSV Rows:
```
question,optionA,optionB,optionC,optionD,correctAnswer,topicId,difficulty,explanation
Which protocol is used to assign IP addresses automatically?,FTP,HTTP,DHCP,SMTP,C,hM5xIfNCBrexutJ83arj,easy,DHCP assigns IP addresses dynamically.
Which device operates at the Data Link Layer?,Router,Switch,Hub,Repeater,B,hM5xIfNCBrexutJ83arj,medium,A switch operates at Layer 2.
What does TCP stand for?,Transmission Control Protocol,Transfer Control Protocol,Transmission Communication Process,Transport Control Protocol,A,hM5xIfNCBrexutJ83arj,easy,TCP stands for Transmission Control Protocol.
```

### Important Notes for Questions:
1. **correctAnswer** must be A, B, C, or D (corresponding to optionA, optionB, etc.)
2. **topicId** must be a valid Firestore document ID from the topics collection
3. **difficulty** should be lowercase: "easy", "medium", or "hard"
4. **explanation** is optional but recommended for better learning experience
5. All fields except explanation are required

---

## Upload Scripts

### Available Scripts:
1. **upload_subjects_topics.py**: Uploads subjects, topics, and subtopics from `subjects_topics.json`
2. **upload_questions.py**: Uploads questions from `questions.csv`
3. **upload_content.py**: Alternative content upload from JSON files in `content/` folder
4. **upload_all.py**: Runs all upload scripts in sequence

### Usage:
```bash
# Upload subjects, topics, and subtopics
python upload_subjects_topics.py

# Upload questions
python upload_questions.py

# Upload all data
python upload_all.py
```

### Firebase Setup Requirements:
- Firebase Admin SDK key file: `firebase-key.json`
- Proper Firestore security rules configured
- Collections will be created automatically if they don't exist

---

## Creating New Content

### For Subjects/Topics/Subtopics:
1. Edit `subjects_topics.json` following the JSON format above
2. Run `python upload_subjects_topics.py`

### For Questions:
1. Edit `questions.csv` following the CSV format above
2. Make sure `topicId` matches existing topic IDs in Firestore
3. Run `python upload_questions.py`

### Tips for Content Creation:
- Keep question text clear and concise
- Ensure options are distinct and plausible
- Include explanations for better learning
- Use consistent difficulty levels
- Test questions for clarity and accuracy

---

*Last updated: March 8, 2026*</content>
<parameter name="filePath">c:\Users\Rohit\OneDrive\Documents\Projects\QUIZZZZ\pythonFiles\format.md