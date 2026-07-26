import { useEffect } from "react";
import { applyMeta } from "./seo";

/**
 * Applies page metadata for as long as the component is mounted.
 *
 * Runs in an effect rather than during render because it touches the DOM, and
 * cleans up on unmount so a page's tags never linger on the next route.
 *
 * `deps` controls when the tags are rewritten — pass the values the metadata
 * is derived from, so an article that arrives asynchronously updates the head
 * once it lands.
 */
export const useSeo = (meta, deps = []) => {
  useEffect(() => {
    if (!meta) return undefined;
    return applyMeta(meta);
    // The caller owns invalidation; `meta` is rebuilt every render otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useSeo;
