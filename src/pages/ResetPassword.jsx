import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Feather, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { resetPassword } from "../utils/auth";
import AuthShowcase from "../components/auth/AuthShowcase";
import RecoverySteps from "../components/auth/RecoverySteps";
import "../components/auth/auth.css";

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

/**
 * Step 3 of 3 — choose the new password.
 *
 * Two ways in: the code verified on /verify-reset-code (router state) or the
 * `?token=` on the link the backend emails. Neither present means the user
 * cannot be authorised here, so the form stays locked.
 */
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const code = location.state?.code || "";
  const email = location.state?.email || "";
  const authorised = Boolean(token || code);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Upper & lowercase", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "At least one number", ok: /\d/.test(password) },
    { label: "One special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = rules.filter((r) => r.ok).length;
  const matches = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = authorised && rules[0].ok && matches && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, code, email, password });
      // The backend revokes every session on reset, so the user signs in fresh.
      navigate("/reset-success", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "This reset code is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  // Back goes one step up whichever path brought the user here.
  const backTo = code ? "/verify-reset-code" : "/login";
  const backState = code ? { state: { email } } : {};

  return (
    <div className="auth">
      <AuthShowcase variant="recovery" step={3} />

      <main className="auth-panel">
        <div className="auth-card">
          <div className="card-head">
            <Link to={backTo} {...backState} className="card-back" aria-label="Back to previous step">
              <ArrowLeft size={17} />
            </Link>
            <Link to="/" className="card-brand">
              <span className="mark"><Feather size={18} /></span>
              <span className="word">InkFlow <b>AI</b></span>
            </Link>
          </div>

          <h1 className="card-title">Set a new password</h1>
          <p className="card-sub">
            Choose something you haven&rsquo;t used before. Every other device will
            be signed out once you save.
          </p>

          <RecoverySteps current={3} />

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {!authorised && (
              <div className="auth-alert error" role="alert">
                This reset link is missing its code. Start again from{" "}
                <Link to="/forgot-password" className="link-accent">Forgot password</Link>.
              </div>
            )}

            {error && <div className="auth-alert error" role="alert">{error}</div>}

            <div className="field">
              <label className="field-label" htmlFor="password">New Password</label>
              <div className="field-wrap">
                <Lock className="lead" size={17} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={!authorised}
                  autoFocus
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

              {password.length > 0 && (
                <div className="pw-meter" data-score={score}>
                  <div className="bars">
                    {[1, 2, 3, 4].map((i) => (
                      <i key={i} className={i <= score ? "on" : ""} />
                    ))}
                  </div>
                  <div className="pw-label">
                    {rules[0].ok ? STRENGTH_LABELS[score] : STRENGTH_LABELS[0]}
                  </div>
                </div>
              )}
            </div>

            <ul className="pw-rules">
              {rules.map((rule) => (
                <li key={rule.label} className={rule.ok ? "ok" : ""}>
                  <span className="tick"><Check size={11} strokeWidth={3.5} /></span>
                  {rule.label}
                </li>
              ))}
            </ul>

            <div className="field">
              <label className="field-label" htmlFor="confirmPassword">Confirm New Password</label>
              <div className="field-wrap">
                <Lock className="lead" size={17} />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={!authorised}
                  required
                />
              </div>
              {confirmPassword.length > 0 && !matches && (
                <div className="pw-meter">
                  <div className="pw-label" style={{ color: "#e5484d" }}>Passwords do not match</div>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {loading ? "Updating password…" : "Update password"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="help-line">
            <ShieldCheck size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            Your code is single-use and is consumed the moment this password is saved.
          </p>
        </div>

        <p className="auth-legal">
          © 2024 InkFlow AI · <a href="#">Privacy</a> · <a href="#">Terms</a>
        </p>
      </main>
    </div>
  );
}
