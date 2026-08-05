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

const EMPTY_DOC = { title: "", html: "" };

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
  const [titleTouched, setTitleTouched] = useState(false);
  const [toast, setToast] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);

  const [activeKey, setActiveKey] = useState("rewrite");
  const [insights, setInsights] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedArticle, setSavedArticle] = useState(null);
  const [updatedLabel, setUpdatedLabel] = useState(
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  );

  const saveTimeout = useRef(null);

  const [aiQuota, setAiQuota] = useState(() => capability("aiGenerationsPerDay"));

  useEffect(() => {
    const unsubscribe = subscribeEntitlements(() =>
      setAiQuota(capability("aiGenerationsPerDay")),
    );
    fetchEntitlements().then(() => setAiQuota(capability("aiGenerationsPerDay")));
    return unsubscribe;
  }, []);

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

  const handleUpdate = (html, text) => {
    setArticle((prev) => ({ ...prev, html }));
    setWordCount(wordsFromText(text).length);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setUpdatedLabel(
        new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      );
    }, 1000);
  };

  const handleGenerate = async () => {
    if (generating) return;

    if (!title.trim()) {
      setTitle(nextUntitledTitle(getArticles()));
    }

    setGenerating(true);
    try {
      const result = await generateArticle({
        topic,
        tone,
        length,
        category,
        variation: genCount,
      });

      setArticle({ title: result.title || title, html: result.html });
      setWordCount(result.wordCount);
      if (result.title) setTitle(result.title);
      setTitleTouched(true);
      setGenCount((c) => c + 1);

      fetchEntitlements().then(() => setAiQuota(capability("aiGenerationsPerDay")));
      setIntakeOpen(false);

      generateInsights({
        content: result.html,
        topic,
        tone,
        length,
        category,
      })
        .then(setInsights)
        .catch(() => {});
    } catch (err) {
      if (isPlanLimitError(err)) {
        setToast({
          severity: "error",
          message: err?.response?.data?.message || "AI limit reached.",
        });
        fetchEntitlements().then(() => setAiQuota(capability("aiGenerationsPerDay")));
      } else {
        setToast({ severity: "error", message: err?.message || "Failed to generate article." });
      }
    } finally {
      setGenerating(false);
    }
  };

  const requestGeneration = () => {
    if (!topic.trim()) {
      setToast({ severity: "warning", message: "Enter a topic to generate." });
      return;
    }

    const currentText = (canvasRef.current?.getText?.() || "").trim();
    if (currentText && currentText.length > 0) {
      if (!window.confirm("Replace your current draft with the newly generated article?")) return;
    }

    handleGenerate();
  };

  const handleInsertParagraph = async () => {
    try {
      const paragraph = await generateParagraph({ topic, variation: genCount });
      canvasRef.current?.insertParagraph?.(paragraph);
      setGenCount((c) => c + 1);
    } catch (err) {
      setToast({ severity: "error", message: err?.message || "Failed to generate paragraph." });
    }
  };

  const handleSaveDraft = async () => {
    const html = canvasRef.current?.getHTML() || "";
    if (!title.trim()) {
      setToast({ severity: "warning", message: "Add a title first." });
      return;
    }

    const payload = {
      title,
      content: html,
      status: "Draft",
      category,
      generatedByAI: true,
    };

    setSaving(true);
    try {
      if (savedArticle) {
        await updateArticle(savedArticle.id, payload);
      } else {
        const created = await createArticle(payload);
        setSavedArticle(created);
      }
      setToast({ severity: "success", message: "Draft saved." });
    } catch (err) {
      setToast({ severity: "error", message: err?.message || "Could not save draft." });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const html = canvasRef.current?.getHTML() || "";
    if (!title.trim()) {
      setToast({ severity: "warning", message: "Add a title first." });
      return;
    }

    const payload = {
      title,
      content: html,
      status: "Published",
      category,
      generatedByAI: true,
    };

    setPublishing(true);
    try {
      if (savedArticle) {
        await updateArticle(savedArticle.id, { ...payload, status: "Published" });
      } else {
        const created = await createArticle(payload);
        setSavedArticle(created);
      }
      setToast({ severity: "success", message: "Article published!" });
      setTimeout(() => navigate("/dashboard/my-article"), 900);
    } catch (err) {
      setToast({ severity: "error", message: err?.message || "Could not publish article." });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Box className="aiw-root">
      <header className="aiw-header">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            component={Link}
            to="/dashboard"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Dashboard
          </Button>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            AI Writer
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {aiQuota && (
            <Chip
              size="small"
              label={`${aiQuota.remaining}/${aiQuota.limit} daily generations`}
              color={aiQuota.remaining > 0 ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<Sparkles size={16} />}
            onClick={() => setIntakeOpen(true)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            New AI Draft
          </Button>

          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            {saving ? "Saving…" : "Saved"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handlePublish}
            disabled={publishing}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Publish
          </Button>
        </Stack>
      </header>

      <Box className="aiw-body">
        <NeuralSidebar
          wordCount={wordCount}
          updatedLabel={updatedLabel}
          insights={insights}
          activeKey={activeKey}
          onKeyChange={setActiveKey}
        />

        <DocumentCanvas
          ref={canvasRef}
          title={title}
          onTitleChange={(val) => {
            setTitleTouched(true);
            setTitle(val);
          }}
          initialContent={article.html}
          onUpdate={handleUpdate}
        />

        <SeoSidebar
          topic={topic}
          tone={tone}
          length={length}
          category={category}
          onInsertParagraph={handleInsertParagraph}
        />
      </Box>

      <Dialog open={intakeOpen} onClose={() => setIntakeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate AI Article</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              id="ai-topic-input"
              label="What should this article be about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Distributed Systems and High Availability"
              fullWidth
              multiline
              rows={3}
            />

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Tone
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {TONES.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    clickable
                    color={tone === t ? "primary" : "default"}
                    onClick={() => setTone(t)}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Length
              </Typography>
              <Stack direction="row" spacing={1}>
                {LENGTHS.map((l) => (
                  <Chip
                    key={l}
                    label={l}
                    clickable
                    color={length === l ? "primary" : "default"}
                    onClick={() => setLength(l)}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Category
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    clickable
                    color={category === c ? "primary" : "default"}
                    onClick={() => setCategory(c)}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIntakeOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={requestGeneration}
            disabled={generating || !topic.trim()}
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
          >
            {generating ? "Generating…" : "Generate Article"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast && (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
