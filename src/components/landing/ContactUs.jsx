import { useState } from "react";
import { Box, Container, Typography, TextField, Button, Stack } from "@mui/material";
import { Send, Mail, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";

const methods = [
  { icon: Mail, label: "Email us", value: "hello@inkflow.ai" },
  { icon: MessageCircle, label: "Live chat", value: "Mon–Fri, 9–6" },
  { icon: Clock, label: "Response", value: "Within 24 hours" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: brandColors.bgSecondary,
    borderRadius: 2,
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: brandColors.primary },
  },
  "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.45)", opacity: 1 },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiInputLabel-root.Mui-focused": { color: brandColors.mint },
};

export default function ContactUs() {
  const [sent, setSent] = useState(false);

  return (
    <Box component="section">
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            maxWidth: 680,
            mx: "auto",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: 1,
            px: { xs: 3, sm: 5, md: 6 },
            py: { xs: 5, md: 6 },
          }}
        >
          {/* subtle glow */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -110,
              right: -70,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${brandColors.primary}26 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", justifyContent: "center", mb: 1.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: brandColors.secondary }} />
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 2, color: brandColors.secondary }}>
                GET IN TOUCH
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" }, color: "text.primary" }}>
              Let&rsquo;s talk.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, mx: "auto", maxWidth: 440, color: "text.secondary", lineHeight: 1.7 }}>
              Questions, feedback, or partnership ideas? Send us a note and our
              team will get back to you shortly.
            </Typography>
          </Box>

          {sent ? (
            <Stack spacing={1.5} sx={{ alignItems: "center", py: 4, position: "relative", zIndex: 1 }}>
              <CheckCircle2 size={40} color={brandColors.secondary} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                Message sent!
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
                Thanks for reaching out — we&rsquo;ll reply within 24 hours.
              </Typography>
              <Button onClick={() => setSent(false)} sx={{ color: "primary.main" }}>
                Send another
              </Button>
            </Stack>
          ) : (
            <Box
              component="form"
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              sx={{ mt: 4, position: "relative", zIndex: 1 }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Your name" required fullWidth size="small" sx={fieldSx} />
                <TextField label="Email address" type="email" required fullWidth size="small" sx={fieldSx} />
              </Stack>
              <TextField
                label="Message"
                required
                fullWidth
                multiline
                minRows={4}
                size="small"
                sx={{ ...fieldSx, mt: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                endIcon={<Send size={16} />}
                sx={{ mt: 2.5, py: 1.15, bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}
              >
                Send Message
              </Button>
            </Box>
          )}

          {/* contact methods */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 0 }}
            sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider", position: "relative", zIndex: 1, justifyContent: "space-between" }}
          >
            {methods.map(({ icon: Icon, label, value }) => (
              <Stack key={label} direction="row" spacing={1.25} sx={{ alignItems: "center", justifyContent: { xs: "flex-start", sm: "center" }, flex: 1 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: brandColors.bgSecondary, flexShrink: 0 }}>
                  <Icon size={16} color={brandColors.primary} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "text.secondary", textTransform: "uppercase" }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {value}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
