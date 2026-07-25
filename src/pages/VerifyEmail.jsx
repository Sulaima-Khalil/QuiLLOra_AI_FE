import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, Button, Stack, Divider, Snackbar, Alert } from "@mui/material";
import { Feather, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import { verifyEmail, resendVerification } from "../utils/auth";

/** Badge label for each stage of the verification flow. */
const STATUS_LABEL = {
  awaiting: "Awaiting Verification",
  verifying: "Verifying…",
  verified: "Verified",
  failed: "Link Expired",
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Two entry points: arriving from registration (no token, "check your
  // inbox"), or following the emailed link (token present, verify it).
  const token = searchParams.get("token");
  const email = location.state?.email || searchParams.get("email") || "your email address";

  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState(token ? "verifying" : "awaiting");

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setStatus("verified");
        setToast({ severity: "success", message: "Email verified. Welcome to InkFlow AI." });
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("failed");
        setToast({
          severity: "error",
          message: err.response?.data?.message || "This verification link is invalid or has expired.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (cooldown > 0) return;

    // Resending needs a real address; the placeholder cannot be sent.
    if (!email.includes("@")) {
      setToast({ severity: "warning", message: "Sign in or register again to resend the link." });
      return;
    }

    setCooldown(30);
    try {
      await resendVerification(email);
      setToast({ severity: "success", message: `Verification email resent to ${email}.` });
    } catch (err) {
      setToast({
        severity: "error",
        message: err.response?.data?.message || "Could not resend the verification email.",
      });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: brandColors.bgSecondary }}>
      {/* Top bar */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
          py: 2
        }}>
        <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none" }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "#fff",
            }}
          >
            <Feather size={18} />
          </Box>
          <Typography variant="h6" sx={{ color: "text.primary" }}>
            InkFlow <Box component="span" sx={{ color: "primary.main" }}>AI</Box>
          </Typography>
        </Box>
        <Typography component="a" href="#" variant="body2" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
          Support
        </Typography>
      </Stack>
      {/* Card */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 2, py: 6 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 460,
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 6,
            p: { xs: 3, sm: 5 },
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              p: 2.5,
              borderRadius: 3,
              bgcolor: brandColors.hover,
              border: `1px solid ${brandColors.border}`,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                bgcolor: brandColors.dark,
                color: brandColors.mint,
              }}
            >
              {status === "verified" ? <CheckCircle2 size={26} /> : <Mail size={26} />}
            </Box>
            <Stack direction="row" spacing={0.75} sx={{
              alignItems: "center"
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.mint }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                {STATUS_LABEL[status]}
              </Typography>
            </Stack>
          </Box>

          <Typography variant="h3" sx={{ mt: 3, fontSize: { xs: "1.5rem", sm: "1.875rem" } }}>
            {status === "verified" ? "You're verified" : "Verify Your Identity"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary", lineHeight: 1.7 }}>
            {status === "verified" ? (
              "Your email address is confirmed and your editorial workspace is ready."
            ) : status === "failed" ? (
              "That link is invalid or has expired. Request a fresh one below."
            ) : status === "verifying" ? (
              "Confirming your email address…"
            ) : (
              <>
                We&rsquo;ve sent a secure editorial access link to{" "}
                <Box component="strong" sx={{ color: "text.primary" }}>{email}</Box>. Please check
                your inbox and click the link to confirm your account.
              </>
            )}
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/dashboard")}
            sx={{ mt: 3.5, py: 1.25, bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            Continue to Dashboard
          </Button>

          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              disabled={cooldown > 0}
              onClick={handleResend}
              sx={{ color: "text.primary", borderColor: "divider" }}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/register"
              sx={{ color: "text.primary", borderColor: "divider" }}
            >
              Change Address
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              color: "text.secondary"
            }}>
            <ShieldCheck size={14} />
            <Typography variant="caption" sx={{ fontStyle: "italic" }}>
              Secure Editorial Environment Protected by InkFlow Shield
            </Typography>
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ mt: 3, color: "text.secondary" }}>
          Didn&rsquo;t receive an email? Check your{" "}
          <Box component="a" href="#" sx={{ fontWeight: 600, color: "primary.main" }}>spam</Box>
          {" "}folder or contact our{" "}
          <Box component="a" href="#" sx={{ fontWeight: 600, color: "primary.main" }}>technical help desk</Box>.
        </Typography>
      </Box>
      {/* Footer */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 4 },
          py: 2
        }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          © 2024 InkFlow AI. Secure Editorial Environment.
        </Typography>
        <Stack direction="row" spacing={2.5}>
          {["Privacy Policy", "Terms of Service", "Security Guidelines"].map((label) => (
            <Typography key={label} component="a" href="#" variant="caption" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
              {label}
            </Typography>
          ))}
        </Stack>
      </Stack>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast && (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
