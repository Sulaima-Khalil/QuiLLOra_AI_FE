import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  InputBase,
  IconButton,
  Snackbar,
  Alert,
  Switch,
  Select,
  MenuItem,
  Chip,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  ArrowLeft,
  Eye,
  Send,
  Clock,
  List as ListIcon,
  History,
  StickyNote,
  Plus,
  Tag,
  Users,
  UserPlus,
  X,
  HelpCircle,
  Globe,
  Lock,
  Link2,
} from "lucide-react";
import Editor from "../components/editer/Editer";
import { brandColors } from "../theme/muiTheme";
import { fetchArticleById, createArticle, updateArticle } from "../utils/articlesStore";
import { getProfile, getInitials } from "../utils/profileStore";

// Starter document (headings included so the outline lands populated).
const SEED_HTML = [
  "<h1>Introduction</h1>",
  "<p>Open with the promise of the piece — what the reader will walk away understanding. Keep the first paragraph tight and concrete.</p>",
  "<h1>The Core Thesis</h1>",
  "<p>State the central argument plainly, then give it room to breathe. This is the paragraph readers will quote.</p>",
  "<h1>Supporting Detail</h1>",
  "<p>Back the thesis with evidence, examples, or a short story. One idea per paragraph keeps the rhythm clean.</p>",
].join("");

const VISIBILITY = [
  { value: "public", label: "Public (Standard)", icon: Globe },
  { value: "unlisted", label: "Unlisted (Link only)", icon: Link2 },
  { value: "private", label: "Private (Only me)", icon: Lock },
];

const wordsOf = (text) => (text || "").trim().split(/\s+/).filter(Boolean);
const htmlToText = (html) => (html || "").replace(/<[^>]+>/g, " ");
const parseHeadings = (html) => {
  const matches = [...(html || "").matchAll(/<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi)];
  return matches
    .map((m) => ({ level: Number(m[1]), text: m[2].replace(/<[^>]+>/g, "").trim() }))
    .filter((h) => h.text);
};

// Simple, honest readability proxy: shorter sentences read easier.
const readingEase = (text) => {
  const words = wordsOf(text);
  if (!words.length) return 0;
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const avg = words.length / sentences;
  return Math.max(20, Math.min(98, Math.round(120 - avg * 4)));
};

