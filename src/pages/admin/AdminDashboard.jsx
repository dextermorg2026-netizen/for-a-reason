import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createLiveQuiz, startLiveQuiz, finishLiveQuiz } from '../../services/liveQuizService';
import { createGlobalNotification } from '../../services/notificationService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeQuizzes, setActiveQuizzes] = useState([]);

  useEffect(() => {
    // Listen for quizzes that are waiting or playing
    const q = query(collection(db, 'liveQuizzes'), where('status', 'in', ['waiting', 'playing']));
    const unsub = onSnapshot(q, (snap) => {
      const quizzes = [];
      snap.forEach(doc => quizzes.push({ id: doc.id, ...doc.data() }));
      setActiveQuizzes(quizzes);
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleCreateQuiz = async () => {
    if (!file) {
      setMessage('Please select a JSON file first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const fileText = await file.text();
      const questions = JSON.parse(fileText);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('JSON must be a non-empty array of questions.');
      }

      // Generate 6-letter room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Upload to Firestore
      await createLiveQuiz(roomCode, questions, 'General', 1200);

      // Send Global Notification
      await createGlobalNotification(
        'Live Quiz Alert!',
        `A new quiz has started. Room Code: ${roomCode}`,
        roomCode
      );

      setMessage(`✅ Success! Quiz created. Room Code: ${roomCode}`);
      setFile(null);
      // reset file input
      document.getElementById('json-upload').value = '';

    } catch (error) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    if(window.confirm(`Start quiz ${id}?`)) {
      await startLiveQuiz(id);
    }
  };

  const handleEnd = async (id) => {
    if(window.confirm(`End quiz ${id}?`)) {
      await finishLiveQuiz(id);
    }
  };

  return (
    <div className="page-card max-w-4xl mx-auto mt-8 p-6">
      <h1 className="page-title text-3xl font-semibold mb-2">Admin Dashboard</h1>
      <p className="page-subtitle text-gray-500 mb-8">
        Welcome back, {userProfile?.name || 'Admin'}! Manage quizzes and questions here.
      </p>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm" style={{ gridColumn: '1 / -1' }}>
          <h2 className="text-xl font-medium mb-4">Active Live Quizzes</h2>
          {activeQuizzes.length === 0 ? (
            <p className="text-gray-500">No active quizzes found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Room Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeQuizzes.map(quiz => (
                    <tr key={quiz.id} className="border-b">
                      <td className="py-2 font-semibold">{quiz.id}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-sm ${quiz.status === 'playing' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {quiz.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="flex gap-2 py-2">
                        {quiz.status === 'waiting' && (
                          <button onClick={() => handleStart(quiz.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Start</button>
                        )}
                        <button onClick={() => handleEnd(quiz.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">End</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-medium mb-2">Live Quiz Generator</h2>
          <p className="text-gray-600 mb-4">
            Upload a JSON file containing the questions, generate a room code, and notify all users.
          </p>
          
          <input 
            type="file" 
            id="json-upload"
            accept=".json" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
          />

          <button 
            onClick={handleCreateQuiz}
            disabled={loading || !file}
            className={`px-4 py-2 rounded-md text-white transition ${loading || !file ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Creating...' : 'Create Live Quiz'}
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-medium mb-2">Question Uploader</h2>
          <p className="text-gray-600 mb-4">
            (Coming soon) Add or edit individual questions manually.
          </p>
          <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
            Manage Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
