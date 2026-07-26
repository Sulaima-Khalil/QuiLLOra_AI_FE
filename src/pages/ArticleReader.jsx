import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowLeft, Clock, Share2, FileLock2, Compass } from "lucide-react";
import QuilloraMark from "../components/brand/QuilloraMark";
import { brandColors } from "../theme/muiTheme";
import { fetchPublicArticle } from "../utils/articlesStore";
import { recordArticleView } from "../utils/discoverStore";
import { shareArticle } from "../utils/shareArticle";
import { getInitials } from "../utils/profileStore";
import { useSeo } from "../utils/useSeo";
import { SITE, absoluteUrl, clampDescription } from "../utils/seo";

/**
 * Public article reader.
 *
 * Readable signed-out: the route carries no guard because `GET /articles/:id`
 * is optionally authenticated and already refuses anything unpublished or
 * private to anyone but the author.
 */

const READING_WIDTH = 720;

const formatPublished = (article) => {
  const iso = article.publishedAt || article.createdAt;
  if (!iso) return article.date || "";

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return article.date || "";

  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

/** Shared chrome: the wordmark, so a shared link still looks like the product. */
const ReaderShell = ({ children }) => (
  <Box sx={{ minHeight: "100vh", bgcolor: brandColors.bg }}>
    <Stack
      direction="row"
      sx={{ alignItems: "center", maxWidth: 1180, mx: "auto", px: { xs: 2, md: 3 }, py: 2.5 }}
    >
      <Stack
        component={Link}
        to="/"
        direction="row"
        spacing={1.25}
        sx={{ alignItems: "center", textDecoration: "none" }}
      >
        <QuilloraMark size={32} style={{ flexShrink: 0 }} />
        <Typography variant="h6" sx={{ color: "#fff" }}>
          QuiLLora <Box component="span" sx={{ color: brandColors.mint }}>AI</Box>
        </Typography>
      </Stack>
    </Stack>

    <Box sx={{ maxWidth: READING_WIDTH, mx: "auto", px: { xs: 2, md: 3 }, pb: 10 }}>{children}</Box>
  </Box>
);

/** Centred message used by the missing and unpublished states. */
const ReaderNotice = ({ icon, title, description, actions }) => (
  <Stack spacing={2.5} sx={{ alignItems: "center", textAlign: "center", py: { xs: 8, md: 12 } }}>
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: brandColors.hover,
        color: brandColors.primary,
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
      {description}
    </Typography>
    {actions}
  </Stack>
);

export default function ArticleReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // `forId` tags the result with the article it belongs to, so a change of
  // route param reads as "loading" without the effect resetting state itself.
  const [state, setState] = useState({ status: "loading", article: null, isOwner: false, forId: id });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchPublicArticle(id)
      .then(({ article, isOwner }) => {
        if (cancelled) return;

        // The server only ever hands an unpublished article to its author.
        // The public page still refuses to render one.
        if (article.status !== "Published") {
          setState({ status: "unpublished", article, isOwner, forId: id });
          return;
        }

        setState({ status: "ready", article, isOwner, forId: id });
        recordArticleView(article.id);
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing", article: null, isOwner: false, forId: id });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Going "back" only makes sense when this page was reached from inside the
  // app; a shared link opens with no history to return to.
  const goBack = useCallback(() => {
    if (location.key !== "default") navigate(-1);
    else navigate("/dashboard/discover");
  }, [location.key, navigate]);

  const { status, article, isOwner } =
    state.forId === id ? state : { status: "loading", article: null, isOwner: false };

  /*
   * Article metadata, and only for an article that is genuinely public.
   *
   * A draft reaches this component when its own author opens the link, and an
   * unknown id renders the same "unavailable" screen. Neither may advertise a
   * canonical URL or be indexed: a canonical would tell search engines the
   * page is the authoritative version of something they cannot see, and would
   * leak a private title into the tab and the crawler's index.
   */
  const isPublic = status === "ready" && article?.status === "Published";

  useSeo(
    isPublic
      ? {
          title: `${article.title} — ${SITE.name}`,
          description: clampDescription(article.excerpt || article.description || ""),
          canonical: absoluteUrl(`/article/${article.id}`),
          type: "article",
          // Only a real, absolute cover URL. Bundled placeholder covers are
          // local paths that a crawler could not fetch.
          image: /^https?:\/\//.test(article.coverImage || "") ? article.coverImage : undefined,
          article: {
            publishedTime: article.publishedAt || article.createdAt || undefined,
            modifiedTime: article.updatedAt || undefined,
            author: article.author || undefined,
            section: article.category || undefined,
            tags: article.tags ?? [],
          },
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            // Every field below comes from the API; nothing is invented, and
            // anything the backend did not send is simply omitted.
            ...(article.excerpt ? { description: clampDescription(article.excerpt) } : {}),
            ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
            ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
            ...(article.author ? { author: { "@type": "Person", name: article.author } } : {}),
            ...(article.wordCount ? { wordCount: article.wordCount } : {}),
            ...(article.tags?.length ? { keywords: article.tags.join(", ") } : {}),
            mainEntityOfPage: absoluteUrl(`/article/${article.id}`),
            publisher: { "@type": "Organization", name: SITE.name },
          },
        }
      : {
          // Loading, missing, and the author's own unpublished draft.
          title: status === "loading" ? `Loading — ${SITE.name}` : `Article unavailable — ${SITE.name}`,
          noindex: true,
        },
    [status, article?.id, article?.status, article?.updatedAt],
  );

  const handleShare = async () => {
    const result = await shareArticle({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || article.description,
    });

    if (!result.silent) setToast(result);
  };

  if (status === "loading") {
    return (
      <ReaderShell>
        <Stack spacing={2} sx={{ alignItems: "center", py: { xs: 8, md: 12 } }}>
          <CircularProgress size={26} thickness={4} sx={{ color: brandColors.mint }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Loading article…
          </Typography>
        </Stack>
      </ReaderShell>
    );
  }

  if (status === "missing") {
    return (
      <ReaderShell>
        <ReaderNotice
          icon={<Compass size={30} />}
          title="This article isn't available"
          description="It may have been unpublished, removed, or the link may be wrong."
          actions={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
              <Button component={Link} to="/" variant="outlined" sx={{ color: "text.primary", borderColor: "divider" }}>
                Back to Home
              </Button>
              <Button
                component={Link}
                to="/dashboard/discover"
                variant="contained"
                sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
              >
                Browse Discover
              </Button>
            </Stack>
          }
        />
      </ReaderShell>
    );
  }

  if (status === "unpublished") {
    return (
      <ReaderShell>
        <ReaderNotice
          icon={<FileLock2 size={30} />}
          title="This article hasn't been published"
          description={
            isOwner
              ? "Only you can see this draft. Publish it from the editor to give it a public page."
              : "It may have been unpublished, removed, or the link may be wrong."
          }
          actions={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
              <Button component={Link} to="/dashboard/discover" variant="outlined" sx={{ color: "text.primary", borderColor: "divider" }}>
                Browse Discover
              </Button>
              {isOwner && (
                <Button
                  component={Link}
                  to={`/dashboard/write?edit=${article.id}`}
                  variant="contained"
                  sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
                >
                  Open in editor
                </Button>
              )}
            </Stack>
          }
        />
      </ReaderShell>
    );
  }

  return (
    <ReaderShell>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Button
          onClick={goBack}
          startIcon={<ArrowLeft size={16} />}
          sx={{ px: 0, color: "text.secondary", "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
        >
          Back
        </Button>
        <Tooltip title="Share this article">
          <IconButton
            onClick={handleShare}
            aria-label="Share this article"
            sx={{
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              "&:hover": { bgcolor: brandColors.hover, color: brandColors.mint },
            }}
          >
            <Share2 size={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      {article.category && (
        <Chip
          label={article.category}
          size="small"
          sx={{
            height: 22,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            bgcolor: brandColors.hover,
            color: brandColors.mint,
          }}
        />
      )}

      <Typography
        component="h1"
        sx={{
          mt: 1.5,
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: { xs: "2rem", md: "2.75rem" },
          lineHeight: 1.15,
          color: "text.primary",
        }}
      >
        {article.title}
      </Typography>

      {(article.excerpt || article.description) && (
        <Typography sx={{ mt: 1.5, fontSize: 17, lineHeight: 1.6, color: "text.secondary", fontStyle: "italic" }}>
          {article.excerpt || article.description}
        </Typography>
      )}

      <Stack direction="row" spacing={1.5} sx={{ mt: 3, alignItems: "center" }}>
        <Avatar
          src={article.authorAvatar || undefined}
          sx={{ width: 42, height: 42, fontSize: 14, fontWeight: 700, bgcolor: brandColors.primary }}
        >
          {getInitials(article.author)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
            {article.author || "Unknown author"}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "text.secondary", flexWrap: "wrap" }}>
            {article.authorRole && (
              <Typography variant="caption" sx={{ fontSize: 11.5 }}>
                {article.authorRole} ·
              </Typography>
            )}
            <Typography variant="caption" sx={{ fontSize: 11.5 }}>
              {formatPublished(article)}
            </Typography>
            {article.readingTime && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <Clock size={12} />
                <Typography variant="caption" sx={{ fontSize: 11.5 }}>
                  {article.readingTime}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ mt: 3 }} />

      {article.img && (
        <Box
          component="img"
          src={article.img}
          alt=""
          sx={{ width: "100%", mt: 3, borderRadius: 3, display: "block", aspectRatio: "16 / 9", objectFit: "cover" }}
        />
      )}

      {/*
        The stored HTML is sanitised server-side on every write against an
        allow-list matching what the TipTap editor can produce, so the body is
        rendered as markup rather than escaped text.
      */}
      <Box
        dangerouslySetInnerHTML={{ __html: article.content || "" }}
        sx={{
          mt: 4,
          color: "text.primary",
          fontSize: 17,
          lineHeight: 1.8,
          "& p": { my: 2.5 },
          "& h1, & h2, & h3, & h4": {
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 400,
            lineHeight: 1.25,
            mt: 4,
            mb: 1.5,
          },
          "& h1": { fontSize: "1.9rem" },
          "& h2": { fontSize: "1.6rem" },
          "& h3": { fontSize: "1.3rem" },
          "& h4": { fontSize: "1.1rem" },
          "& a": { color: brandColors.mint, textDecoration: "underline" },
          "& ul, & ol": { pl: 3, my: 2.5 },
          "& li": { mb: 0.75 },
          "& blockquote": {
            my: 3,
            pl: 2.5,
            borderLeft: "3px solid",
            borderColor: brandColors.primary,
            color: "text.secondary",
            fontStyle: "italic",
          },
          "& pre": {
            my: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: brandColors.bgSecondary,
            border: "1px solid",
            borderColor: "divider",
            overflowX: "auto",
            fontSize: 14,
          },
          "& code": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.9em" },
          "& img": { maxWidth: "100%", height: "auto", borderRadius: 2, my: 3, display: "block" },
          "& hr": { my: 4, border: 0, borderTop: "1px solid", borderColor: "divider" },
          "& table": { width: "100%", borderCollapse: "collapse", my: 3, display: "block", overflowX: "auto" },
          "& th, & td": { border: "1px solid", borderColor: "divider", p: 1, textAlign: "left" },
        }}
      />

      {article.tags?.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 5, flexWrap: "wrap", gap: 1 }}>
          {article.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ bgcolor: brandColors.bgSecondary, color: "text.secondary", fontSize: 11.5 }}
            />
          ))}
        </Stack>
      )}

      <Divider sx={{ mt: 5 }} />

      <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: "center" }}>
        <Button
          onClick={handleShare}
          startIcon={<Share2 size={15} />}
          variant="outlined"
          sx={{ color: "text.primary", borderColor: "divider" }}
        >
          Share this article
        </Button>
        <Button
          component={Link}
          to="/dashboard/discover"
          variant="contained"
          sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
        >
          More articles
        </Button>
      </Stack>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          role={toast?.ok ? "status" : "alert"}
          severity={toast?.ok ? "success" : "error"}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ borderRadius: 2 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ReaderShell>
  );
}
