import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, loginUser, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  /* ================= EMAIL LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      await loginUser(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      setError("");
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "420px",
          padding: "40px",
        }}
      >
        <h1
          className="page-title"
          style={{ textAlign: "center" }}
        >
          Welcome Back 👋
        </h1>

        <p
          className="page-subtitle"
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Login to continue your journey
        </p>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(239,68,68,0.1)",
              color: "var(--danger)",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* EMAIL LOGIN */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "none",
                background: "var(--bg-glass)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "none",
                background: "var(--bg-glass)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* DIVIDER */}
        <div
          style={{
            margin: "25px 0",
            textAlign: "center",
            fontSize: "14px",
            color: "var(--text-muted)",
          }}
        >
          — OR —
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid var(--accent-primary)",
                cursor: "pointer",
                fontWeight: 600,
                background: "transparent",
                color: "var(--accent-primary)",
              }}
>
  Continue with Google
</button>

        {/* SIGNUP LINK */}
        <p
          style={{
            marginTop: "25px",
            textAlign: "center",
            fontSize: "14px",
            color: "var(--text-muted)",
          }}
        >
          Don't have an account?{" "}
          <span
            style={{
              color: "var(--accent-primary)",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;