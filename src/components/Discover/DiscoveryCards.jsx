import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { ArticleCard, ArticleCardGrid } from "../shared/ArticleCard";
import {
  getDiscoverArticles,
  isDiscoverLoaded,
  refreshDiscover,
  subscribeDiscover,
} from "../../utils/discoverStore";

/**
 * The public Discover feed.
 *
 * The hardcoded DISCOVER_ARTICLES array has been replaced by the backend's
 * published public articles, served through `discoverStore`.
 */
export const DiscoveryCards = ({ query = "", isBookmarked, onToggleBookmark }) => {
  const [articles, setArticles] = useState(getDiscoverArticles);
  const [loaded, setLoaded] = useState(isDiscoverLoaded);

  useEffect(() => {
    const unsubscribe = subscribeDiscover((next) => {
      setArticles(next);
      setLoaded(true);
    });

    refreshDiscover().catch(() => setLoaded(true));

    return unsubscribe;
  }, []);

  // Filtering stays client-side so typing feels instant against the loaded
  // page; the store also accepts a `search` param for larger catalogues.
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? articles.filter((article) =>
        `${article.title} ${article.category} ${article.author}`.toLowerCase().includes(needle),
      )
    : articles;

  if (!loaded) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
        Loading articles…
      </Typography>
    );
  }

  if (filtered.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
        {needle ? `No articles match "${query}".` : "No published articles yet."}
      </Typography>
    );
  }

  return (
    <ArticleCardGrid>
      {filtered.map((item) => (
        <ArticleCard
          key={item.id}
          {...item}
          bookmarked={isBookmarked?.(item.id)}
          onToggleBookmark={() => onToggleBookmark?.(item)}
        />
      ))}
    </ArticleCardGrid>
  );
};