export const Write = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [existingArticle, setExistingArticle] = useState(null);
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const profile = useMemo(() => getProfile(), []);

  const seedContent = SEED_HTML;

  const [title, setTitle] = useState("The Future of Neural Prose");
  const [editorContent, setEditorContent] = useState(seedContent);
  const [outline, setOutline] = useState(() => parseHeadings(seedContent));
  const [stats, setStats] = useState(() => {
    const text = htmlToText(seedContent);
    return { words: wordsOf(text).length, ease: readingEase(text) };
  });

  const [visibility, setVisibility] = useState("public");
  const [allowComments, setAllowComments] = useState(true);
  const [tags, setTags] = useState(["Architecture", "Technology"]);
  const [tagDraft, setTagDraft] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([
    { id: 1, text: "Keep the tone confident yet accessible for the executive summary." },
  ]);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // `?edit=<id>` loads the article from the API. The editor is keyed on
  // `editorContent`, so it remounts with the fetched body once it arrives.
  useEffect(() => {
    if (!editId) return;

    let cancelled = false;

    fetchArticleById(editId)
      .then((article) => {
        if (cancelled) return;

        setExistingArticle(article);
        setTitle(article.title);
        setEditorContent(article.content || SEED_HTML);
        setOutline(parseHeadings(article.content || ""));
        setExcerpt(article.excerpt || "");
        setTags(article.tags?.length ? article.tags : []);
        setVisibility(article.visibility || "public");
        setAllowComments(article.allowComments ?? true);
        setSeoTitle(article.seoTitle || "");
        setNotes(article.notes ?? []);

        const text = htmlToText(article.content || "");
        setStats({ words: wordsOf(text).length, ease: readingEase(text) });
      })
      .catch(() => {
        if (!cancelled) setToast({ severity: "error", message: "Could not load that article." });
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const readingMinutes = Math.max(1, Math.round(stats.words / 200));

  const handleEditorUpdate = ({ html, text, headings }) => {
    setOutline(headings.length ? headings : parseHeadings(html));
    setStats({ words: wordsOf(text).length, ease: readingEase(text) });
  };

  const scrollToHeading = (index) => {
    const nodes = canvasRef.current?.querySelectorAll(".ProseMirror h1, .ProseMirror h2, .ProseMirror h3");
    nodes?.[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addTag = () => {
    const t = tagDraft.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagDraft("");
  };

  const addNote = () => {
    const t = note.trim();
    if (!t) return;
    setNotes((prev) => [...prev, { id: Date.now(), text: t }]);
    setNote("");
  };

  /**
   * Persists the document. Resolves true once the server has accepted it,
   * so the caller can navigate only after the write actually succeeded.
   */
  const savePost = async (status) => {
    const html = editorRef.current?.getHTML() || "";
    if (!title.trim() || editorRef.current?.isEmpty()) {
      setToast({ severity: "warning", message: "Add a title and some content first." });
      return false;
    }

    const payload = {
      title,
      content: html,
      status,
      category: tags[0] || "General",
      excerpt,
      tags,
      visibility,
      allowComments,
      seoTitle,
    };

    setSaving(true);
    try {
      if (existingArticle) {
        await updateArticle(existingArticle.id, payload);
      } else {
        const created = await createArticle(payload);
        // Subsequent saves update this article rather than creating another.
        setExistingArticle(created);
      }
      return true;
    } catch (error) {
      setToast({
        severity: "error",
        message: error?.response?.data?.message || "Could not save your article.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!(await savePost("Published"))) return;
    setToast({ severity: "success", message: "Article published! Redirecting to My Articles..." });
    setTimeout(() => navigate("/dashboard/my-article"), 900);
  };

  const handlePreview = async () => {
    if (await savePost("Draft")) {
      setToast({ severity: "info", message: "Draft saved — opening preview in My Articles." });
    }
  };

  const sectionLabel = {
    px: 0.5,
    fontWeight: 700,
    letterSpacing: 1.5,
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
  };

  const VisibilityIcon = VISIBILITY.find((v) => v.value === visibility)?.icon || Globe;

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: brandColors.dark }}>
      {/* Top bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", px: 2.5, py: 1.25, borderBottom: `1px solid ${brandColors.darkBorder}` }}
      >
        <Tooltip title="Go back" placement="bottom">
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
            sx={{ color: "rgba(255,255,255,0.75)", border: `1px solid ${brandColors.darkBorder}`, borderRadius: 1.5, "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" } }}
          >
            <ArrowLeft size={17} />
          </IconButton>
        </Tooltip>
        <Typography component={Link} to="/dashboard" variant="h6" sx={{ color: "#fff", textDecoration: "none", whiteSpace: "nowrap" }}>
          InkFlow <Box component="span" sx={{ color: brandColors.mint }}>AI</Box>
        </Typography>
        <Box sx={{ width: "1px", height: 20, bgcolor: brandColors.darkBorder, display: { xs: "none", sm: "block" } }} />
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}
        >
          Document: {title}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: "rgba(255,255,255,0.45)", display: { xs: "none", sm: "flex" } }}>
          <Clock size={13} />
          <Typography variant="caption">{saving ? "Saving…" : "Draft saved"}</Typography>
        </Stack>
        <Button
          size="small"
          onClick={handlePreview}
          disabled={saving}
          startIcon={<Eye size={15} />}
          sx={{
            color: "rgba(255,255,255,0.85)",
            border: `1px solid ${brandColors.darkBorder}`,
            px: 1.75,
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
          }}
        >
          Preview
        </Button>
        <Button
          size="small"
          onClick={handlePublish}
          disabled={saving}
          startIcon={<Send size={15} />}
          sx={{ bgcolor: brandColors.mint, color: brandColors.dark, fontWeight: 700, px: 2, "&:hover": { bgcolor: "#25A67F" } }}
        >
          Publish
        </Button>
      </Stack>

      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left sidebar — structure / version history / notes */}
        <Box
          sx={{
            width: 250,
            flexShrink: 0,
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            p: 2,
            overflowY: "auto",
            borderRight: `1px solid ${brandColors.darkBorder}`,
          }}
        >
          <Typography sx={{ ...sectionLabel, mb: 1.5 }}>
            <ListIcon size={12} style={{ verticalAlign: "-1px", marginRight: 6 }} />
            Structure
          </Typography>
          <Stack spacing={0.25} sx={{ mb: 3 }}>
            {outline.length ? (
              outline.map((h, i) => (
                <Stack
                  key={`${h.text}-${i}`}
                  direction="row"
                  spacing={1}
                  onClick={() => scrollToHeading(i)}
                  sx={{
                    alignItems: "center",
                    pl: 0.5 + (h.level - 1) * 1.5,
                    py: 0.85,
                    pr: 1,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    color: i === 0 ? brandColors.mint : "rgba(255,255,255,0.6)",
                    "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)" },
                  }}
                >
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: i === 0 ? brandColors.mint : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.text}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography variant="caption" sx={{ px: 0.5, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                Add headings to build your outline.
              </Typography>
            )}
          </Stack>

          <Typography sx={{ ...sectionLabel, mb: 1.5 }}>
            <History size={12} style={{ verticalAlign: "-1px", marginRight: 6 }} />
            Version History
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {[
              { label: "Current Draft", meta: "just now · You", current: true },
              { label: "Autosave", meta: "5 mins ago · You", current: false },
            ].map((v) => (
              <Stack key={v.label} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    mt: 0.5,
                    flexShrink: 0,
                    bgcolor: v.current ? brandColors.mint : "rgba(255,255,255,0.3)",
                    boxShadow: v.current ? `0 0 0 3px rgba(45,212,191,0.2)` : "none",
                  }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
                    {v.label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>
                    {v.meta}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          <Typography sx={{ ...sectionLabel, mb: 1.5 }}>
            <StickyNote size={12} style={{ verticalAlign: "-1px", marginRight: 6 }} />
            Notes
          </Typography>
          <Stack spacing={1} sx={{ mb: 1.5 }}>
            {notes.map((n) => (
              <Box
                key={n.id}
                sx={{ p: 1.25, borderRadius: 2, bgcolor: brandColors.darkCard, border: `1px solid ${brandColors.darkBorder}` }}
              >
                <Typography variant="caption" sx={{ display: "block", lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
                  {n.text}
                </Typography>
              </Box>
            ))}
          </Stack>
          <TextField
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), addNote())}
            placeholder="Add a note..."
            size="small"
            multiline
            fullWidth
            sx={{
              "& .MuiInputBase-root": { fontSize: 12.5, color: "#fff", bgcolor: brandColors.darkCard },
              "& fieldset": { borderColor: brandColors.darkBorder },
            }}
          />

          <Box sx={{ flex: 1 }} />

          <Button
            fullWidth
            onClick={addNote}
            startIcon={<Plus size={15} />}
            sx={{ mt: 2, py: 1.1, bgcolor: brandColors.primary, color: "#fff", fontWeight: 700, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            New Note
          </Button>
        </Box>

        {/* Document area */}
        <Box
          ref={canvasRef}
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: brandColors.bg,
            overflowY: "auto",
            position: "relative",
            p: { xs: 1.5, sm: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              maxWidth: 820,
              width: "100%",
              mx: "auto",
              bgcolor: "#ffffff",
              borderRadius: 0,
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              p: { xs: 2.5, sm: 5, md: 6 },
            }}
          >
            <InputBase
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => !title.trim() && setTitle("Untitled Article")}
              fullWidth
              multiline
              sx={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontWeight: 400,
                fontSize: { xs: "1.6rem", sm: "2.25rem" },
                lineHeight: 1.15,
                color: "#0f172a",
                "& textarea, & input": { p: 0 },
              }}
            />
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 1, mb: 3 }}>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {existingArticle ? "Editing" : "Draft"}
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#94a3b8" }} />
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </Typography>
            </Stack>

            <Editor
              // Remounts once the article being edited has loaded, so the
              // editor picks up the fetched body as its initial content.
              key={existingArticle?.id ?? "new"}
              ref={editorRef}
              initialContent={editorContent}
              onCreate={handlePublish}
              onUpdate={handleEditorUpdate}
            />
          </Box>

          {/* Floating help (no AI) */}
          <Stack spacing={1} sx={{ position: "fixed", right: { xs: 12, sm: 24 }, bottom: 24, zIndex: 20 }}>
            <Tooltip title="Writing help" placement="left">
              <IconButton
                onClick={() => setToast({ severity: "info", message: "Support request sent — our editorial team will reach out at support@inkflow.ai." })}
                sx={{ bgcolor: brandColors.dark, color: "#fff", borderRadius: 2, boxShadow: 3, border: `1px solid ${brandColors.darkBorder}`, "&:hover": { bgcolor: brandColors.primaryDark } }}
              >
                <HelpCircle size={17} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Right sidebar — publishing / tags / metadata / collaborators */}
        <Box
          sx={{
            width: 288,
            flexShrink: 0,
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            p: 2,
            overflowY: "auto",
            borderLeft: `1px solid ${brandColors.darkBorder}`,
          }}
        >
          <Typography sx={{ ...sectionLabel, mb: 1.5 }}>Publishing Settings</Typography>

          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", mb: 0.75 }}>Visibility</Typography>
          <Select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            size="small"
            startAdornment={<VisibilityIcon size={14} style={{ marginRight: 8, color: brandColors.mint }} />}
            sx={{
              mb: 2,
              color: "#fff",
              bgcolor: brandColors.darkCard,
              fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: brandColors.darkBorder },
              "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.6)" },
            }}
          >
            {VISIBILITY.map((v) => (
              <MenuItem key={v.value} value={v.value} sx={{ fontSize: 13 }}>{v.label}</MenuItem>
            ))}
          </Select>

          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="body2" sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Allow Comments</Typography>
            <Switch
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              size="small"
              sx={{ "& .Mui-checked": { color: brandColors.mint }, "& .Mui-checked + .MuiSwitch-track": { bgcolor: `${brandColors.mint} !important` } }}
            />
          </Stack>

          <Typography sx={{ ...sectionLabel, mb: 1.5 }}>
            <Tag size={12} style={{ verticalAlign: "-1px", marginRight: 6 }} />
            Content Tags
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
            {tags.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                onDelete={() => setTags((prev) => prev.filter((x) => x !== t))}
                deleteIcon={<X size={13} />}
                sx={{ bgcolor: "rgba(45,212,191,0.12)", color: brandColors.mint, border: `1px solid rgba(45,212,191,0.3)`, "& .MuiChip-deleteIcon": { color: brandColors.mint } }}
              />
            ))}
          </Box>
          <TextField
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="+ Add tag"
            size="small"
            fullWidth
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: 12.5, color: "#fff", bgcolor: brandColors.darkCard }, "& fieldset": { borderColor: brandColors.darkBorder } }}
          />

          <Typography sx={{ ...sectionLabel, mb: 1.5 }}>Metadata</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", mb: 0.75 }}>SEO Title</Typography>
          <TextField
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Enter SEO optimized title..."
            size="small"
            fullWidth
            sx={{ mb: 2, "& .MuiInputBase-root": { fontSize: 12.5, color: "#fff", bgcolor: brandColors.darkCard }, "& fieldset": { borderColor: brandColors.darkBorder } }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", mb: 0.75 }}>Excerpt</Typography>
          <TextField
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary for social cards..."
            size="small"
            multiline
            minRows={3}
            fullWidth
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: 12.5, color: "#fff", bgcolor: brandColors.darkCard }, "& fieldset": { borderColor: brandColors.darkBorder } }}
          />

          <Typography sx={{ ...sectionLabel, mb: 1.5 }}>
            <Users size={12} style={{ verticalAlign: "-1px", marginRight: 6 }} />
            Collaborators
          </Typography>
          <Stack spacing={1.25} sx={{ mb: 1.5 }}>
            {[
              { name: profile.name, role: "You (Editor)", online: true },
              { name: "Marcus Chen", role: "Viewed 15m ago", online: false },
            ].map((c) => (
              <Stack key={c.role} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: c.online ? brandColors.primary : brandColors.darkCard,
                    border: `1px solid ${brandColors.darkBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(c.name)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontSize: 12.5, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 10.5, color: c.online ? brandColors.mint : "rgba(255,255,255,0.4)" }}>
                    {c.role}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
          <Button
            startIcon={<UserPlus size={14} />}
            onClick={() => setToast({ severity: "info", message: "Invite link copied to clipboard (demo)." })}
            sx={{ justifyContent: "flex-start", color: brandColors.mint, fontSize: 12.5, px: 0.5, mb: 3, "&:hover": { bgcolor: "rgba(45,212,191,0.08)" } }}
          >
            Invite Collaborator
          </Button>

          <Box sx={{ flex: 1 }} />

          {/* Reading stats (word count / read time / reading ease) */}
          <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: brandColors.darkCard, border: `1px solid ${brandColors.darkBorder}` }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              {[
                { label: "WORDS", value: stats.words.toLocaleString() },
                { label: "READ", value: `${readingMinutes}m` },
              ].map((s) => (
                <Box key={s.label} sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 9, letterSpacing: 1, color: "rgba(255,255,255,0.4)" }}>{s.label}</Typography>
                  <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>{s.value}</Typography>
                </Box>
              ))}
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 9, letterSpacing: 1, color: "rgba(255,255,255,0.4)" }}>READING EASE</Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: brandColors.mint }}>{stats.ease}/100</Typography>
            </Stack>
            <Box sx={{ height: 5, borderRadius: 999, bgcolor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${stats.ease}%`, bgcolor: brandColors.mint, borderRadius: 999, transition: "width 0.3s ease" }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
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
};
