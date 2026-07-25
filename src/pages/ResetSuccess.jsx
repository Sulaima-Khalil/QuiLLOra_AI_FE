import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import AuthShowcase from "../components/auth/AuthShowcase";
import QuilloraMark from "../components/brand/QuilloraMark";
import RecoverySteps from "../components/auth/RecoverySteps";
import "../components/auth/auth.css";

/** End of the recovery flow — the only way forward is a fresh sign-in. */
export default function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="auth">
      <AuthShowcase variant="recovery" step={3} />

      <main className="auth-panel">
        <div className="auth-card done-wrap">
          <div className="card-head" style={{ justifyContent: "center" }}>
            <Link to="/" className="card-brand">
              <QuilloraMark size={34} />
              <span className="word">QuiLLora <b>AI</b></span>
            </Link>
          </div>

          <div className="done-badge">
            <Check size={34} strokeWidth={3} />
          </div>

          <h1 className="card-title">Password updated</h1>
          <p className="card-sub">
            Your credentials are set. Sign in with the new password to get back to
            your editorial workspace — every other session has been signed out.
          </p>

          <RecoverySteps current={4} />

          <button type="button" className="btn-primary" onClick={() => navigate("/login")}>
            Continue to sign in
            <ArrowRight size={17} />
          </button>

          <div className="done-note">
            <ShieldCheck size={13} /> Secure editorial environment verified
          </div>

          <p className="help-line">
            Didn&rsquo;t make this change?{" "}
            <a href="#" className="link-accent">Contact support immediately</a>.
          </p>
        </div>

        <p className="auth-legal">
          © 2024 QuiLLora AI · <a href="#">Privacy</a> · <a href="#">Terms</a>
        </p>
      </main>
    </div>
  );
}
