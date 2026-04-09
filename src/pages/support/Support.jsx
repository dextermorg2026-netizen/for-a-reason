import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function Support() {
  const { currentUser } = useAuth();
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        uid: currentUser?.uid || "anonymous",
        name: currentUser?.displayName || "Anonymous User",
        email: currentUser?.email || "N/A",
        review: review,
        rating: rating,
        createdAt: serverTimestamp()
      });
      setSuccessMsg("Mission accomplished! Your review has been transmitted to Central Command.");
      setReview("");
      setRating(5);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error("Transmission failed:", err);
      // fallback message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 fade-in">
      {/* Header */}
      <div className="bg-[#1a1a1f] p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <span className="material-symbols-outlined text-4xl text-primary drop-shadow-[0_0_15px_rgba(221,183,255,0.6)]">support_agent</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-2">Support & Feedback</h1>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Experiencing technical anomalies or want to share your tactical experience? We evaluate all feedback to improve the core matrix.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Review Form */}
        <div className="bg-[#131317] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">reviews</span>
          </div>
          <div className="relative z-10">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">Operator Review</h2>
              <p className="text-sm text-slate-500">Provide analysis of your current deployment</p>
            </div>

            {successMsg && (
              <div className="mb-4 bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`text-2xl transition-all ${
                        rating >= star ? "text-[#fcd53f] drop-shadow-[0_0_8px_rgba(252,213,63,0.5)] scale-110" : "text-slate-700 hover:text-[#fcd53f]/50"
                      }`}
                      onClick={() => setRating(star)}
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2 block">Feedback</label>
                <textarea
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm resize-none h-32"
                  placeholder="Initiate detailed transmission here..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">send</span>
                    TRANSMIT REVIEW
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bug Reporting */}
        <div className="bg-[#131317] p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-error/30 transition-all">
          <div className="w-32 h-32 relative mb-6">
            <div className="absolute inset-0 bg-error/20 rounded-full animate-ping opacity-20"></div>
            <div className="w-full h-full rounded-full border-2 border-dashed border-error/40 flex items-center justify-center relative">
              <span className="material-symbols-outlined text-5xl text-error drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">bug_report</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tighter">System Glitch?</h2>
          <p className="text-slate-400 text-sm mb-8 px-4">
            If you've encountered critical matrix failures, visual anomalies, or logic errors, report them directly to the dev squad via our secure channel.
          </p>

          <a
            href="https://forms.gle/nMA3paLAFMRdW8ni7"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-error/10 hover:bg-error/20 border border-error/50 text-error font-semibold uppercase tracking-widest text-xs py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">report</span>
            ACCESS BUG REPORT FORM
          </a>
        </div>
      </div>
    </div>
  );
}
