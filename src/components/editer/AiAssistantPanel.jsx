import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Sparkles, Wand2 } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";
import { capability, fetchEntitlements, subscribeEntitlements } from "../../utils/entitlementsStore";
import { generateArticle, generateParagraph } from "../../utils/aiStore";
import { isPlanLimitError } from "../../utils/apiClient";

const TONES = ["Academic", "Minimalist", "Persuasive", "Technical"];
const LENGTHS = ["Short", "Medium", "Long"];
const CATEGORIES = ["General", "AI", "Design", "Technology", "Business", "Science"];

export default function AiAssistantPanel({ onArticleGenerated, onParagraphGenerated, onError }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Academic");
  const [length, setLength] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [generatingParagraph, setGeneratingParagraph] = useState(false);
  const [variation, setVariation] = useState(0);

  const [aiQuota, setAiQuota] = useState(() => capability("aiGenerationsPerDay"));

  useEffect(() => {
    const unsubscribe = subscribeEntitlements(() =>
      setAiQuota(capability("aiGenerationsPerDay"))
    );
    fetchEntitlements().then(() => setAiQuota(capability("aiGenerationsPerDay")));
    return unsubscribe;
  }, []);

  const handleGenerateArticle = async () => {
    if (!topic.trim()) {
      onError?.("Please enter a topic to generate an article.");
      return;
    }

    setGeneratingArticle(true);
    try {
      const result = await generateArticle({
        topic: topic.trim(),
        tone,
        length,
        category,
        variation,
      });

      onArticleGenerated?.(result);
      setVariation((prev) => prev + 1);

      // Refresh daily AI quota counter after successful generation
      fetchEntitlements().then(() => setAiQuota(capability("aiGenerationsPerDay")));
    } catch (err) {
      if (isPlanLimitError(err)) {
        onError?.(err?.response?.data?.message || "Daily AI limit reached for your plan.");
      } else {
        onError?.(err?.message || "Failed to generate article. Please try again.");
      }
    } finally {
      setGeneratingArticle(false);
    }
  };

  const handleGenerateParagraph = async () => {
    setGeneratingParagraph(true);
    try {
      const paragraph = await generateParagraph({ topic: topic.trim(), variation });
      onParagraphGenerated?.(paragraph);
      setVariation((prev) => prev + 1);
    } catch (err) {
      onError?.(err?.message || "Failed to generate paragraph.");
    } finally {
      setGeneratingParagraph(false);
    }
  };

  return (
    <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
      <Stack spacing={2.5}>
        {/* Header Title */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Sparkles size={18} color={brandColors.teal} />
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              AI Writer Assistant
            </Typography>
          </Stack>
          {aiQuota && (
            <Chip
              size="small"
              label={`${aiQuota.remaining}/${aiQuota.limit} daily left`}
              color={aiQuota.remaining > 0 ? "primary" : "default"}
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary">
          Enter any topic below and let AI draft a complete article or write the next paragraph for you.
        </Typography>

        {/* Topic Input Field */}
        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            ARTICLE TOPIC / PROMPT *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. Artificial Intelligence in Healthcare: Opportunities and Challenges"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={generatingArticle || generatingParagraph}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>

        {/* Tone Selector */}
        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            WRITING TONE
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {TONES.map((t) => (
              <Chip
                key={t}
                label={t}
                clickable
                size="small"
                onClick={() => setTone(t)}
                color={tone === t ? "primary" : "default"}
                variant={tone === t ? "filled" : "outlined"}
                sx={{ mb: 0.75 }}
              />
            ))}
          </Stack>
        </Box>

        {/* Length Selector */}
        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            ARTICLE LENGTH
          </Typography>
          <Stack direction="row" spacing={0.75}>
            {LENGTHS.map((l) => (
              <Chip
                key={l}
                label={l}
                clickable
                size="small"
                onClick={() => setLength(l)}
                color={length === l ? "primary" : "default"}
                variant={length === l ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        </Box>

        {/* Category Selector */}
        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            CATEGORY
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                clickable
                size="small"
                onClick={() => setCategory(c)}
                color={category === c ? "primary" : "default"}
                variant={category === c ? "filled" : "outlined"}
                sx={{ mb: 0.75 }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              generatingArticle ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={18} />
            }
            onClick={handleGenerateArticle}
            disabled={generatingArticle || generatingParagraph || !topic.trim()}
            fullWidth
            sx={{
              py: 1.25,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(15, 118, 110, 0.25)",
            }}
          >
            {generatingArticle ? "Generating Full Article..." : "Generate Full Article"}
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={
              generatingParagraph ? <CircularProgress size={16} color="inherit" /> : <Wand2 size={16} />
            }
            onClick={handleGenerateParagraph}
            disabled={generatingArticle || generatingParagraph}
            fullWidth
            size="small"
            sx={{
              py: 1,
              borderRadius: 2,
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            {generatingParagraph ? "Drafting Paragraph..." : "Insert Next Paragraph"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
