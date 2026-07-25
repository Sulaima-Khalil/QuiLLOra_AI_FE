import api, { unwrap } from "./apiClient";

/**
 * AI Writer generation, backed by the API.
 *
 * Replaces the client-side template generator in pages/AIWriter.jsx. The
 * returned shape (`{ title, html }`) matches what the page already consumes.
 */

/**
 * Generates a draft.
 * @param {{ topic: string, tone?: string, length?: string, category?: string, variation?: number }} input
 * @returns {Promise<{ title: string, html: string, wordCount: number, readTime: number }>}
 */
export const generateArticle = async ({ topic, tone, length, category, variation = 0 }) => {
  const data = unwrap(
    await api.post("/ai/generate", { topic, tone, length, category, variation }),
  );

  const article = data.article;

  return {
    title: article.title,
    html: article.content,
    content: article.content,
    excerpt: article.excerpt,
    wordCount: article.wordCount,
    readTime: article.readTime,
    readingEase: article.readingEase,
  };
};

/** One extra paragraph, for the "Generate next paragraph" action. */
export const generateParagraph = async ({ topic = "", variation = 0 } = {}) => {
  const data = unwrap(await api.post("/ai/paragraph", { topic, variation }));
  return data.paragraph;
};

/** Editorial feedback for the Neural Sidebar, computed from the live draft. */
export const generateInsights = async ({ content, topic, tone, length, category }) => {
  const data = unwrap(
    await api.post("/ai/insights", { content, topic, tone, length, category }),
  );
  return data.insights;
};

/** Tone, length and category choices offered by the server. */
export const fetchAiOptions = async () => {
  try {
    return await api.get("/ai/options").then(unwrap);
  } catch {
    return {
      tones: ["Academic", "Minimalist", "Persuasive", "Technical"],
      lengths: ["Short", "Medium", "Long"],
      categories: ["General", "AI", "Design", "Technology", "Business", "Science"],
    };
  }
};
