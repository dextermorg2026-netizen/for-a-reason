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
    <main className="max-w-4xl mx-auto pb-20">
      <section className="mb-12">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-error pulse-emerald"></span>
            <span className="font-headline text-[10px] font-bold text-error uppercase tracking-[0.3em]">Root_Access :: Verified</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight uppercase">Admin Operations Codec</h1>
          <p className="text-slate-500 font-label text-xs uppercase tracking-[0.4em]">SYSTEM_OVERRIDE // {userProfile?.name?.toUpperCase() || 'OPERATOR'}</p>
        </div>
      </section>

      {message && (
        <div className={`p-4 mb-8 bg-[#131313] asymmetric-card-small hud-border flex items-center gap-4 ${message.includes('Success') ? 'border-tertiary/30 shadow-[0_0_15px_rgba(78,222,163,0.1)]' : 'border-error/30 shadow-[0_0_15px_rgba(255,82,82,0.1)]'}`}>
          <span className={`material-symbols-outlined text-xl ${message.includes('Success') ? 'text-tertiary' : 'text-error'}`}>
             {message.includes('Success') ? 'verified_user' : 'warning'}
          </span>
          <p className={`font-headline text-xs uppercase tracking-widest ${message.includes('Success') ? 'text-tertiary' : 'text-error'}`}>
            {message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#131313] asymmetric-card hud-border p-8" style={{ gridColumn: '1 / -1' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-xl">satellite_alt</span>
            <h2 className="font-headline font-semibold text-lg uppercase tracking-widest text-on-surface">Active Live Missions</h2>
          </div>
          {activeQuizzes.length === 0 ? (
            <div className="p-6 border border-white/5 bg-surface-container-low/50 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-slate-600 text-3xl">portable_wifi_off</span>
              <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-slate-500">No signals detected in sector</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 font-headline font-semibold text-[10px] text-slate-500 uppercase tracking-widest">Room Code</th>
                    <th className="py-4 font-headline font-semibold text-[10px] text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="py-4 font-headline font-semibold text-[10px] text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeQuizzes.map(quiz => (
                    <tr key={quiz.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                      <td className="py-4">
                        <span className="font-mono text-sm tracking-[0.2em] text-on-surface bg-surface-container-low px-3 py-1 border border-white/10">{quiz.id}</span>
                      </td>
                      <td className="py-4">
                        <span className={`font-headline text-[9px] px-3 py-1 font-semibold uppercase tracking-widest border ${
                          quiz.status === 'playing' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-secondary/10 text-secondary border-secondary/20'
                        }`}>
                          {quiz.status}
                        </span>
                      </td>
                      <td className="py-4 flex justify-end gap-2">
                        {quiz.status === 'waiting' && (
                          <button onClick={() => handleStart(quiz.id)} className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary font-headline font-semibold text-[10px] uppercase tracking-widest asymmetric-card hover:bg-primary/20 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">play_arrow</span> Start
                          </button>
                        )}
                        <button onClick={() => handleEnd(quiz.id)} className="px-4 py-2 bg-error/10 border border-error/30 text-error font-headline font-semibold text-[10px] uppercase tracking-widest asymmetric-card hover:bg-error/20 transition-all flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">stop</span> Terminate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#131313] asymmetric-card-small hud-border p-8 relative group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-xl">upload_file</span>
            <h2 className="font-headline font-semibold text-sm uppercase tracking-widest text-on-surface">Mission Generator</h2>
          </div>
          <p className="font-body text-xs text-slate-500 mb-6 uppercase tracking-wider leading-relaxed">
            Upload JSON payload. System will auto-generate encryption key [ROOM CODE] and trigger global broadcast.
          </p>
          
          <div className="relative mb-6">
            <input 
              type="file" 
              id="json-upload"
              accept=".json" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`w-full p-4 border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-surface-container-lowest hover:border-white/20'}`}>
              <span className={`material-symbols-outlined text-2xl ${file ? 'text-primary' : 'text-slate-500'}`}>
                {file ? 'check_circle' : 'drive_folder_upload'}
              </span>
              <span className={`font-headline text-[10px] font-semibold uppercase tracking-widest ${file ? 'text-primary' : 'text-slate-500'}`}>
                {file ? file.name : 'Select JSON Payload'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleCreateQuiz}
            disabled={loading || !file}
            className="w-full py-4 bg-primary text-on-primary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Processing</>
            ) : (
              <><span className="material-symbols-outlined text-sm">bolt</span> Generate Link</>
            )}
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-white/5 p-8 relative overflow-hidden flex flex-col justify-between opacity-60 pointer-events-none">
          <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
             <span className="material-symbols-outlined text-9xl">lock</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-slate-600 text-xl">database</span>
              <h2 className="font-headline font-semibold text-sm uppercase tracking-widest text-slate-400">Manual Entry Module</h2>
            </div>
            <p className="font-body text-xs text-slate-600 uppercase tracking-wider leading-relaxed">
              Direct manipulation of database objects is currently restricted. Wait for clearance level upgrade.
            </p>
          </div>
          <div className="mt-8">
            <span className="px-4 py-2 bg-black/50 border border-white/10 text-slate-500 font-headline font-semibold text-[10px] uppercase tracking-widest">
              OFFLINE
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
