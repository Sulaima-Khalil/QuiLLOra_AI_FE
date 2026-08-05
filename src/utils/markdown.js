import DOMPurify from "dompurify";
import { marked } from "marked";

// The model response remains Markdown. Convert it only at display and editor
// boundaries, then sanitize the generated HTML before TipTap receives it.
export const markdownToHtml = (markdown) => DOMPurify.sanitize(
  marked.parse(markdown || "", { gfm: true, breaks: true }),
  {
    ALLOWED_TAGS: [
      "a", "blockquote", "br", "code", "del", "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr",
      "li", "ol", "p", "pre", "strong", "table", "tbody", "td", "th", "thead", "tr", "ul",
    ],
    ALLOWED_ATTR: ["align", "class", "href", "rel", "target"],
  },
);

export default markdownToHtml;
