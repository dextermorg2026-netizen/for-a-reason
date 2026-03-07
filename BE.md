

---

# Backend Work Required (Firebase)

Your React frontend already fetches data from **Firestore** using these functions:

```javascript
getAllSubjects()
getTopicsBySubject(subjectId)
getSubtopicsByTopic(topicId)
getSubtopicById(subtopicId)
getQuestionsByTopic(topicId)
```

So the backend only needs to **populate Firestore with the correct collections and fields**.

---

# 1️⃣ Create Firestore Collections

Backend must ensure these **collections exist**:

```text
subjects
topics
subtopics
questions
quizAttempts
```

---

# 2️⃣ subjects Collection

Collection name:

```text
subjects
```

Each document should represent a **subject**.

Example:

```json
{
  "title": "Computer Networks",
  "description": "Networking fundamentals and protocols"
}
```

Example Firestore structure:

```text
subjects
   subjectId
      title
      description
```

The **document ID becomes the subjectId** used in the frontend.

---

# 3️⃣ topics Collection

Each topic must belong to a subject.

Required fields:

```json
{
  "title": "OSI Model",
  "subjectId": "subjectId"
}
```

Structure:

```text
topics
   topicId
      title
      subjectId
```

Important:

```text
subjectId must match the document ID in subjects
```

This is used by:

```javascript
getTopicsBySubject(subjectId)
```

---

# 4️⃣ subtopics Collection

Each topic contains multiple **subtopics**.

Required fields:

```json
{
  "title": "Physical Layer",
  "topicId": "topicId",
  "theory": "The physical layer is responsible for bit transmission...",
  "images": []
}
```

Structure:

```text
subtopics
   subtopicId
      title
      topicId
      theory
      images
```

Important:

```text
topicId must match the document ID in topics
```

Your **Theory Page reads the `theory` field**.

The `images` field is an **empty array by default** and can be populated with image URLs in the future.

---

# 5️⃣ questions Collection (For Quiz)

Each question belongs to a **topic**.

Example:

```json
{
  "question": "How many layers are in the OSI model?",
  "options": ["5", "6", "7", "8"],
  "correctAnswer": "7",
  "topicId": "topicId",
  "difficulty": "medium"
}
```

Structure:

```text
questions
   questionId
      question
      options
      correctAnswer
      topicId
      difficulty
```

Important:

```text
difficulty must be one of: "easy", "medium", "hard"
```

Used by:

```javascript
getQuestionsByTopic(topicId)
```

---

# 6️⃣ quizAttempts Collection (Already Used)

Your progress system expects:

```json
{
  "userId": "userId",
  "topicId": "topicId",
  "correctQuestionIds": [],
  "wrongQuestionIds": [],
  "timestamp": ""
}
```

This is used by:

```javascript
getTopicProgress()
```

---

# 7️⃣ Recommended Method for Backend

Backend should upload content using:

```text
Python script + JSON files
```

Example JSON structure:

```json
{
  "subject": "Computer Networks",
  "topics": [
    {
      "title": "OSI Model",
      "subtopics": [
        {
          "title": "Physical Layer",
          "theory": "Explanation..."
        }
      ]
    }
  ]
}
```

The script will insert everything into Firestore.

---

# 8️⃣ Once Backend Adds Data

Your website will automatically show:

```text
Subjects Page
     ↓
Topics Page
     ↓
Subtopics Dropdown
     ↓
Theory Page
     ↓
Quiz
```

No frontend changes required.

---

# 9️⃣ Backend Checklist

Tell the backend developer to complete these tasks:

```text
1. Ensure Firestore database is enabled
2. Create collections: subjects, topics, subtopics, questions
3. Insert subjects data
4. Insert topics with subjectId
5. Insert subtopics with topicId + theory
6. Insert quiz questions with topicId
7. Ensure quizAttempts collection exists for progress tracking
8. Upload content using Python script or Firebase admin SDK
```

---

✅ After backend finishes this, **your entire learning flow will work automatically**.

---

If you want, I can also show you **one small improvement in your database structure that will make your site 10× faster when it scales to thousands of topics**.