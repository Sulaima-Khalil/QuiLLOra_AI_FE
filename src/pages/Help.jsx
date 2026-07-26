import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ChevronDown,
  BookOpen,
  MessageCircle,
  Activity,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import { FilterInput } from "../components/shared/FilterInput";

/** The address already published on this page; the form hands off to it. */
const SUPPORT_EMAIL = "support@quillora.ai";

const quickLinks = [
  { icon: BookOpen, label: "Documentation", description: "Guides & API reference" },
  { icon: MessageCircle, label: "Community Forum", description: "Ask other writers" },
  { icon: Activity, label: "System Status", description: "All systems operational" },
  { icon: Phone, label: "Contact Sales", description: "Enterprise & teams" },
];

const faqs = [
  {
    q: "How does the AI Writer generate suggestions?",
    a: "QuiLLora AI analyzes your draft's tone, structure, and intent, then offers rewrites, summaries, and tone adjustments you can accept or dismiss. Nothing is published without your review.",
  },
  {
    q: "Can I recover a deleted article?",
    a: "Deleted articles are removed permanently and cannot be recovered. If you want to keep something without publishing it, archive it instead — archived articles can be restored anytime from the Archive page.",
  },
  {
    q: "How do I invite teammates?",
    a: "Go to Team or Settings > Team Management and click \"Invite Member\". They'll be added with Editor access by default; you can change their role anytime.",
  },
  {
    q: "What's the difference between Collections and My Articles?",
    a: "My Articles holds content you've written. Collections holds articles you've bookmarked from Discover for later reading, organized into folders you create.",
  },
  {
    q: "Is my content used to train AI models?",
    a: "No. Your drafts and published articles remain private to your workspace and are never used for third-party model training.",
  },
];

export default function Help() {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ subject: "", message: "" });
  const [toast, setToast] = useState(false);

  const filteredFaqs = faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(query.toLowerCase()));

  /*
   * There is no support or ticketing API — no route, controller or service
   * accepts one. This used to clear the form and announce "Message sent. Our
   * team will get back to you within 24 hours", which was a fabricated success
   * for a message that went nowhere.
   *
   * The form now hands off to the support address the page already shows, via
   * the user's mail client. That genuinely delivers the message, and the sent
   * state is the mail client's rather than something invented here.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!subject || !message) return;

    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;

    setToast(true);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: brandColors.secondary }}>
            WE'RE HERE TO HELP
          </Typography>
        </Stack>
        <Typography variant="h4" sx={{ mt: 0.5, fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, color: "text.primary" }}>
          Help &amp; Support
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Search our knowledge base or reach out to the editorial support team.
        </Typography>
      </Box>
      <FilterInput
        value={query}
        onChange={setQuery}
        placeholder="Filter help articles..."
        sx={{ maxWidth: { sm: 480 } }}
      />
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" } }}>
        {quickLinks.map(({ icon: Icon, label, description }) => (
          <Stack
            key={label}
            spacing={1}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: 1,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { borderColor: "primary.main", boxShadow: 3 },
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                bgcolor: brandColors.hover,
                color: brandColors.primary,
              }}
            >
              <Icon size={17} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{label}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{description}</Typography>
            </Box>
          </Stack>
        ))}
      </Box>
      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, alignItems: "start" }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}>
            Frequently Asked Questions
          </Typography>
          {filteredFaqs.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
              No help articles match "{query}".
            </Typography>
          ) : (
            filteredFaqs.map((f) => (
              <Accordion key={f.q} disableGutters>
                <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>

        <Stack
          spacing={2}
          sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", boxShadow: 1 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Contact Support
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              color: "text.secondary"
            }}>
            <Mail size={14} />
            <Typography variant="caption">{SUPPORT_EMAIL}</Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              color: "text.secondary"
            }}>
            <MessageSquare size={14} />
            <Typography variant="caption">Live chat available 9am-6pm ET</Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <Stack spacing={1.5}>
              <TextField
                label="Subject"
                size="small"
                fullWidth
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <TextField
                label="Message"
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!form.subject.trim() || !form.message.trim()}
                sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
              >
                Compose Email
              </Button>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                In-app ticketing isn&apos;t available yet — this opens your email client
                addressed to {SUPPORT_EMAIL}.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
      <Snackbar open={toast} autoHideDuration={4000} onClose={() => setToast(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert role="status" severity="info" variant="filled" onClose={() => setToast(false)} sx={{ borderRadius: 2 }}>
          Opening your email client. If nothing happens, write to {SUPPORT_EMAIL}.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
