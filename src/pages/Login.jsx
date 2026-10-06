import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Check } from "lucide-react";
import { loginUser } from "../utils/auth";
import QuilloraMark from "../components/brand/QuilloraMark";
import "../components/auth/auth.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser({ email: formData.email, password: formData.password, rememberMe });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth auth-compact">
      <main className="auth-panel">
        <div className="auth-card login-card">
          <Link to="/" className="card-brand">
            <QuilloraMark size={34} />
            <span className="word">QuiLLora <b>AI</b></span>
          </Link>

          <h1 className="card-title">Welcome back</h1>
          <p className="card-sub">Access your secure editorial workspace.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-alert error" role="alert">{error}</div>}

            <div className="field">
              <label className="field-label" htmlFor="email">Professional Email</label>
              <div className="field-wrap">
                <Mail className="lead" size={17} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@organization.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-wrap">
                <Lock className="lead" size={17} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="check remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span className="box"><Check size={12} strokeWidth={3} /></span>
                <span className="txt">Keep me logged in</span>
              </label>
              <Link to="/forgot-password" className="link-accent password-reset-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in…" : "Sign in to workspace"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            New to QuiLLora? <Link to="/register" className="link-accent">Create your account</Link>
          </p>
        </div>

        <p className="auth-legal">
          © 2024 QuiLLora AI · <a href="#">Privacy</a> · <a href="#">Terms</a>
        </p>
      </main>
    </div>
  );
}
