import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Sparkles, Wand2, Cloud, MessageCircle, HelpCircle, ArrowLeft } from "lucide-react";
import DocumentCanvas from "../components/aiwriter/DocumentCanvas";
import NeuralSidebar from "../components/aiwriter/NeuralSidebar";
import SeoSidebar from "../components/aiwriter/SeoSidebar";
import "../components/aiwriter/aiwriter.css";
import { brandColors } from "../theme/muiTheme";
import { createArticle } from "../utils/articlesStore";
import { generateArticle, generateParagraph, generateInsights } from "../utils/aiStore";
import { getProfile, getInitials } from "../utils/profileStore";

const TONES = ["Academic", "Minimalist", "Persuasive", "Technical"];
const LENGTHS = ["Short", "Medium", "Long"];
const CATEGORIES = ["General", "AI", "Design", "Technology", "Business", "Science"];

// Starter document so the workspace lands populated, matching the reference design.
const SEED_DOC = {
  title: "The Future of Neural Prose",
  html: [
    "<p>In the quiet intersection of human creativity and algorithmic precision, a new form of literature is beginning to emerge. This is not merely the automation of text, but the augmentation of thought — a neural prose that breathes through the silicon and the soul alike.</p>",
    "<p>QuiLLora AI represents the frontier of this transition. By leveraging transformer models tuned for high-precision editorial standards, writers are no longer constrained by the blank page. Instead, they operate in a collaborative feedback loop where intent is met with structural intelligence.</p>",
    "<blockquote><p>The machine does not replace the writer; it provides the scaffold upon which the architect builds higher than ever before possible.</p></blockquote>",
    "<p>As we look toward the horizon, the distinction between human-authored and machine-enhanced text will continue to blur. What remains constant is the writer's judgment — the taste that decides which suggestions serve the work and which ones dilute it.</p>",
  ].join(""),
};

// Generation now happens server-side (POST /ai/generate), so the local
// template engine that used to live here has been removed along with its
// TITLE_TEMPLATES / OPENERS / BODY_SENTENCES / CLOSERS / PULL_QUOTES tables.

const wordsFromText = (text) => (text || "").trim().split(/\s+/).filter(Boolean);
const htmlToWordCount = (html) => wordsFromText((html || "").replace(/<[^>]+>/g, " ")).length;

