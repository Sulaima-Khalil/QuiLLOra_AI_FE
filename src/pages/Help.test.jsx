import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Help from "./Help";

/**
 * The support form used to clear itself and announce "Message sent. Our team
 * will get back to you within 24 hours" without sending anything anywhere.
 * There is no ticketing API, so the form now hands off to the support address
 * the page already publishes.
 */

const SUPPORT_EMAIL = "support@quillora.ai";

let assigned = "";

beforeEach(() => {
  assigned = "";
  // jsdom refuses navigation; intercept the assignment instead.
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...window.location,
      set href(value) { assigned = value; },
      get href() { return assigned; },
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const fillForm = async (user, subject, message) => {
  await user.type(screen.getByLabelText(/subject/i), subject);
  await user.type(screen.getByLabelText(/message/i), message);
};

describe("Help — support form", () => {
  it("claims no delivery it cannot make", () => {
    const { container } = render(<Help />);

    expect(container.textContent).not.toContain("Message sent");
    expect(container.textContent).not.toContain("within 24 hours");
  });

  it("says up front that in-app ticketing is unavailable", () => {
    render(<Help />);

    expect(screen.getByText(/In-app ticketing isn't available yet/)).toBeInTheDocument();
    // Shown twice on purpose: the contact block and the form's own caption.
    expect(screen.getAllByText(new RegExp(SUPPORT_EMAIL.replace(".", "\\.")))).not.toHaveLength(0);
  });

  it("keeps the submit button disabled until both fields are filled", async () => {
    const user = userEvent.setup();
    render(<Help />);

    const submit = screen.getByRole("button", { name: /compose email/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/subject/i), "Billing question");
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/message/i), "Please help.");
    expect(submit).toBeEnabled();
  });

  it("hands the message to the support address with subject and body encoded", async () => {
    const user = userEvent.setup();
    render(<Help />);

    await fillForm(user, "Billing question", "Please help with my invoice.");
    await user.click(screen.getByRole("button", { name: /compose email/i }));

    await waitFor(() => expect(assigned).toContain(`mailto:${SUPPORT_EMAIL}`));
    expect(assigned).toContain(`subject=${encodeURIComponent("Billing question")}`);
    expect(assigned).toContain(`body=${encodeURIComponent("Please help with my invoice.")}`);
  });

  it("confirms the hand-off honestly, not a delivery", async () => {
    const user = userEvent.setup();
    render(<Help />);

    await fillForm(user, "Subject", "Message body");
    await user.click(screen.getByRole("button", { name: /compose email/i }));

    await waitFor(() => expect(screen.getByText(/Opening your email client/)).toBeInTheDocument());
    expect(screen.queryByText(/Message sent/)).not.toBeInTheDocument();
  });

  it("keeps what the user typed — nothing was sent, so nothing is cleared", async () => {
    const user = userEvent.setup();
    render(<Help />);

    await fillForm(user, "Subject", "Message body");
    await user.click(screen.getByRole("button", { name: /compose email/i }));

    await waitFor(() => expect(screen.getByText(/Opening your email client/)).toBeInTheDocument());
    expect(screen.getByLabelText(/subject/i)).toHaveValue("Subject");
    expect(screen.getByLabelText(/message/i)).toHaveValue("Message body");
  });
});
