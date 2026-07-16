# Backend & Database Redesign TODO

This checklist outlines the roadmap to implement a dedicated **Express.js server**, **denormalize the Firestore database** to minimize read/write costs, and integrate **Redis** for high-speed caching.

---

## 📂 1. Database Schema Redesign (Denormalization)

Refactor the database collections to merge highly nested structures into single-read documents.

- [ ] **Define the New `users` Document Schema**
  - Add `progress` object (maps of completed quizzes and topics).
  - Add `activity` object (pre-calculated 28-day heatmap and weekly performance counters).
  - *Goal:* Remove all queries to the `quizAttempts` collection during dashboard load.
- [ ] **Define the New `topics` Document Schema**
  - Embed `subtopics` (slides and theory) directly as an array of objects inside the topic document.
  - *Goal:* Fetch a topic and all its content in a single read.
- [ ] **Define the `topicQuizzes` Document Schema**
  - Club all questions for a topic into a single document containing an array of questions.
  - *Goal:* Reduce quiz generation reads from $N$ separate documents to 1 document.
- [ ] **Write a Migration Script (`scripts/denormalizeDB.cjs`)**
  - Read legacy `subjects`, `topics`, `subtopics`, and `questions` collections.
  - Assemble the new denormalized documents and upload them to the new collections.
  - Migrate user records to inject the initialized `progress` and `activity` structures.

---

## 💻 2. Express.js Server Setup

Establish the new dedicated backend server environment.

- [ ] **Initialize Server Project**
  - Create a `server/` directory.
  - Initialize `package.json` and install dependencies: `express`, `cors`, `redis`, `firebase-admin`, `dotenv`.
- [ ] **Configure Firebase Admin SDK**
  - Setup authentication via the service account JSON (`court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json`).
  - Initialize the Firestore client on the server.
- [ ] **Configure Redis Client**
  - Establish connection to a local Redis server (or cloud instance) on start.
  - Implement basic health checks and reconnection listeners.

---

## ⚡ 3. API Endpoint Implementation

Implement Express routes to serve content, process submissions, and track standings.

- [ ] **GET `/api/subjects`**
  - Retrieve all subjects (cached in Redis).
- [ ] **GET `/api/subjects/:subjectId/topics`**
  - Retrieve all topics with embedded subtopics for a subject (cached in Redis).
- [ ] **GET `/api/quizzes/:topicId`**
  - Implement Cache-Aside:
    1. Check Redis for `quiz:topicId`.
    2. On Cache Hit: Return questions.
    3. On Cache Miss: Read `topicQuizzes` from Firestore, save to Redis with 24h TTL, and return.
- [ ] **POST `/api/quizzes/attempt`**
  - Receive user answers and calculate score/coins.
  - Write a log entry to `quizAttempts` (write-only historical ledger).
  - Perform an atomic write to update user stats on the `users` Firestore document (coins, streak, heatmap, weekly stats, progress).
  - Update user score in Redis Sorted Sets (`leaderboard:global` and `leaderboard:subject:<subjectId>`).
  - Evict stale user activity caches.
- [ ] **GET `/api/leaderboard` & `/api/leaderboard/:subjectId`**
  - Query Redis Sorted Sets using `ZREVRANGE` to return standings instantly (0 DB reads).
- [ ] **GET `/api/users/:userId/dashboard`**
  - Fetch the user document from Firestore (or Redis user cache) and return pre-calculated activity heatmap and stats.

---

## 🧠 4. Redis Cache & Invalidation Helpers

- [ ] **Write Cache Middleware**
  - Simple Express middleware to intercept GET requests and serve directly from Redis if keys exist.
- [ ] **Write Cache Invalidation Utility**
  - Function to clear specific keys (e.g., `quiz:topicId`) when an admin updates topic theory or questions.

---

## 🔌 5. Frontend Service Rewrite

Re-route the React app to hit your Express backend API instead of querying Firestore directly.

- [ ] **Configure API Client**
  - Set base API URL in `.env` (e.g., `VITE_API_URL=http://localhost:5000/api`).
- [ ] **Update `subjectService.js`**
  - Rewrite `getAllSubjects`, `getTopicsBySubject`, and `getSubtopicsByTopic` to hit `/api/subjects` and `/api/subjects/:subjectId/topics`.
- [ ] **Update `quizService.js`**
  - Rewrite quiz loading to call `/api/quizzes/:topicId`.
- [ ] **Update `statsService.js` & `streakService.js`**
  - Point dashboard telemetry requests to `/api/users/:userId/dashboard`.
- [ ] **Update `leaderboardService.js`**
  - Point leaderboard views to `/api/leaderboard`.
