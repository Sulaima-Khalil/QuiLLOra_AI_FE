import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Github, Check } from "lucide-react";
import { loginUser, getAuthProviders, startOAuth } from "../utils/auth";
import AuthShowcase, { GoogleIcon } from "../components/auth/AuthShowcase";
import QuilloraMark from "../components/brand/QuilloraMark";
import "../components/auth/auth.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    getAuthProviders().then(setProviders);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser({ email: formData.email, password: formData.password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <AuthShowcase variant="login" />

      <main className="auth-panel">
        <div className="auth-card">
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
              <div className="field-row">
                <label className="field-label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="link-accent" style={{ fontSize: 12.5 }}>
                  Forgot password?
                </Link>
              </div>
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

            <label className="check remember">
              <input type="checkbox" defaultChecked />
              <span className="box"><Check size={12} strokeWidth={3} /></span>
              <span className="txt">Remember this session for 30 days</span>
            </label>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in…" : "Sign in to workspace"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-divider">OR CONTINUE WITH</div>

          <div className="social-row">
            {/* Rendered only when the backend has credentials for the provider,
                so a button never leads to a 503. */}
            <button
              type="button"
              className="btn-social"
              onClick={() => startOAuth("google")}
              disabled={!providers.includes("google")}
              title={providers.includes("google") ? "Continue with Google" : "Google sign-in is not configured"}
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              className="btn-social"
              onClick={() => startOAuth("github")}
              disabled={!providers.includes("github")}
              title={providers.includes("github") ? "Continue with GitHub" : "GitHub sign-in is not configured"}
            >
              <Github size={16} /> GitHub
            </button>
          </div>

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
