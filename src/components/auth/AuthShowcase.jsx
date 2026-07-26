import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Sparkles, Send, Star, KeyRound, MailCheck, RotateCcw } from "lucide-react";
import QuilloraMark from "../brand/QuilloraMark";
import "./auth.css";

export const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const Brand = ({ mark = "teal" }) => (
  <Link to="/" className="stage-brand">
    <QuilloraMark size={42} color={mark} />
    <span className="word">QuiLLora <b>AI</b></span>
  </Link>
);

const TrustFoot = () => (
  <div className="stage-foot">
    <span><ShieldCheck size={15} /> SOC2 Type II</span>
    <span><Lock size={15} /> AES-256 Encrypted</span>
  </div>
);

// The "login" variant: a live workspace preview — returning-writer energy.
const LoginStage = ({ mark }) => (
  <>
    <Brand mark={mark} />

    <div className="stage-main">
      <span className="stage-eyebrow"><span className="pulse" />AI Editorial Suite</span>
      <h1 className="stage-headline">
        Where ideas become <em>published work.</em>
      </h1>
      <p className="stage-sub">
        Pick up exactly where you left off — your drafts, suggestions, and
        publishing pipeline, all in one intelligent canvas.
      </p>

      <div className="stage-cards">
        <div className="gcard gcard-main">
          <div className="doc-top">
            <span className="doc-dots"><i /><i /><i /></span>
            <span className="doc-chip">Draft</span>
          </div>
          <div className="doc-title">The Future of Neural Prose</div>
          <div className="doc-lines">
            <span className="w1" />
            <span className="w2" />
            <span className="hl" />
          </div>
          <span className="ai-pill"><span className="dot" />AI refined this paragraph for clarity</span>
          <div className="workflow">
            <span className="step done">Draft</span>
            <span className="arrow">→</span>
            <span className="step">In Review</span>
            <span className="arrow">→</span>
            <span className="step">Published</span>
          </div>
        </div>

        {/*
          Illustration, not data. This panel is a picture of the product shown
          beside the sign-in form, to a visitor with no session and therefore
          no numbers to show. Every figure in it is `aria-hidden` set dressing;
          nothing here is or should be wired to the API.
        */}
        <div className="gcard satellite stat" aria-hidden>
          <div className="stat-label">Words this week</div>
          <div className="stat-value">1,240 <small>+18%</small></div>
          <div className="spark">
            {[8, 12, 7, 15, 11, 18, 20].map((h, i) => (
              <i key={i} style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>

        <div className="gcard satellite people" aria-hidden>
          <div className="people-label">Collaborating</div>
          <div className="people-row">
            <span className="av" style={{ background: "#0f9e8c" }}>SK</span>
            <span className="av" style={{ background: "#2dd4bf", color: "#06231f" }}>MC</span>
            <span className="av" style={{ background: "#e3b448", color: "#0b1220" }}>AR</span>
            <span className="live">3 editing now</span>
          </div>
        </div>
      </div>
    </div>

    <TrustFoot />
  </>
);

// The "signup" variant: onboarding excitement — what you're about to unlock.
const SignupStage = ({ mark }) => (
  <>
    <Brand mark={mark} />

    <div className="stage-main">
      <span className="stage-eyebrow"><span className="pulse" />Join QuiLLora AI</span>
      <h1 className="stage-headline">
        Start writing with an <em>intelligent</em> editor.
      </h1>
      <p className="stage-sub">
        Everything you need to draft, refine, and publish — built for modern
        editorial teams.
      </p>

      <div className="stage-highlights">
        <div className="highlight">
          <span className="hi-icon"><Sparkles size={19} /></span>
          <div>
            <div className="hi-title">Real-time AI refinement</div>
            <div className="hi-sub">Hold tone and clarity as you type.</div>
          </div>
        </div>
        <div className="highlight">
          <span className="hi-icon"><ShieldCheck size={19} /></span>
          <div>
            <div className="hi-title">Privacy-first environment</div>
            <div className="hi-sub">Your intellectual property stays yours.</div>
          </div>
        </div>
        <div className="highlight">
          <span className="hi-icon"><Send size={18} /></span>
          <div>
            <div className="hi-title">Publish anywhere</div>
            <div className="hi-sub">From draft to live in a single flow.</div>
          </div>
        </div>
      </div>

      <div className="testimonial">
        <div className="stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={15} fill="currentColor" />
          ))}
        </div>
        <blockquote>
          &ldquo;It feels like my thoughts materialize straight onto the page — the
          cleanest writing tool I&rsquo;ve used.&rdquo;
        </blockquote>
        <cite>— Senior Research Fellow, joining 12,000+ writers</cite>
      </div>
    </div>

    <TrustFoot />
  </>
);

// The "recovery" variant: reassurance while the user is locked out. `step`
// (1–3) mirrors the form side so both halves of the screen agree.
const RecoveryStage = ({ step = 1, mark }) => {
  const stages = [
    { icon: <MailCheck size={19} />, title: "Confirm your email", sub: "We send a single-use code, never your password." },
    { icon: <KeyRound size={19} />, title: "Enter the 6-digit code", sub: "It expires in 10 minutes and works once." },
    { icon: <RotateCcw size={18} />, title: "Set a new password", sub: "Every other session is signed out for you." },
  ];

  return (
    <>
      <Brand mark={mark} />

      <div className="stage-main">
        <span className="stage-eyebrow"><span className="pulse" />Account Recovery</span>
        <h1 className="stage-headline">
          Locked out? <em>Let&rsquo;s fix that.</em>
        </h1>
        <p className="stage-sub">
          Three verified steps and you&rsquo;re back in your editorial workspace — with
          your drafts exactly where you left them.
        </p>

        <div className="stage-highlights">
          {stages.map((s, i) => (
            <div
              className="highlight"
              key={s.title}
              style={i + 1 === step ? undefined : { opacity: 0.55 }}
            >
              <span className="hi-icon">{s.icon}</span>
              <div>
                <div className="hi-title">{s.title}</div>
                <div className="hi-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonial">
          <blockquote>
            &ldquo;Recovery took under a minute and nothing in my workspace
            moved.&rdquo;
          </blockquote>
          <cite>— Managing Editor, QuiLLora AI</cite>
        </div>
      </div>

      <TrustFoot />
    </>
  );
};

export default function AuthShowcase({ variant = "login", step = 1, mark = "teal" }) {
  return (
    <aside className="auth-stage" aria-hidden>
      <div className="auth-aurora">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>
      <div className="auth-noise" />
      {variant === "signup" && <SignupStage mark={mark} />}
      {variant === "recovery" && <RecoveryStage step={step} mark={mark} />}
      {variant !== "signup" && variant !== "recovery" && <LoginStage mark={mark} />}
    </aside>
  );
}
