import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Stack, Snackbar, Alert } from "@mui/material";
import { DiscoveryHeader } from "../components/Discover/Header";
import { DiscoveryCards } from "../components/Discover/DiscoveryCards";
import {
  getState,
  toggleBookmark,
  subscribeCollections,
  refreshCollections,
} from "../utils/collectionsStore";
import { refreshDiscover } from "../utils/discoverStore";

export const Discover = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [collectionsState, setCollectionsState] = useState(getState);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeCollections(setCollectionsState);
    refreshCollections();
    refreshDiscover();
    return unsubscribe;
  }, []);

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

  return (
    <Stack spacing={3}>
      <DiscoveryHeader query={query} onQueryChange={setQuery} />
      <Box>
        <DiscoveryCards
          query={query}
          isBookmarked={(id) => collectionsState.bookmarks.includes(id)}
          onToggleBookmark={handleToggleBookmark}
        />
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {toast && (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </Stack>
  );
};
