import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Feather, Eye, EyeOff, ArrowRight, User, AtSign, Mail, Lock, Globe, Github, Check, ChevronDown } from "lucide-react";
import { registerUser , getAuthProviders, startOAuth } from "../utils/auth";
import AuthShowcase, { GoogleIcon } from "../components/auth/AuthShowcase";
import "../components/auth/auth.css";

const countries = ["Pakistan", "United States", "United Kingdom", "Canada", "Germany", "India", "Australia", "Other"];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
    agree: false,
    newsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    getAuthProviders().then(setProviders);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth is-reversed">
      <AuthShowcase variant="signup" />

      <main className="auth-panel">
        <div className="auth-card is-wide">
          <Link to="/" className="card-brand">
            <span className="mark"><Feather size={18} /></span>
            <span className="word">InkFlow <b>AI</b></span>
          </Link>

          <h1 className="card-title">Create your account</h1>
          <p className="card-sub">Set up your editorial workspace — it takes under a minute.</p>

          <div className="social-row" style={{ marginTop: 24 }}>
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

          <div className="auth-divider">OR SIGN UP WITH EMAIL</div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate style={{ marginTop: 0 }}>
            {error && <div className="auth-alert error" role="alert">{error}</div>}

            <div className="form-step">
              <span className="idx">01</span>
              <span className="label">Your identity</span>
              <span className="rule" />
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label" htmlFor="name">Full Name</label>
                <div className="field-wrap">
                  <User className="lead" size={17} />
                  <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" autoComplete="name" required />
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="username">Username</label>
                <div className="field-wrap">
                  <AtSign className="lead" size={17} />
                  <input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe_ai" autoComplete="username" />
                </div>
              </div>
            </div>

            <div className="form-step">
              <span className="idx">02</span>
              <span className="label">Account access</span>
              <span className="rule" />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="email">Email Address</label>
              <div className="field-wrap">
                <Mail className="lead" size={17} />
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@organization.edu" autoComplete="email" required />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="country">Country / Region</label>
              <div className="field-wrap">
                <Globe className="lead" size={17} />
                <select id="country" name="country" value={formData.country} onChange={handleChange} required>
                  <option value="" disabled>Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="chevron"><ChevronDown size={17} /></span>
              </div>
            </div>

            <div className="grid-2">
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
                    autoComplete="new-password"
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
              <div className="field">
                <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="field-wrap">
                  <Lock className="lead" size={17} />
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-step">
              <span className="idx">03</span>
              <span className="label">Agreements</span>
              <span className="rule" />
            </div>

            <label className="check">
              <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} required />
              <span className="box"><Check size={12} strokeWidth={3} /></span>
              <span className="txt">
                I agree to the <a className="link-accent" href="#">Terms of Service</a> and{" "}
                <a className="link-accent" href="#">Privacy Policy</a>.
              </span>
            </label>
            <label className="check">
              <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} />
              <span className="box"><Check size={12} strokeWidth={3} /></span>
              <span className="txt">Keep me updated with AI editorial insights and product news.</span>
            </label>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 22 }}>
              {loading ? "Creating workspace…" : "Create workspace"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="link-accent">Sign in</Link>
          </p>
        </div>

        <p className="auth-legal">
          © 2024 InkFlow AI · Secure Editorial Environment
        </p>
      </main>
    </div>
  );
}
