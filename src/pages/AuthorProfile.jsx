import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import { ArrowLeft, UserX } from "lucide-react";
import QuilloraMark from "../components/brand/QuilloraMark";
import { ArticleCard, ArticleCardGrid } from "../components/shared/ArticleCard";
import { brandColors } from "../theme/muiTheme";
import { fetchPublicProfile, getInitials } from "../utils/profileStore";
import { useSeo } from "../utils/useSeo";
import { SITE, absoluteUrl, clampDescription } from "../utils/seo";

/**
 * Public author page — the destination behind a "people" search result.
 *
 * Backed by the existing `GET /users/:identifier`, which accepts an id or a
 * username and already returns only published, public work to a visitor. The
 * store function existed with no page to call it; this is that page.
 */

const StatBlock = ({ label, value }) => (
  <Box sx={{ textAlign: "center", px: { xs: 1.5, sm: 2.5 } }}>
    <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 800, color: "text.primary" }}>
      {value}
    </Typography>
    <Typography
      sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "text.secondary" }}
    >
      {label}
    </Typography>
  </Box>
);

const Shell = ({ children }) => (
  <Box sx={{ minHeight: "100vh", bgcolor: brandColors.bg }}>
    <Stack
      direction="row"
      sx={{ alignItems: "center", maxWidth: 1180, mx: "auto", px: { xs: 2, md: 3 }, py: 2.5 }}
    >
      <Stack component={Link} to="/" direction="row" spacing={1.25} sx={{ alignItems: "center", textDecoration: "none" }}>
        <QuilloraMark size={32} style={{ flexShrink: 0 }} />
        <Typography variant="h6" sx={{ color: "#fff" }}>
          QuiLLora <Box component="span" sx={{ color: brandColors.mint }}>AI</Box>
        </Typography>
      </Stack>
    </Stack>
    <Box sx={{ maxWidth: 1080, mx: "auto", px: { xs: 2, md: 3 }, pb: 10 }}>{children}</Box>
  </Box>
);

export default function AuthorProfile() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", data: null, forId: identifier });

  useEffect(() => {
    let cancelled = false;

    fetchPublicProfile(identifier)
      .then((data) => {
        if (!cancelled) setState({ status: "done", data, forId: identifier });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "missing", data: null, forId: identifier });
      });

    return () => {
      cancelled = true;
    };
  }, [identifier]);

  const { status, data } = state.forId === identifier ? state : { status: "loading", data: null };

  /*
   * Author metadata, only once a real profile has loaded.
   *
   * An unknown identifier renders the "couldn't find that writer" screen and
   * must not claim a canonical URL for a person who does not exist.
   *
   * The canonical uses the username when the profile has one, so the same
   * author reached by id and by username resolves to a single indexed URL
   * rather than two competing ones.
   */
  const profileData = status === "done" ? data?.profile : null;
  const canonicalId = profileData?.username || profileData?.id;

  useSeo(
    profileData
      ? {
          title: `${profileData.name} — ${SITE.name}`,
          description: clampDescription(
            profileData.bio ||
              `${profileData.name} publishes on ${SITE.name}.`,
          ),
          canonical: absoluteUrl(`/author/${canonicalId}`),
          type: "profile",
          image: /^https?:\/\//.test(profileData.avatar || "") ? profileData.avatar : undefined,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: profileData.name,
            // Only fields the API actually returned.
            ...(profileData.bio ? { description: profileData.bio } : {}),
            ...(profileData.role ? { jobTitle: profileData.role } : {}),
            ...(profileData.avatar ? { image: profileData.avatar } : {}),
            url: absoluteUrl(`/author/${canonicalId}`),
          },
        }
      : {
          title: status === "loading" ? `Loading — ${SITE.name}` : `Writer not found — ${SITE.name}`,
          noindex: true,
        },
    [status, profileData?.id, profileData?.username],
  );

  if (status === "loading") {
    return (
      <Shell>
        <Stack spacing={2} sx={{ alignItems: "center", py: { xs: 8, md: 12 } }}>
          <CircularProgress size={26} thickness={4} sx={{ color: brandColors.mint }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Loading profile…
          </Typography>
        </Stack>
      </Shell>
    );
  }

  if (status === "missing") {
    return (
      <Shell>
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
            <UserX size={30} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
            We couldn&apos;t find that writer
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 380 }}>
            The profile may have been removed, or the link may be wrong.
          </Typography>
          <Button
            component={Link}
            to="/dashboard/discover"
            variant="contained"
            sx={{ mt: 1, bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            Browse Discover
          </Button>
        </Stack>
      </Shell>
    );
  }

  const { profile, articles = [], stats = {} } = data ?? {};

  return (
    <Shell>
      <Button
        onClick={() => navigate(-1)}
        startIcon={<ArrowLeft size={16} />}
        sx={{ mb: 2, px: 0, color: "text.secondary", "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
      >
        Back
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 3 }}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Avatar
          src={profile?.avatar || undefined}
          sx={{ width: 88, height: 88, fontSize: 30, fontWeight: 700, bgcolor: brandColors.primary, flexShrink: 0 }}
        >
          {getInitials(profile?.name)}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          {profile?.role && (
            <Typography
              sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: brandColors.mint, textTransform: "uppercase" }}
            >
              {profile.role}
            </Typography>
          )}
          <Typography
            sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: { xs: "1.75rem", sm: "2.25rem" }, lineHeight: 1.1, color: "text.primary", mt: 0.5 }}
          >
            {profile?.name}
          </Typography>
          {profile?.username && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              @{profile.username}
            </Typography>
          )}
          {profile?.bio && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.25, maxWidth: 620, lineHeight: 1.65 }}>
              {profile.bio}
            </Typography>
          )}
        </Box>

        <Stack direction="row" divider={<Box sx={{ borderLeft: "1px solid", borderColor: "divider" }} />}>
          <StatBlock label="Published" value={stats.published ?? articles.length} />
          <StatBlock label="Reads" value={stats.totalViews ?? 0} />
        </Stack>
      </Stack>

      <Typography
        variant="caption"
        sx={{ display: "block", mt: 4, mb: 1.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: "text.secondary" }}
      >
        Published work
      </Typography>

      {articles.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
          {profile?.name?.split(" ")[0] || "This writer"} hasn&apos;t published anything yet.
        </Typography>
      ) : (
        <ArticleCardGrid>
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              {...article}
              onRead={() => navigate(`/article/${article.id}`)}
            />
          ))}
        </ArticleCardGrid>
      )}
    </Shell>
  );
}
