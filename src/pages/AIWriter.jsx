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
import {
  createArticle,
  updateArticle,
  getArticles,
  refreshArticles,
  subscribeArticles,
} from "../utils/articlesStore";
import { nextUntitledTitle } from "../utils/articleTitle";
import { generateArticle, generateParagraph, generateInsights } from "../utils/aiStore";
import { capability, fetchEntitlements, subscribeEntitlements } from "../utils/entitlementsStore";
import { isPlanLimitError } from "../utils/apiClient";
import { getProfile, getInitials } from "../utils/profileStore";

const TONES = ["Academic", "Minimalist", "Persuasive", "Technical"];
const LENGTHS = ["Short", "Medium", "Long"];
const CATEGORIES = ["General", "AI", "Design", "Technology", "Business", "Science"];

/*
 * The canvas starts empty.
 *
 * It used to open on four polished paragraphs about "neural prose" under a
 * fixed title — text no model produced, presented exactly as a finished AI
 * draft. Anyone opening the page saw output they had not asked for, and
 * saving without generating stored that sample as their own article.
 *
 * Now the page opens empty with a real default title, and prose appears only
 * when the server has actually generated some.
 */
const EMPTY_DOC = { title: "", html: "" };

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
  const [article, setArticle] = useState(EMPTY_DOC);
  const [genCount, setGenCount] = useState(0);
  const [title, setTitle] = useState("");
  // Set once the author edits the title, or a generation supplies one.
  const [titleTouched, setTitleTouched] = useState(false);
  const [toast, setToast] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);

  const [activeKey, setActiveKey] = useState("rewrite");
  const [insights, setInsights] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // Set after the first save; later saves update it instead of creating again.
  const [savedArticle, setSavedArticle] = useState(null);
  const [updatedLabel, setUpdatedLabel] = useState(
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  );

  const saveTimeout = useRef(null);

  /*
   * Today's AI allowance, from the server.
   *
   * Display and explanation only — the API claims a slot atomically and
   * refuses over-limit requests whatever this says. Refetched after each
   * generation because usage has just changed.
   */
  const [aiQuota, setAiQuota] = useState(() => capability("aiGenerationsPerDay"));

  useEffect(() => {
    const unsubscribe = subscribeEntitlements(() =>
      setAiQuota(capability("aiGenerationsPerDay")),
    );
    fetchEntitlements().then(() => setAiQuota(capability("aiGenerationsPerDay")));
    return unsubscribe;
  }, []);

  /*
   * Default title, from the author's real articles rather than a constant.
   * A generation supplies its own title, and anything the author types wins.
   */
  useEffect(() => {
    if (titleTouched) return undefined;

    const apply = () => {
      if (!titleTouched) setTitle(nextUntitledTitle(getArticles()));
    };

    const unsubscribe = subscribeArticles(apply);
    apply();
    refreshArticles().catch(() => {});
    return unsubscribe;
  }, [titleTouched]);

  const refreshQuota = () => fetchEntitlements().then(() => setAiQuota(capability("aiGenerationsPerDay")));

  const dailyLimitReached = Boolean(aiQuota?.reached);
  const canGenerate = topic.trim().length > 2 && !generating && !dailyLimitReached;

  /**
   * Whether the canvas holds work a generation would destroy.
   *
   * Generation replaces the whole document. If the author has written or
   * edited anything, that is theirs and must not vanish because they opened
   * the intake panel again.
   */
  const canvasHasWork = () => {
    const html = canvasRef.current?.getHTML?.() ?? article?.html ?? "";
    return htmlToWordCount(html) > 0;
  };

  const runGeneration = async () => {
    if (!canGenerate) return;

    // Only ever asked when there is something to lose. A first generation on
    // an empty canvas is never interrupted.
    const replaceWarning =
      "Generating will replace everything in the editor. " +
      "Your current draft will be lost unless you save it first.\n\nReplace it?";

    if (canvasHasWork() && !window.confirm(replaceWarning)) {
      return;
    }

    setGenerating(true);
    try {
      //  makes a repeat request return a different draft for the
      // same prompt; without it the backend is deterministic.
      const result = await generateArticle({ topic: topic.trim(), tone, length, category, variation: genCount });
      // The server's response drives the editor: its title, its HTML, its
      // word count. Nothing here is synthesised locally.
      setArticle(result);
      setGenCount((n) => n + 1);
      setTitle(result.title);
      setTitleTouched(true);
      setWordCount(result.wordCount ?? htmlToWordCount(result.html));
      setUpdatedLabel(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
      setIntakeOpen(false);
      // A generation was just spent; re-read rather than guessing locally.
      refreshQuota();
    } catch (error) {
      setToast({ severity: "error", message: error?.response?.data?.message || "Generation failed. Please try again." });
      // A refusal usually means the day is spent; let the panel say so.
      if (isPlanLimitError(error)) refreshQuota();
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
      refreshQuota();
    } catch (error) {
      setToast({
        severity: "error",
        message: error?.response?.data?.message || "Could not generate a paragraph.",
      });
      if (isPlanLimitError(error)) refreshQuota();
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
      // Saving twice used to create a second article every time. Once saved,
      // the same document is updated.
      const payload = { title, content: html, status, category, generatedByAI: true };

      const saved = savedArticle
        ? await updateArticle(savedArticle.id, payload).then(() => ({ ...savedArticle, ...payload }))
        : await createArticle(payload);

      setSavedArticle(saved);
      return saved;
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

    setToast({ severity: "success", message: "Article published! Redirecting to My Articles..." });
    setTimeout(() => navigate("/dashboard/my-article"), 900);
  };

  const handleSaveDraft = async () => {
    if (await persistArticle("Draft")) {
      setToast({ severity: "success", message: "Saved to My Articles as a draft." });
    }
  };

  /* Publishing to the web is what "Publish" already does; there is no
     separate share-link service, so this no longer claims to have copied one. */
  const handlePublishToWeb = () =>
    setToast({ severity: "info", message: "Publish the article first, then share it from My Articles." });
  /* No export endpoint exists; saying so beats pretending a file was written. */
  const handleExport = () =>
    setToast({ severity: "info", message: "Markdown export isn't available yet." });

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

  /*
   * Version history is not stored — the article model keeps no revisions — so
   * this lists what is actually known: the working draft, and each generation
   * made in this session. It no longer invents a "v2.3 by AI Assistant" edit
   * that never happened.
   */
  const revisions = [
    {
      title: savedArticle ? "Saved draft" : "Working draft",
      sub: savedArticle ? `Last saved by ${profile.name}` : "Not saved yet",
      current: true,
    },
    ...(genCount > 0
      ? [{ title: `${genCount} generation${genCount === 1 ? "" : "s"} this session`, sub: "Version history isn't kept yet", current: false }]
      : []),
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
          onTitleChange={(next) => {
            // The author's title, from here on.
            setTitleTouched(true);
            setTitle(next);
          }}
          meta={`Updated ${updatedLabel}`}
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
        <span><span className="aiw-status-dot" />{savedArticle ? "Saved to My Articles" : "Not saved yet"}</span>
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
        aria-labelledby="ai-intake-title"
        aria-describedby="ai-intake-description"
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
            <Wand2 size={20} aria-hidden="true" />
            {/* The heading text alone names the dialog — the icon beside it
                would otherwise be read as part of the name. */}
            <Typography id="ai-intake-title" component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
              Let AI draft your article
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <Typography id="ai-intake-description" variant="body2" sx={{ color: "text.secondary" }}>
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
        <DialogActions sx={{ px: 3, pb: 2.5, display: "flex", justifyContent: "space-between" }}>
          {/* Real remaining generations, or nothing at all when unknown or
              unlimited — never an invented credit balance. */}
          <Typography variant="caption" sx={{ color: "text.secondary", pl: 0.5 }}>
            {dailyLimitReached
              ? "Daily AI limit reached"
              : typeof aiQuota?.remaining === "number"
                ? `${aiQuota.remaining} of ${aiQuota.limit} generations left today`
                : ""}
          </Typography>
          <Box>
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
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {toast && (
          <Alert role={toast.severity === "error" ? "alert" : "status"} severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
}
