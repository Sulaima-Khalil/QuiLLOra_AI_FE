import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { requestPasswordReset } from "../utils/auth";
import { rememberResetEmail } from "../utils/resetFlow";
import AuthShowcase from "../components/auth/AuthShowcase";
import QuilloraMark from "../components/brand/QuilloraMark";
import RecoverySteps from "../components/auth/RecoverySteps";
import "../components/auth/auth.css";

/** Step 1 of 3 — ask for the address the recovery code should go to. */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      // The backend answers identically whether or not the account exists, so
      // the next screen must not imply the address was found.
      rememberResetEmail(email);
      navigate("/verify-reset-code", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <AuthShowcase variant="recovery" step={1} />

      <main className="auth-panel">
        <div className="auth-card">
          <div className="card-head">
            <Link to="/login" className="card-back" aria-label="Back to login">
              <ArrowLeft size={17} />
            </Link>
            <Link to="/" className="card-brand">
              <QuilloraMark size={34} />
              <span className="word">QuiLLora <b>AI</b></span>
            </Link>
          </div>

          <h1 className="card-title">Forgot your password?</h1>
          <p className="card-sub">
            Enter the email tied to your account and we&rsquo;ll send a 6-digit
            verification code.
          </p>

          <RecoverySteps current={1} />

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !email.trim()}>
              {loading ? "Sending code…" : "Send verification code"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="help-line">
            <ShieldCheck size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            We never email your password — only a single-use code that expires in
            10 minutes.
          </p>

          <p className="auth-switch">
            Remembered it? <Link to="/login" className="link-accent">Back to sign in</Link>
          </p>
        </div>

        <p className="auth-legal">
          © 2024 QuiLLora AI · <a href="#">Privacy</a> · <a href="#">Terms</a>
        </p>
      </main>
    </div>
  );
}
