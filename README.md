# QUIZZZZ  React + Firebase quiz app (frontend UI only)

This project is a **React (Vite)** frontend for a quiz platform with authentication, topicwise quizzes, history tracking, and (later) live quizzes and resource viewing. The backend data is expected to come from **Firebase (Firestore + Auth)**.

Below is a quick tour of the main files and folders so you can understand and navigate the codebase easily.

---

## Root

- **`package.json`**: NPM metadata and scripts (`dev`, `build`, `preview`) plus React/Vite/ESLint dependencies.
- **`index.html`**: Single HTML shell. Mounts React into `<div id="root">` and loads `src/index.js`.

---

## Entry + App shell (`src/`)

- **`src/index.js`**  
  - Vite entry file. Creates a React root and renders the app inside `#root`.  
  - Imports global styles from `src/styles/global.css` and the main `App` component from `src/app/App.jsx`.

- **`src/app/App.jsx`**  
  - Toplevel application shell.  
  - Wraps the app in `BrowserRouter`, `AuthProvider`, and `QuizProvider`.  
  - Renders a sticky header (`QUIZZZZ` logo + main nav), main content area, and footer.  
  - Uses the `routes` array from `src/app/routes.jsx` to render `Route` elements.

- **`src/app/routes.jsx`**  
  - Central route configuration for **React Router**.  
  - Imports all page components and **`ProtectedRoute`** for guarding authenticated paths.  
  - Routes include:  
    - Public: `/login`, `/signup`  
    - Protected: `/` (dashboard), `/subjects`, `/subjects/:subjectId/topics`, `/quiz`, `/quiz/:topicId`, `/quiz/result`, `/live`, `/live/result`, `/resources`, `/leaderboard`.

---

## Global styling (`src/styles/`)

- **`src/styles/global.css`**  
  - Global reset + base typography and background.  
  - Layout classes: `.app-shell`, `.app-header`, `.app-main`, `.app-footer`.  
  - Utility classes: `.page-card`, `.page-title`, `.page-subtitle`, `.pill`, `.grid-2`, `.muted`, `.badge`, `.table`, etc.  
  - Used across pages/components to keep the UI consistent.

---

## Context & hooks (`src/context/`, `src/hooks/`)

- **`src/context/AuthContext.jsx`**  
  - React context for authentication state.  
  - Exposes `user`, `loading`, and methods: `login`, `signup`, `logout`.  
  - Currently calls `authService` functions; you can wire these to Firebase Auth.

- **`src/context/QuizContext.jsx`**  
  - React context for the currently loaded quiz.  
  - Exposes `currentQuiz`, `loading`, `loadQuiz(params)`, `clearQuiz()`.  
  - Uses `quizService` under the hood; this is a good place to centralize quiz fetching logic.

- **`src/hooks/useAuth.js`**  
  - Small convenience hook that returns the `AuthContext` value.  
  - Use this in components/pages instead of `useContext(AuthContext)` directly.

- **`src/hooks/useQuiz.js`**  
  - Hook that returns the `QuizContext` value.  
  - Useful for any component that needs to read or manipulate the current quiz.

- **`src/hooks/useLeaderboard.js`**  
  - Custom hook to fetch leaderboard entries using `leaderboardService`.  
  - Manages `entries` and `loading` state and fetches data on mount.

---

## Common UI components (`src/components/common/`)

- **`Button.jsx`**  
  - Reusable button with basic styling and three variants: `primary`, `secondary`, `ghost`.  
  - Used across pages for consistent button appearance.

- **`Loader.jsx`**  
  - Simple circular loading spinner, centered inside its container.  
  - Intended for showing loading states while data is being fetched.

- **`Modal.jsx`**  
  - Basic modal overlay with a title, body content, and a Close button.  
  - Controlled via the `open` prop and an `onClose` callback.

- **`ProgressBar.jsx`**  
  - Horizontal progress bar component.  
  - Receives `value` and optional `max` (defaults to 100), and renders a gradient bar representing completion.

- **`ProtectedRoute.jsx`** (referenced in `routes.jsx`, typically lives here)  
  - Wraps around page components that require authentication.  
  - Reads from `AuthContext` / `useAuth` to decide whether to render the child or redirect (e.g., to `/login`).  
  - Ensures all protected routes stay behind login.

---

## Quiz UI components (`src/components/quiz/`)

- **`QuestionCard.jsx`**  
  - Displays a single quiz question and its options.  
  - Shows the question number, percentage complete, and uses `OptionItem` for each possible answer.  
  - Uses `ProgressBar` to visualize question progress.  
  - Props: `question`, `options`, `currentIndex`, `total`, `selectedId`, `onSelect`.

- **`OptionItem.jsx`**  
  - Single option row with clickable styling.  
  - Handles selected/correct states visually using different border/background colors.  
  - Props: `label`, `selected`, `correct`, `disabled`, `onClick`.

- **`ExplanationBox.jsx`**  
  - Shows explanation text for an answered question (e.g., why the correct answer is correct).  
  - Renders nothing when `explanation` is empty.

---

## Leaderboard components (`src/components/leaderboard/`)

- **`LeaderboardTable.jsx`**  
  - Simple table component for listing players with rank and score.  
  - Accepts `entries` as a prop; if none provided, shows demo data.

---

## Pages (`src/pages/`)

### Auth (`src/pages/auth/`)

- **`Login.jsx`**  
  - Login form UI (email + password).  
  - Calls `useAuth().login` with demo credentials for now.  
  - Intended to be hooked into Firebase Auth via `authService`.

