import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Stack, Snackbar, Alert, Typography, Button } from "@mui/material";
import { X } from "lucide-react";
import { DiscoveryHeader } from "../components/Discover/Header";
import { DiscoveryCards } from "../components/Discover/DiscoveryCards";
import { SearchResults } from "../components/Discover/SearchResults";
import {
  getState,
  toggleBookmark,
  subscribeCollections,
  refreshCollections,
} from "../utils/collectionsStore";
import { refreshDiscover } from "../utils/discoverStore";
import { searchAll, normalizeQuery, MIN_QUERY_LENGTH } from "../utils/searchStore";
import { hasSessionFlag } from "../utils/apiClient";
import { brandColors } from "../theme/muiTheme";

/**
 * Discover, in two modes.
 *
 * Without `?q=` it is the browse feed it has always been, filter input and
 * all. With `?q=` it shows global search results. The URL is the single source
 * of truth for the query, so a refresh or a shared link reproduces the page.
 */
export const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = normalizeQuery(searchParams.get("q") || "");

  // The browse-mode filter input, unchanged — a local narrowing of the loaded
  // feed, deliberately separate from the global search.
  const [filter, setFilter] = useState("");
  const [collectionsState, setCollectionsState] = useState(getState);
  const [toast, setToast] = useState(null);
  // Tagged with the query (and retry count) it belongs to, so a change of URL
  // reads as "loading" without the effect having to reset state itself.
  const [search, setSearch] = useState({ status: "idle", results: null, error: "", forKey: "" });
  const [attempt, setAttempt] = useState(0);
  const searchKey = `${searchQuery}|${attempt}`;

  useEffect(() => {
    const unsubscribe = subscribeCollections(setCollectionsState);
    refreshCollections();
    refreshDiscover();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!searchQuery) return undefined;

    let cancelled = false;

    searchAll(searchQuery, { signedIn: hasSessionFlag() })
      .then((results) => {
        if (!cancelled) setSearch({ status: "done", results, error: "", forKey: searchKey });
      })
      .catch((error) => {
        if (cancelled) return;
        setSearch({
          status: "error",
          results: null,
          error: error?.response?.data?.message || "",
          forKey: searchKey,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, searchKey]);

  const current = !searchQuery
    ? { status: "idle", results: null, error: "" }
    : search.forKey === searchKey
    ? search
    : { status: "loading", results: null, error: "" };

  const clearSearch = useCallback(() => {
    // Drop the parameter entirely rather than leaving `?q=`, so the URL of the
    // browse state is the plain one.
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleToggleBookmark = async (article) => {
    const wasBookmarked = collectionsState.bookmarks.includes(article.id);

    try {
      await toggleBookmark(article);
      setToast({
        severity: "success",
        message: wasBookmarked ? "Removed from Collections." : "Saved to Collections.",
      });
    } catch (error) {
      setToast({
        severity: "error",
        message: error?.response?.data?.message || "Could not update your collections.",
      });
    }
  };

  const isBookmarked = (id) => collectionsState.bookmarks.includes(id);
  const searching = Boolean(searchQuery);

  return (
    <Stack spacing={3}>
      <DiscoveryHeader query={filter} onQueryChange={setFilter} hideFilter={searching} />

      {searching ? (
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {searchQuery.length < MIN_QUERY_LENGTH
                ? `Enter at least ${MIN_QUERY_LENGTH} characters to search.`
                : <>Results for <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>“{searchQuery}”</Box></>}
            </Typography>
            <Button
              onClick={clearSearch}
              size="small"
              startIcon={<X size={14} />}
              sx={{ color: "text.secondary", "&:hover": { color: brandColors.mint, bgcolor: "transparent" } }}
            >
              Clear search
            </Button>
          </Stack>

          <SearchResults
            query={searchQuery}
            status={current.status}
            results={current.results}
            error={current.error}
            onClear={clearSearch}
            onRetry={() => setAttempt((n) => n + 1)}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
          />
        </Stack>
      ) : (
        <Box>
          <DiscoveryCards
            query={filter}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
          />
        </Box>
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {toast && (
          <Alert role={toast.severity === "error" ? "alert" : "status"} severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </Stack>
  );
};
