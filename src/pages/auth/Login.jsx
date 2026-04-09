import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message || "Authentication failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-4 relative overflow-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full"></div>
      
      {/* AMBIENT GRID (OPTIONAL TEXTURE) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
      </div>

      <div className="glass-panel asymmetric-card w-full max-w-[440px] p-10 relative group fade-in">
        {/* HUD CORNER ACCENTS */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-xl transition-all group-hover:border-primary"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30 group-hover:border-primary transition-all"></div>

        {/* HEADER SECTION */}
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-6 primary-glow relative">
            <span className="material-symbols-outlined text-primary text-4xl">security</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary rounded-full pulse-emerald"></div>
          </div>
          
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-white mb-2 uppercase italic">
            OPERATOR AUTH
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase font-bold">
            Establishing Secure Uplink...
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-3 animate-shake">
            <span className="material-symbols-outlined text-base">warning</span>
            {error}
          </div>
        )}

        {/* MAIN ACTION AREA */}
        <div className="space-y-6">
          <div className="relative group/btn">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#1a1a1f] border border-white/5 py-5 rounded-xl text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-[#25252a] hover:border-primary/50 transition-all duration-300 relative overflow-hidden active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                  Sync Google Identity
                </>
              )}
              
              {/* BUTTON SHIMMER */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
            </button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-slate-600 text-[9px] uppercase tracking-widest leading-relaxed">
              By initializing authentication, you agree to comply with simulation protocols and data encryption standards.
            </p>
            
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            </div>
          </div>
        </div>

        {/* HUD FOOTER INFO */}
        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[8px] font-bold text-slate-500 tracking-tighter uppercase relative">
          <div className="flex flex-col gap-1">
            <span>Protocol: OAUTH_2.0</span>
            <span>Status: READY</span>
          </div>
          <div className="text-right flex flex-col gap-1">
            <span>Terminal: NEXUS_NODE_01</span>
            <span className="text-primary/50">ENCRYPTION: AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;