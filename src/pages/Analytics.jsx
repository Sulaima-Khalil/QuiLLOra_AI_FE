import { useEffect, useState } from "react";
import { Box, Typography, Stack, Button, LinearProgress } from "@mui/material";
import { Calendar, Eye, Timer, Bot, Lightbulb, ArrowRight } from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import { fetchAnalytics, emptyAnalytics } from "../utils/analyticsStore";
import { formatViews } from "../utils/metrics";

/** Colours for the traffic-source bars, keyed by the backend's labels. */
const SOURCE_COLORS = {
  Direct: brandColors.dark,
  Search: brandColors.primary,
  Social: brandColors.secondary,
  Referral: "#B9C6C2",
};

/** Turns total minutes of reading into the "04:42" display format. */
const formatReadTime = (minutes) => {
  const total = Math.max(0, Math.round((minutes ?? 0) * 60));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const cardSx = {
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 1,
};

export default function Analytics() {
  const [report, setReport] = useState(emptyAnalytics);

  useEffect(() => {
    let cancelled = false;
    fetchAnalytics(7).then((data) => !cancelled && setReport(data));
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = report.summary ?? {};

  // The three headline cards, computed from the report rather than hardcoded.
  // Not memoised: three object literals are cheaper to rebuild than to track.
  const stats = [
      {
        label: "Total Page Views",
        icon: Eye,
        value: formatViews(summary.totalViews ?? 0),
        trend: `${(summary.viewsTrend ?? 0) >= 0 ? "+" : ""}${summary.viewsTrend ?? 0}%`,
        trendColor: (summary.viewsTrend ?? 0) >= 0 ? brandColors.secondary : "#C25B4A",
        sub: `${formatViews(summary.periodViews ?? 0)} in the last 7 days`,
      },
      {
        label: "Avg. Read Time",
        icon: Timer,
        value: formatReadTime(
          summary.totalArticles ? (summary.totalReadTime ?? 0) / summary.totalArticles : 0,
        ),
        trend: `${summary.averageWordsPerArticle ?? 0} words`,
        trendColor: brandColors.primary,
        sub: `Across ${summary.totalArticles ?? 0} article${summary.totalArticles === 1 ? "" : "s"}`,
      },
      {
        label: "Reader Engagement",
        icon: Bot,
        value: `${summary.engagementRate ?? 0}%`,
        trend: `${formatViews(summary.uniqueVisitors ?? 0)} readers`,
        trendColor: brandColors.primary,
        sub: "",
        highlight: true,
      },
  ];

  const daily = report.daily ?? [];
  const days = daily.map((entry) => entry.label);

  // Scales the two polylines to the busiest day so the chart always fills
  // its box, whatever the traffic volume.
  const peak = Math.max(1, ...daily.map((entry) => entry.views));
  const toPoints = (key) =>
    daily
      .map((entry, index) => {
        const x = daily.length > 1 ? (index / (daily.length - 1)) * 700 : 0;
        const y = 240 - (entry[key] / peak) * 220;
        return `${Math.round(x)},${Math.round(y)}`;
      })
      .join(" ");

  const viewsLine = toPoints("views");
  const visitorsLine = toPoints("uniqueVisitors");

  const trafficSources = (report.trafficSources ?? []).map((entry) => ({
    label: entry.label,
    value: entry.value,
    color: SOURCE_COLORS[entry.label] ?? "#B9C6C2",
  }));

  const topArticles = (report.topArticles ?? []).map((entry) => ({
    title: entry.title,
    publish: entry.publishedAt
      ? new Date(entry.publishedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    views: formatViews(entry.views),
    engagement: entry.engagement,
  }));

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { sm: "center" }
        }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, color: "text.primary" }}>
            Performance Overview
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              mt: 0.5
            }}>
            <Stack direction="row" spacing={0.75} sx={{
              alignItems: "center"
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>AI-driven analysis active</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{
              alignItems: "center"
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Real-time sync</Typography>
            </Stack>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" size="small" startIcon={<Calendar size={14} />} sx={{ color: "text.primary", borderColor: "divider", bgcolor: "background.paper" }}>
            Last 30 Days
          </Button>
          <Button variant="contained" size="small" sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}>
            Export Report
          </Button>
        </Stack>
      </Stack>
      {/* Stat cards */}
      <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5 }}>
        {stats.map(({ label, icon: Icon, value, trend, trendColor, sub, highlight }) => (
          <Box
            key={label}
            sx={{
              ...cardSx,
              p: 2.5,
              position: "relative",
              overflow: "hidden",
              ...(highlight && {
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 4,
                  bgcolor: brandColors.primary,
                },
              }),
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                {label}
              </Typography>
              <Icon size={15} color={brandColors.text} />
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "baseline",
                mt: 1
              }}>
              <Typography variant="h4" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, color: "text.primary" }}>
                {value}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: trendColor }}>
                {trend}
              </Typography>
            </Stack>
            {sub && (
              <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "text.secondary" }}>
                {sub}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      {/* Engagement + traffic */}
      <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2.5, alignItems: "start" }}>
        {/* Reader engagement chart */}
        <Box sx={{ ...cardSx, p: 3 }}>
          <Stack
            direction="row"
            gap={1}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap"
            }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
              Reader Engagement
            </Typography>
            <Stack direction="row" spacing={2}>
              <Stack direction="row" spacing={0.75} sx={{
                alignItems: "center"
              }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: brandColors.dark }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Scroll Depth</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{
                alignItems: "center"
              }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: brandColors.secondary }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Click-thru</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Box component="svg" viewBox="0 0 700 240" sx={{ mt: 2, width: "100%", height: "auto", display: "block" }}>
            {[0, 60, 120, 180, 240].map((y) => (
              <line key={y} x1="0" y1={y} x2="700" y2={y} stroke={brandColors.border} strokeWidth="1" />
            ))}
            {/* Views and unique readers, scaled to the busiest day. */}
            <polyline
              points={viewsLine}
              fill="none"
              stroke={brandColors.dark}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <polyline
              points={visitorsLine}
              fill="none"
              stroke={brandColors.secondary}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </Box>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              mt: 1.5,
              px: 0.5
            }}>
            {days.map((d, i) => (
              <Typography key={`${d}-${i}`} variant="caption" sx={{ color: "text.secondary" }}>
                {d}
              </Typography>
            ))}
          </Stack>
        </Box>

        {/* Traffic sources */}
        <Box sx={{ ...cardSx, p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Traffic Sources
          </Typography>

          <Stack spacing={2} sx={{ mt: 2.5 }}>
            {trafficSources.map(({ label, value, color }) => (
              <Box key={label}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    mb: 0.75
                  }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {value}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={value}
                  sx={{
                    height: 6,
                    borderRadius: 99,
                    bgcolor: brandColors.bgSecondary,
                    "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 99 },
                  }}
                />
              </Box>
            ))}
          </Stack>

          {/* AI Suggestion */}
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: brandColors.dark, color: "#fff" }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                mb: 0.75
              }}>
              <Lightbulb size={14} color={brandColors.mint} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#fff" }}>
                AI Suggestion
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, display: "block" }}>
              Social traffic is peaking at 8PM. Schedule your next article for maximum impact.
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Top performing articles */}
      <Box sx={{ ...cardSx, mt: 3, p: 3, overflowX: "auto" }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Top Performing Articles
          </Typography>
          <Typography
            component="a"
            href="#"
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600, color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            View Full List <ArrowRight size={14} />
          </Typography>
        </Stack>

        <Box sx={{ minWidth: 560 }}>
          <Box sx={{ mt: 2.5, display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1.4fr", gap: 2, pb: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
            {["ARTICLE TITLE", "PUBLISH", "VIEWS", "ENGAGEMENT"].map((h) => (
              <Typography key={h} variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: "text.secondary" }}>
                {h}
              </Typography>
            ))}
          </Box>

          {topArticles.map(({ title, publish, views, engagement }, i) => (
            <Box
              key={title}
              sx={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr 1.4fr",
                gap: 2,
                alignItems: "center",
                py: 2,
                borderBottom: i < topArticles.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {publish}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {views}
              </Typography>
              <Stack direction="row" spacing={1} sx={{
                alignItems: "center"
              }}>
                <LinearProgress
                  variant="determinate"
                  value={engagement}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 99,
                    bgcolor: brandColors.bgSecondary,
                    "& .MuiLinearProgress-bar": { bgcolor: brandColors.primary, borderRadius: 99 },
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {engagement}%
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