export default function AIWriter() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const profile = useMemo(() => getProfile(), []);

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Academic");
  const [length, setLength] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState(SEED_DOC);
  const [genCount, setGenCount] = useState(0);
  const [title, setTitle] = useState(SEED_DOC.title);
  const [toast, setToast] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);

  const [activeKey, setActiveKey] = useState("rewrite");
  const [insights, setInsights] = useState(null);
  const [wordCount, setWordCount] = useState(htmlToWordCount(SEED_DOC.html));
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null);
  const [updatedLabel, setUpdatedLabel] = useState(
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  );

  const saveTimeout = useRef(null);

  const canGenerate = topic.trim().length > 2 && !generating;

  const runGeneration = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      //  makes a repeat request return a different draft for the
      // same prompt; without it the backend is deterministic.
      const result = await generateArticle({ topic: topic.trim(), tone, length, category, variation: genCount });
      setArticle(result);
      setGenCount((n) => n + 1);
      setTitle(result.title);
      setWordCount(result.wordCount ?? htmlToWordCount(result.html));
      setUpdatedLabel(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
      setIntakeOpen(false);
    } catch (error) {
      setToast({ severity: "error", message: error?.response?.data?.message || "Generation failed. Please try again." });
    } finally {
      setGenerating(false);
    }
  };

  const handleContentUpdate = (_html, text) => {
    setWordCount(wordsFromText(text).length);
    setSaving(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSaving(false), 900);
  };

  useEffect(() => () => saveTimeout.current && clearTimeout(saveTimeout.current), []);

  const handleGenerateNext = async () => {
    setGenerating(true);
    try {
      const next = await generateParagraph({ topic: topic.trim(), variation: genCount });
      canvasRef.current?.insertParagraph(next.html);
      setGenCount((n) => n + 1);
    } catch (error) {
      setToast({
        severity: "error",
        message: error?.response?.data?.message || "Could not generate a paragraph.",
      });
    } finally {
      setGenerating(false);
    }
  };

  /** Saves the current document. Resolves to the created article, or null. */
  const persistArticle = async (status) => {
    const html = canvasRef.current?.getHTML() || article?.html || "";
    if (!title.trim() || !html.trim()) {
      setToast({ severity: "warning", message: "Add a title and some content first." });
      return null;
    }

    try {
      return await createArticle({ title, content: html, status, category, generatedByAI: true });
    } catch (error) {
      setToast({
        severity: "error",
        message: error?.response?.data?.message || "Could not save your article.",
      });
      return null;
    }
  };

  const handlePublishNow = async () => {
    setPublishing(true);
    const saved = await persistArticle("Published");
    setPublishing(false);

    if (!saved) return;

    setPublishedAt("Just now");
    setToast({ severity: "success", message: "Article published! Redirecting to My Articles..." });
    setTimeout(() => navigate("/dashboard/my-article"), 900);
  };

  const handleSaveDraft = async () => {
    if (await persistArticle("Draft")) {
      setToast({ severity: "success", message: "Saved to My Articles as a draft." });
    }
  };

  const handlePublishToWeb = () => setToast({ severity: "info", message: "Public link copied to clipboard (demo)." });
  const handleExport = () => setToast({ severity: "info", message: "Exporting as Markdown... (demo)" });

  // Insights are computed server-side from the live draft, so they reflect
  // the actual text rather than a canned string.
  useEffect(() => {
    let cancelled = false;

    generateInsights({
      content: article?.html ?? "",
      topic: topic || "this topic",
      tone,
      length,
      category,
    })
      .then((result) => !cancelled && setInsights(result))
      .catch(() => !cancelled && setInsights(null));

    return () => {
      cancelled = true;
    };
  }, [article, topic, tone, length, category]);

  const insightText = insights?.[activeKey] ?? insights?.rewrite ?? "Analysing your draft…";

  const readingMinutes = Math.max(1, Math.round(wordCount / 300));
  const contentScore = Math.min(96, 58 + Math.round(wordCount / 12));

  const revisions = [
    { title: "v2.4 — Current Version", sub: `${publishedAt || "2 mins ago"} by ${profile.name}`, current: true },
    { title: "v2.3 — Tone Adjustment", sub: "1 hour ago by AI Assistant", current: false },
  ];

  const editorKey = `doc-${genCount}`;

  return (
    <div className="aiw-shell">
      <div className="aiw-topbar">
        <button type="button" className="aiw-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={17} />
        </button>
        <Link to="/dashboard" className="aiw-logo">
          QuiLLora <span>AI</span>
        </Link>
        <span className="aiw-topbar-sep" />
        <span className="aiw-doc-label">
          Document: <b>{title || "Untitled"}</b>
        </span>
        <div className="aiw-topbar-spacer" />
        <button type="button" className="aiw-newdraft-btn" onClick={() => setIntakeOpen(true)}>
          <Wand2 size={14} />
          New AI Draft
        </button>
        <div className="aiw-avatars">
          <div className="aiw-avatar" title={profile.name}>{getInitials(profile.name)}</div>
          <div className="aiw-avatar is-ai" title="AI Assistant">AI</div>
        </div>
        <button type="button" className={`aiw-saved${saving ? " is-saving" : ""}`} onClick={handleSaveDraft}>
          <Cloud size={14} />
          {saving ? "Saving..." : "Saved"}
        </button>
        <button type="button" className="aiw-support-btn">Support</button>
      </div>

      <div className="aiw-body">
        <NeuralSidebar
          activeKey={activeKey}
          onSelect={setActiveKey}
          insightText={insightText}
          onGenerateNext={handleGenerateNext}
          generating={generating}
        />

        <DocumentCanvas
          key={editorKey}
          ref={canvasRef}
          initialContent={article.html}
          onUpdate={handleContentUpdate}
          title={title}
          onTitleChange={setTitle}
          meta={`Draft v2.4 · Updated ${updatedLabel}`}
        />

        <SeoSidebar
          score={contentScore}
          keywordDensity="1.2%"
          keywordDensityPct={62}
          readability={68}
          readabilityLabel="68 (Grade 10)"
          revisions={revisions}
          onPublishToWeb={handlePublishToWeb}
          onExport={handleExport}
          onPublishNow={handlePublishNow}
          publishing={publishing}
        />
      </div>

      <div className="aiw-statusbar">
        <span><span className="aiw-status-dot" />Draft v2.4 saved</span>
        <span>Collaboration: 2 active</span>
        <span>{saving ? "Syncing to Cloud..." : "Synced to Cloud"}</span>
        <div className="aiw-statusbar-spacer" />
        <span>{wordCount.toLocaleString()} Words</span>
        <span>{readingMinutes}m Read</span>
      </div>

      <div className="aiw-fab-stack">
        <button type="button" className="aiw-fab is-primary" aria-label="Chat">
          <MessageCircle size={20} />
        </button>
        <button type="button" className="aiw-fab is-secondary" aria-label="Help">
          <HelpCircle size={17} />
        </button>
      </div>

      {/* New AI Draft dialog — width scales with screen size */}
      <Dialog
        open={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        fullWidth
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: { xs: "calc(100% - 32px)", sm: 560, md: 720, lg: 880, xl: 1000 },
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: brandColors.primary }}>
            <Wand2 size={20} />
            <Typography component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
              Let AI draft your article
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Describe your topic, pick a tone and length, and AI will replace the current draft with a fresh one.
            </Typography>
            <TextField
              label="What should this article be about?"
              placeholder="e.g. The future of remote work, AI in healthcare, sustainable packaging..."
              multiline
              minRows={2}
              fullWidth
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block", mb: 1 }}>Tone</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {TONES.map((t) => (
                  <Chip key={t} label={t} onClick={() => setTone(t)}
                    sx={{ fontWeight: 700, ...(tone === t ? { bgcolor: brandColors.primary, color: "#fff" } : { bgcolor: brandColors.bgSecondary, color: "text.secondary" }) }} />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block", mb: 1 }}>Length</Typography>
              <Stack direction="row" spacing={1}>
                {LENGTHS.map((l) => (
                  <Chip key={l} label={l} onClick={() => setLength(l)}
                    sx={{ fontWeight: 700, ...(length === l ? { bgcolor: brandColors.primary, color: "#fff" } : { bgcolor: brandColors.bgSecondary, color: "text.secondary" }) }} />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block", mb: 1 }}>Category</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {CATEGORIES.map((c) => (
                  <Chip key={c} label={c} onClick={() => setCategory(c)}
                    sx={{ fontWeight: 700, ...(category === c ? { bgcolor: brandColors.dark, color: "#fff" } : { bgcolor: brandColors.bgSecondary, color: "text.secondary" }) }} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setIntakeOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!canGenerate}
            onClick={runGeneration}
            startIcon={generating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <Sparkles size={16} />}
            sx={{ bgcolor: brandColors.primary, fontWeight: 700, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            {generating ? "Generating..." : "Generate Article"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {toast && (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
}
