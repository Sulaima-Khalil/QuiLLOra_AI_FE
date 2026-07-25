import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, Timer } from "lucide-react";
import { requestPasswordReset, verifyResetCode } from "../utils/auth";
import { getResetEmail, rememberResetEmail } from "../utils/resetFlow";
import AuthShowcase from "../components/auth/AuthShowcase";
import QuilloraMark from "../components/brand/QuilloraMark";
import RecoverySteps from "../components/auth/RecoverySteps";
import "../components/auth/auth.css";

const LENGTH = 6;
const RESEND_SECONDS = 45;

/**
 * Step 2 of 3 — the user types the 6-digit code from the email.
 *
 * The address comes from router state, a `?email=` deep link, or the session
 * copy that survives a refresh. With none of those there is nothing to verify,
 * so the screen bounces back to step 1.
 */
export default function VerifyResetCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = location.state?.email || searchParams.get("email") || getResetEmail();

  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const inputs = useRef([]);
  // Guards the auto-submit so a rejected code isn't retried on every render.
  const attempted = useRef("");

  const code = digits.join("");
  const complete = code.length === LENGTH;

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Keeps a deep-linked address available to step 3 and to a later refresh.
  useEffect(() => {
    if (email) rememberResetEmail(email);
  }, [email]);

  const focusAt = (index) => {
    const next = inputs.current[Math.max(0, Math.min(LENGTH - 1, index))];
    next?.focus();
    next?.select();
  };

  const write = (values, from = 0) => {
    setError("");
    setDigits((prev) => {
      const next = [...prev];
      values.forEach((v, i) => {
        if (from + i < LENGTH) next[from + i] = v;
      });
      return next;
    });
  };

  const handleChange = (index, e) => {
    const typed = e.target.value.replace(/\D/g, "");
    if (!typed) {
      write([""], index);
      return;
    }
    const chars = typed.slice(0, LENGTH - index).split("");
    write(chars, index);
    focusAt(index + chars.length);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        write([""], index);
      } else if (index > 0) {
        write([""], index - 1);
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    write(pasted.split(""), 0);
    focusAt(pasted.length);
  };

  const submit = async (value) => {
    attempted.current = value;
    setError("");
    setNotice("");
    setLoading(true);

    try {
      await verifyResetCode({ email, code: value });
      // A backend without a verify route returns `deferred`; either way the
      // code travels to step 3, which is where the password is actually set.
      navigate("/reset-password", { state: { email, code: value } });
    } catch (err) {
      setError(err.response?.data?.message || "That code is incorrect or has expired.");
      // Cleared boxes plus a cleared guard so a corrected retry auto-submits
      // exactly like the first attempt.
      setDigits(Array(LENGTH).fill(""));
      attempted.current = "";
      focusAt(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (complete && !loading) submit(code);
  };

  // Verify as soon as the last digit lands — the usual one-time-code feel.
  useEffect(() => {
    if (complete && !loading && attempted.current !== code) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, complete, loading]);

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setError("");
    setNotice("");
    try {
      await requestPasswordReset(email);
      setNotice(`A new code is on its way to ${email}.`);
      setDigits(Array(LENGTH).fill(""));
      attempted.current = "";
      setCooldown(RESEND_SECONDS);
      focusAt(0);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code. Please try again.");
    }
  };

  if (!email) return <Navigate to="/forgot-password" replace />;

  return (
    <div className="auth">
      <AuthShowcase variant="recovery" step={2} />

      <main className="auth-panel">
        <div className="auth-card">
          <div className="card-head">
            <Link to="/forgot-password" className="card-back" aria-label="Back to email step">
              <ArrowLeft size={17} />
            </Link>
            <Link to="/" className="card-brand">
              <QuilloraMark size={34} />
              <span className="word">QuiLLora <b>AI</b></span>
            </Link>
          </div>

          <h1 className="card-title">Enter your code</h1>
          <p className="card-sub">
            If an account exists for this address, a 6-digit verification code is
            in the inbox.
          </p>

          <div className="mail-chip">
            <Mail size={15} />
            <span>{email}</span>
          </div>

          <RecoverySteps current={2} />

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-alert error" role="alert">{error}</div>}
            {notice && <div className="auth-alert success" role="status">{notice}</div>}

            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label" htmlFor="otp-0">Verification Code</label>
              <div className={`otp-row${error ? " is-error" : ""}`} onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    ref={(el) => { inputs.current[i] = el; }}
                    className={digit ? "is-filled" : ""}
                    value={digit}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={LENGTH}
                    aria-label={`Digit ${i + 1} of ${LENGTH}`}
                    autoFocus={i === 0}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="otp-meta">
              <span className="expiry">
                <Timer size={14} /> Codes expire 10 minutes after they&rsquo;re sent
              </span>
              <button type="button" className="btn-ghost" onClick={handleResend} disabled={cooldown > 0 || loading}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !complete}>
              {loading ? "Verifying…" : "Verify and continue"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="help-line">
            Wrong address?{" "}
            <Link to="/forgot-password" className="link-accent">Use a different email</Link>
            {" · "}Nothing arrived? Check your spam folder.
          </p>
        </div>

        <p className="auth-legal">
          © 2024 QuiLLora AI · <a href="#">Privacy</a> · <a href="#">Terms</a>
        </p>
      </main>
    </div>
  );
}
