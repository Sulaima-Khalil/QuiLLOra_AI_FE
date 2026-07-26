import { Box, Stack, Typography, Button, Avatar, Chip, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Users, SearchX, TriangleAlert, FileText } from "lucide-react";
import { ArticleCard, ArticleCardGrid } from "../shared/ArticleCard";
import { brandColors } from "../../theme/muiTheme";
import { getInitials } from "../../utils/profileStore";

/**
 * Results for a global search, grouped by content type.
 *
 * Articles reuse the Discover card so a result looks like the thing it is;
 * collections and people get compact rows in the same surface language rather
 * than a second card design.
 */

const SectionHeading = ({ icon: Icon, label, count }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
    <Icon size={15} color={brandColors.mint} />
    <Typography
      variant="caption"
      sx={{ fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: "text.secondary" }}
    >
      {label}
    </Typography>
    <Chip
      label={count}
      size="small"
      sx={{ height: 18, fontSize: 10.5, fontWeight: 700, bgcolor: brandColors.bgSecondary, color: "text.secondary" }}
    />
  </Stack>
);

/**
 * Shared row shell for the collection and people results.
 *
 * Rendered as a real <button>. It was a clickable Stack — a div with an
 * onClick — so pointer users could open a result and keyboard users could
 * not reach it at all. Making it a button rather than adding tabIndex and a
 * key handler means the role, Enter, Space and focus all come from the
 * browser.
 */
const ResultRow = ({ onClick, label, children }) => (
  <Stack
    component="button"
    type="button"
    direction="row"
    spacing={1.75}
    onClick={onClick}
    aria-label={label}
    sx={{
      alignItems: "center",
      width: "100%",
      textAlign: "left",
      font: "inherit",
      color: "inherit",
      p: 1.75,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      cursor: "pointer",
      transition: "border-color 0.15s",
      "&:hover": { borderColor: brandColors.primary },
    }}
  >
    {children}
  </Stack>
);

const CentredNotice = ({ icon: Icon, title, description, action }) => (
  <Stack spacing={1.75} sx={{ alignItems: "center", textAlign: "center", py: { xs: 6, md: 9 } }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: brandColors.hover,
        color: brandColors.primary,
      }}
    >
      <Icon size={26} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
      {description}
    </Typography>
    {action}
  </Stack>
);

export const SearchResults = ({ query, status, results, error, onClear, onRetry, isBookmarked, onToggleBookmark }) => {
  const navigate = useNavigate();

  if (status === "loading") {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: { xs: 6, md: 9 } }}>
        <CircularProgress size={24} thickness={4} sx={{ color: brandColors.mint }} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Searching for “{query}”…
        </Typography>
      </Stack>
    );
  }

  if (status === "error") {
    return (
      <CentredNotice
        icon={TriangleAlert}
        title="Search is unavailable right now"
        description={error || "We couldn't reach the search service. Please try again."}
        action={
          <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
            <Button onClick={onRetry} variant="contained" sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}>
              Try again
            </Button>
            <Button onClick={onClear} variant="outlined" sx={{ color: "text.primary", borderColor: "divider" }}>
              Clear search
            </Button>
          </Stack>
        }
      />
    );
  }

  const { articles = [], collections = [], people = [] } = results ?? {};

  if (articles.length + collections.length + people.length === 0) {
    return (
      <CentredNotice
        icon={SearchX}
        title={`No results for “${query}”`}
        description="Try a different spelling, a shorter phrase, or a broader term."
        action={
          <Button onClick={onClear} variant="outlined" sx={{ color: "text.primary", borderColor: "divider", mt: 0.5 }}>
            Clear search
          </Button>
        }
      />
    );
  }

  return (
    <Stack spacing={4}>
      {articles.length > 0 && (
        <Box>
          <SectionHeading icon={FileText} label="Articles" count={articles.length} />
          <ArticleCardGrid>
            {articles.map((item) => (
              <ArticleCard
                key={item.id}
                {...item}
                // Every Discover result is published, so it has a public page.
                onRead={() => navigate(`/article/${item.id}`)}
                bookmarked={isBookmarked?.(item.id)}
                onToggleBookmark={onToggleBookmark ? () => onToggleBookmark(item) : undefined}
              />
            ))}
          </ArticleCardGrid>
        </Box>
      )}

      {collections.length > 0 && (
        <Box>
          <SectionHeading icon={FolderOpen} label="Collections" count={collections.length} />
          <Stack spacing={1.25}>
            {collections.map((collection) => (
              <ResultRow
                key={collection.id}
                label={`Open collection ${collection.name}`}
                onClick={() => navigate(`/dashboard/collections?collection=${collection.id}`)}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: brandColors.hover,
                    color: brandColors.primary,
                    flexShrink: 0,
                  }}
                >
                  <FolderOpen size={18} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {/* `span`, because a button may only contain phrasing
                      content and Typography defaults to <p>. */}
                  <Typography component="span" sx={{ display: "block", fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                    {collection.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {collection.description || `${collection.count ?? collection.articles?.length ?? 0} articles`}
                  </Typography>
                </Box>
              </ResultRow>
            ))}
          </Stack>
        </Box>
      )}

      {people.length > 0 && (
        <Box>
          <SectionHeading icon={Users} label="People" count={people.length} />
          <Stack spacing={1.25}>
            {people.map((person) => (
              <ResultRow
                key={person.id}
                label={`View profile for ${person.name}`}
                onClick={() => navigate(`/author/${person.username || person.id}`)}
              >
                <Avatar
                  src={person.avatar || undefined}
                  alt=""
                  sx={{ width: 40, height: 40, fontSize: 13, fontWeight: 700, bgcolor: brandColors.primary }}
                >
                  {getInitials(person.name)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography component="span" sx={{ display: "block", fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                    {person.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {person.role || (person.username ? `@${person.username}` : "Writer")}
                  </Typography>
                </Box>
              </ResultRow>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};
