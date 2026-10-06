import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Check } from "lucide-react";
import { registerUser } from "../utils/auth";
import QuilloraMark from "../components/brand/QuilloraMark";
import "../components/auth/auth.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="auth is-reversed auth-compact">
      <main className="auth-panel">
        <div className="auth-card signup-card">
          <Link to="/" className="card-brand">
            <QuilloraMark size={34} />
            <span className="word">QuiLLora <b>AI</b></span>
          </Link>

          <h1 className="card-title">Create your account</h1>
          <p className="card-sub">Set up your editorial workspace — it takes under a minute.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-alert error" role="alert">{error}</div>}

            <div className="grid-2">
              <div className="field">
                <label className="field-label" htmlFor="name">Full Name</label>
                <div className="field-wrap">
                  <User className="lead" size={17} />
                  <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" autoComplete="name" required />
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="email">Email Address</label>
                <div className="field-wrap">
                  <Mail className="lead" size={17} />
                  <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
                </div>
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
                    placeholder="Create a password"
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
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            <label className="check">
              <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} required />
              <span className="box"><Check size={12} strokeWidth={3} /></span>
              <span className="txt">
                I agree to the <a className="link-accent" href="#">Terms of Service</a> and{" "}
                <a className="link-accent" href="#">Privacy Policy</a>.
              </span>
            </label>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 16 }}>
              {loading ? "Creating workspace…" : "Create workspace"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="link-accent">Sign in</Link>
          </p>
        </div>

        <p className="auth-legal">
          © 2024 QuiLLora AI · Secure Editorial Environment
        </p>
      </main>
    </div>
  );
}
