import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const PREDEFINED_AVATARS = [
  // 🎓 Students & Youth (8 Toon-Head portraits)
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Leah",
  "https://api.dicebear.com/9.x/fun-emoji/svg?backgroundColor=c0aede&seed=Sophia",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Ryker",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Easton",
  "https://api.dicebear.com/9.x/fun-emoji/svg?backgroundColor=059ff2,71cf62,d84be5,d9915b,f6d594,fcbc34,d1d4f9,c0aede,b6e3f4,ffd5dc,ffdfbf&seed=Averyf",
  "https://api.dicebear.com/9.x/fun-emoji/svg?backgroundColor=059ff2,71cf62,d84be5,d9915b,f6d594,fcbc34,d1d4f9,c0aede,b6e3f4,ffd5dc,ffdfbf&seed=Liam",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Alexander",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Eden",

  // 🧑‍🎓 Urban / Gen-Z (8 Toon-Head portraits)
  "https://api.dicebear.com/9.x/toon-head/svg?beard=chin,fullBeard,longBeard,moustacheTwirl,chinMoustache&beardProbability=0&hair=sideComed,spiky,undercut&seed=Brooklynn",
  "https://api.dicebear.com/9.x/toon-head/svg?beard[]&beardProbability=0&clothes=dress&clothesColor=0b3286,b11f1f,ec4899&eyes=happy&hair=bun&hairColor=2c1b18,a55728&mouth=laugh&rearHair=longWavy&rearHairProbability=100&skinColor=f1c3a5&seed=Sarah",
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Oliver",
  "https://api.dicebear.com/9.x/toon-head/svg?clothes=shirt&clothesColor=b11f1f,731ac3,545454,151613&eyebrows=sad&eyes=happy&hairColor=2c1b18&mouth=laugh,smile&skinColor=c68e7a,f1c3a5&seed=Andrea",


  "https://api.dicebear.com/9.x/toon-head/svg?eyes=bow,happy,wide&mouth=angry,laugh,smile&rearHair=longStraight,neckHigh&rearHairProbability=0&skinColor=f1c3a5&seed=Jameson",
  "https://api.dicebear.com/9.x/toon-head/svg?mouth=angry,laugh,smile&rearHair=longStraight,neckHigh&rearHairProbability=0&skinColor=f1c3a5&seed=Brian",
  "https://api.dicebear.com/9.x/toon-head/svg?eyes=bow,happy,wide&mouth=angry,laugh,smile&rearHair=longStraight,neckHigh&rearHairProbability=0&skinColor=f1c3a5&seed=Liliana",
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Alexander",

  // 🐾 Animals (8 Diverse Animals via Icons8)
  "https://img.icons8.com/?size=100&id=TQsd7VI4Lb6H&format=png&color=000000",
  "https://img.icons8.com/color/150/fox.png",
  "https://img.icons8.com/color/150/bear.png",
  "https://img.icons8.com/color/150/panda.png",
  "https://img.icons8.com/?size=100&id=g7oQSfBmLJb1&format=png&color=000000",
  "https://img.icons8.com/color/150/lion.png",
  "https://img.icons8.com/?size=100&id=69301&format=png&color=000000",
  "https://img.icons8.com/?size=100&id=8ogzInvS2gD2&format=png&color=000000",

  // 🤖 Drones / Bots (8)
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot3&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot4&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot5&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot6&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot7&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot8&backgroundColor=ffdfbf"
];

export default function Profile() {
  const { currentUser, userProfile } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setSelectedAvatar(currentUser.photoURL || PREDEFINED_AVATARS[0]);
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsUpdating(true);
    setStatusMsg({ text: "", type: "" });

    try {
      // Update Auth Profile
      await updateProfile(currentUser, {
        displayName: displayName,
        photoURL: selectedAvatar
      });

      // Update Firestore User Document (if needed, name is stored there)
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        name: displayName,
        photoURL: selectedAvatar
      });

      setStatusMsg({ text: "Profile identity updated successfully.", type: "success" });
    } catch (err) {
      console.error("Update failed:", err);
      setStatusMsg({ text: "Failed to update profile identity. Please retry.", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 fade-in">
      {/* Header */}
      <div className="bg-[#1a1a1f] p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden shadow-[0_0_20px_rgba(221,183,255,0.2)]">
            <img src={selectedAvatar} alt="Current Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-2">Operator Identity</h1>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Manage your tactical profile and visual identifier within the simulation.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#131317] p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        {statusMsg.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border ${statusMsg.type === "success"
            ? "bg-tertiary/10 border-tertiary/30 text-tertiary"
            : "bg-error/10 border-error/30 text-error"
            }`}>
            <span className="material-symbols-outlined text-lg">
              {statusMsg.type === "success" ? "check_circle" : "error"}
            </span>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          {/* Identity Config */}
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2 block flex justify-between">
                <span>Codename (Display Name)</span>
                <span className="text-primary material-symbols-outlined text-xs">badge</span>
              </label>
              <input
                type="text"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-bold tracking-wide"
                placeholder="Enter new codename..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2 block">
                Primary Email Config
              </label>
              <input
                type="text"
                className="w-full bg-[#0a0a0c]/50 border border-white/5 rounded-xl p-4 text-slate-500 cursor-not-allowed"
                value={currentUser?.email || "N/A"}
                disabled
              />
            </div>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          {/* Avatar Selection */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4 block flex justify-between">
              <span>Select Visual Identifier</span>
              <span className="text-primary material-symbols-outlined text-xs">face</span>
            </label>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {PREDEFINED_AVATARS.map((avatarUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`relative aspect-square rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-300 ${selectedAvatar === avatarUrl
                    ? "border-primary scale-110 shadow-[0_0_15px_rgba(221,183,255,0.4)]"
                    : "border-transparent hover:border-primary/50 hover:scale-105 opacity-60 hover:opacity-100"
                    }`}
                >
                  <img src={avatarUrl} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover bg-white/5" />
                  {selectedAvatar === avatarUrl && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white drop-shadow-md">check</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full md:w-auto ml-auto bg-primary text-on-primary font-bold tracking-widest uppercase text-sm py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(221,183,255,0.3)] disabled:opacity-70 disabled:scale-100"
            >
              {isUpdating ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  COMMIT IDENTITY CHANGES
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
