import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const planText =
    typeof aiData?.plan === "string"
      ? aiData.plan
      : aiData?.plan?.plan || "";
  const state = location.state || {};

  const score = state.score || 0;
  const total = state.total || 0;
  const coinsEarned = state.coinsEarned || 0;
  const questions = state.questions || [];
  const answers = state.answers || {};

  /* ================= AI HANDLER ================= */

  const handleAIAnalysis = async () => {
    console.log("✅ AI BUTTON CLICKED");

    if (!questions.length) {
      alert("No quiz data found");
      return;
    }

    // 🔥 BUILD CORRECT PAYLOAD
    const topicStats = {};

    questions.forEach((q) => {
      const topic = q.topicName || q.topicId || "General";

      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }

      topicStats[topic].total++;

      if (answers[q.id] === Number(q.correctAnswer)) {
        topicStats[topic].correct++;
      }
    });

    const topic_accuracy = {};
    const avg_time_per_question = {};

    Object.keys(topicStats).forEach((topic) => {
      const { correct, total } = topicStats[topic];
      topic_accuracy[topic] = (correct / total) * 100;
      avg_time_per_question[topic] = 30;
    });

    const aiPayload = {
      user_id: "demo_user", // or your auth user
      topic_accuracy,
      avg_time_per_question,
      mistakes: [],
      recent_scores: [score],
    };

    console.log("🔥 CORRECT PAYLOAD:", aiPayload);

    setAiLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiPayload),
      });

      const data = await res.json();
      console.log("🤖 AI RESPONSE:", data);

      setAiData(data);
    } catch (err) {
      console.error("❌ API ERROR:", err);
    }

    setAiLoading(false);
  };

  /* ================= UI ===========  /* ================= UI ================= */

  return (
    <main className="max-w-4xl mx-auto pb-20">
      <section className="mb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight uppercase">Mission debriefing</h1>
          <p className="text-slate-500 font-label text-xs uppercase tracking-[0.4em]">SYNC_COMPLETE // ANALYSIS_READY</p>
        </div>
      </section>

      {/* RESULT OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-surface-container-low asymmetric-card hud-border p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
            <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
          </div>
          <div>
            <p className="text-[10px] font-headline font-semibold uppercase tracking-widest text-slate-500 mb-1">Final Score</p>
            <p className="text-3xl font-headline font-bold text-on-surface">
              {score} <span className="text-lg text-slate-600 font-normal">/ {total}</span>
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low asymmetric-card hud-border p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-tertiary/20 rounded-xl flex items-center justify-center border border-tertiary/20 shadow-inner">
            <span className="material-symbols-outlined text-tertiary text-4xl">token</span>
          </div>
          <div>
            <p className="text-[10px] font-headline font-semibold uppercase tracking-widest text-slate-500 mb-1">Coins Earned</p>
            <p className="text-3xl font-headline font-bold text-tertiary">+{coinsEarned}</p>
          </div>
        </div>
      </div>

      {/* AI ANALYZER */}
      <div className="mb-12">
        <button
          onClick={handleAIAnalysis}
          disabled={aiLoading}
          className={`w-full py-6 asymmetric-card hud-border transition-all flex items-center justify-center gap-4 group ${aiLoading ? 'bg-surface-container-low' : 'bg-primary/10 hover:bg-primary/20 border-primary/30'
            }`}
        >
          <div className={`w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center transition-all ${aiLoading ? 'animate-spin' : 'group-hover:scale-110'}`}>
            <span className="material-symbols-outlined text-primary text-base">
              {aiLoading ? 'sync' : 'psychology'}
            </span>
          </div>
          <span className="font-headline font-bold text-sm uppercase tracking-[0.3em] text-primary">
            {aiLoading ? "Synchronizing with AI Node..." : "Initiate AI Agent Analysis"}
          </span>
        </button>

        {aiData && (
          <div className="mt-8 bg-[#131313] asymmetric-card hud-border p-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
              <h3 className="font-headline font-semibold text-xs text-slate-500 uppercase tracking-[0.3em]">AI_COACH_OUTPUT :: VER_1.0</h3>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="font-headline font-semibold text-on-surface uppercase tracking-widest text-sm mb-4">Strategic Summary</h4>
                <p className="font-body text-slate-400 text-sm leading-relaxed max-w-2xl">
                  Subject shows vulnerability in <span className="text-error font-semibold">{aiData.analysis?.weak_topics?.length || 0}</span> specialized topic zones.
                  Efficiency metrics suggest immediate recalibration in the following sectors.
                </p>
              </div>

              <div>
                <h4 className="font-headline font-semibold text-on-surface uppercase tracking-widest text-[10px] mb-4">Tactical Weaknesses</h4>
                <div className="flex flex-wrap gap-2">
                  {aiData.analysis?.weak_topics?.map((topic, i) => (
                    <span key={i} className="px-3 py-1 bg-error/10 border border-error/20 text-error font-headline text-[9px] font-semibold uppercase tracking-widest rounded-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-headline font-semibold text-on-surface uppercase tracking-widest text-[10px] mb-4">Remediation Steps</h4>
                <div className="grid gap-3">
                  {planText.split("\n").filter(l => l.trim().startsWith("Step")).map((step, i) => (
                    <div key={i} className="p-4 bg-surface-container-lowest border-l-2 border-primary rounded-r">
                      <p className="font-body text-xs text-on-surface uppercase tracking-wider">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUESTIONS REVIEW */}
      <h3 className="font-headline font-semibold text-[10px] text-slate-600 uppercase tracking-[0.4em] mb-8 px-4 flex items-center gap-3">
        <span className="w-4 h-[1px] bg-slate-800"></span>
        Intel Review Session
        <span className="w-4 h-[1px] bg-slate-800"></span>
      </h3>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === Number(q.correctAnswer);

          return (
            <div key={q.id} className={`bg-[#131313] asymmetric-card-small hud-border p-8 border-l-4 ${isCorrect ? 'border-tertiary/20' : 'border-error/20'}`}>
              <div className="flex justify-between items-start mb-6">
                <span className="font-headline text-[10px] font-bold text-slate-700 uppercase tracking-widest">Question 0{index + 1}</span>
                <div className={`px-3 py-1 rounded text-[9px] font-headline font-semibold uppercase tracking-widest ${isCorrect ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' : 'bg-error/10 text-error border border-error/20'}`}>
                  {isCorrect ? 'VALID_PROTOCOL' : 'PROTOCOL_ERROR'}
                </div>
              </div>

              <h3 className="font-headline font-semibold text-on-surface text-lg uppercase tracking-tight mb-8">
                {q.question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((option, i) => {
                  const isCorrectOption = i === Number(q.correctAnswer);
                  const isUserSelection = i === userAnswer;

                  return (
                    <div
                      key={i}
                      className={`p-4 font-body text-xs uppercase tracking-widest rounded transition-all ${isCorrectOption
                          ? 'bg-tertiary/20 border border-tertiary shadow-[0_0_15px_rgba(78,222,163,0.1)] text-on-surface font-semibold'
                          : isUserSelection
                            ? 'bg-error/20 border border-error text-error'
                            : 'bg-surface-container-lowest border border-white/5 text-slate-500 opacity-60'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-headline text-[10px] opacity-40">{String.fromCharCode(65 + i)}</span>
                        {option}
                      </div>
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="mt-8 p-4 bg-primary/5 border-t border-primary/10 flex gap-4">
                  <span className="material-symbols-outlined text-primary text-base">info</span>
                  <p className="font-body text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest">
                    <span className="text-primary font-semibold">Analysis:</span> {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5">
        <button
          onClick={() => navigate("/subjects")}
          className="w-full md:w-auto px-12 py-5 bg-tertiary text-on-secondary font-headline font-bold text-xs uppercase tracking-[0.3em] asymmetric-card hover:scale-[1.02] transition-transform"
        >
          Return to Operational Base
        </button>
      </div>
    </main>
  );
};

export default Result;