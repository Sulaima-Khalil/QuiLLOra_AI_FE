import { Fragment } from "react";
import { Check } from "lucide-react";
import "./auth.css";

const STEPS = ["Email", "Verify", "Password"];

/**
 * The rail shown on every password-recovery screen so the user always knows
 * how many steps are left. `current` is 1-based; step 4 marks all as done.
 */
export default function RecoverySteps({ current = 1 }) {
  return (
    <div className="recover-steps" role="list" aria-label={`Step ${current} of ${STEPS.length}`}>
      {STEPS.map((label, i) => {
        const index = i + 1;
        const done = index < current;
        const active = index === current;

        return (
          <Fragment key={label}>
            <div
              role="listitem"
              className={`rs${done ? " is-done" : ""}${active ? " is-active" : ""}`}
              aria-current={active ? "step" : undefined}
            >
              <span className="rs-dot">{done ? <Check size={13} strokeWidth={3} /> : index}</span>
              <span className="rs-label">{label}</span>
            </div>
            {index < STEPS.length && (
              <span className={`rs-bar${done ? " is-done" : ""}`} aria-hidden />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