- **`Signup.jsx`**  
  - Signup form UI (name, email, password).  
  - Calls `useAuth().signup` with demo data.  
  - Also meant to connect to Firebase Auth for real registration.

### Dashboard (`src/pages/dashboard/`)

- **`Dashboard.jsx`**  
  - Currently a **placeholder RFCE**: minimal heading + text.  
  - This is the landing page after login where youll later add history, scores, rank, and performance overview.

### Subjects & topics (`src/pages/subjects/`)

- **`Subjects.jsx`**  
  - UI to list available subjects (e.g., Math, Physics).  
  - Uses placeholder subject data and a button to View topics (you can wire this to navigation + Firestore via `subjectService`).  

- **`Topics.jsx`**  
  - UI to show topics under a selected subject.  
  - Uses static demo topics and a Start topic quiz button; wiring to `/quiz/:topicId` is handled via routes and navigation.

### Quiz flow (`src/pages/quiz/`)

- **`Quiz.jsx`**  
  - Core quiz screen: **one question per screen**, supports option selection and next/finish flow.  
  - Uses React Routers `useParams` to read `topicId` and `useNavigate` to redirect to the result screen.  
  - Fetches questions for a topic via `getQuestionsByTopic` from `subjectService`.  
  - Reads user info from `useAuth` to load previous attempts via `getUserAttemptsByTopic` (from `quizAttemptService`) and avoid alreadymastered questions.  
  - Tracks current question index, selected answer, and user answers; on completion it saves an attempt using `saveQuizAttempt` and navigates to `/quiz/result` with `score`/`total` in router state.  
  - Also shows immediate feedback + explanation after submitting each question.

- **`Result.jsx`**  
  - Quiz result page. Reads `score` and `total` from navigation state.  
  - Intended to show history, performance summary, and leaderboard impact (you can extend this over time).

### Live quiz (`src/pages/liveQuiz/`)

- **`LiveQuiz.jsx`**  
  - **Placeholder RFCE** for a future live quiz join/attempt screen.  
  - Kept minimal on purpose; realtime UI will be added in a later phase.

- **`LiveResult.jsx`**  
  - **Placeholder RFCE** for live quiz final standings/result view.

### Resources (`src/pages/resources/`)

- **`ResourceViewer.jsx`**  
  - **Placeholder RFCE** for topic resources and PDF viewing.  
  - The actual PDF viewer / resource list will be implemented later (phase for resource viewer).

### Leaderboard (`src/pages/leaderboard/`)

- **`LeaderboardPage.jsx`**  
  - Minimal placeholder that will later host a full leaderboard UI.  
  - Can use `LeaderboardTable` and data from `leaderboardService` when youre ready.

---

## Services (`src/services/`)

- **`firebase.js`**  
  - Intended to export a configured Firebase app + Firestore (`db`) instance.  
  - Currently you will set up and export your real Firebase configuration here (e.g. `initializeApp`, `getFirestore`).

- **`authService.js`**  
  - Abstraction over authentication actions.  
  - Functions: `getCurrentUser`, `login`, `signup`, `logout`.  
  - Currently returns demo data; replace logic with real Firebase Auth methods.

- **`subjectService.js`**  
  - Firestore data access for subjects, topics, and questions.  
  - `getAllSubjects()`  fetches all documents from the `subjects` collection.  
  - `getTopicsBySubject(subjectId)`  queries `topics` collection where `subjectId` matches.  
  - `getQuestionsByTopic(topicId)`  queries `questions` collection where `topicId` matches.

- **`quizService.js`**  
  - Generic quiz service used by `QuizContext`.  
  - `fetchQuiz(params)`  placeholder for fetching quiz metadata/questions.  
  - `submitQuiz(payload)`  placeholder for sending quiz results to a backend.

- **`quizAttemptService.js`**  
  - Firestore helpers for storing quiz attempts.  
  - `saveQuizAttempt(data)`  adds a new document to `quizAttempts`.  
  - `getUserAttemptsByTopic(userId, topicId)`  loads attempts for a specific user/topic pair.

- **`userService.js`**  
  - User/leaderboardrelated data fetching.  
  - `fetchLeaderboard()`  returns leaderboard entries (currently static demo data via `leaderboardService` export).

- **`liveQuizService.js`**  
  - Placeholder for realtime live quiz subscriptions (e.g., WebSocket or Firestore listeners).  
  - `subscribeToLiveQuiz()`  currently returns an unsubscribe noop; extend this for realtime rooms.

---

## Utilities (`src/utils/`)

- **`shuffle.js`**  
  - Implements an inplace FisherYates shuffle and returns a new shuffled array.  
  - Used for randomizing question order.

- **`calculateScore.js`**  
  - Takes an array of `{ selectedId, correctId }` objects and returns `{ score, total }`.  
  - Safely handles empty or missing entries.

- **`constants.js`**  
  - Holds simple appwide constants such as `APP_NAME = 'QUIZZZZ'`.  
  - Good place for centralizing magic strings/values.

---

## Assets (`src/assets/`)

- **`src/assets/images/`**  
  - Folder for image assets (currently contains a placeholder file so the folder is tracked).

- **`src/assets/icons/`**  
  - Folder for SVG/icon assets (also currently placeholder only).

---

## How to run

```bash
npm install       # once
npm run dev       # start Vite dev server
```

Then open the URL printed in the terminal (usually `http://localhost:5173`) to use the app. As you integrate Firebase, update the services (`firebase.js`, `authService.js`, `subjectService.js`, `quizAttemptService.js`, etc.) accordingly.**
