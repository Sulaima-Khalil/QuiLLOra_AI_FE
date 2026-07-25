import { Box, Typography, Stack, Avatar, AvatarGroup, CircularProgress } from "@mui/material";
import {
  FileText,
  Eye,
  DollarSign,
  Send,
  Users,
  MessageSquare,
  Share2,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { brandColors } from "../../theme/muiTheme";

const NEG = "#C25B4A";

const cardSx = {
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 1,
};

const labelSx = {
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: 0.9,
  color: "text.secondary",
  textTransform: "uppercase",
};

const valueSx = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 800,
  color: "text.primary",
  lineHeight: 1.2,
};

/* ---------- small primitives ---------- */

const TrendPill = ({ value, up = true }) => (
  <Stack
    direction="row"
    spacing={0.25}
    sx={{
      alignItems: "center",
      px: 0.75,
      py: 0.25,
      borderRadius: 999,
      bgcolor: up ? "rgba(45,212,191,0.14)" : "rgba(194,91,74,0.14)",
    }}
  >
    {up ? <ArrowUpRight size={11} color={brandColors.secondary} /> : <ArrowDownRight size={11} color={NEG} />}
    <Typography sx={{ fontSize: 10, fontWeight: 800, color: up ? brandColors.secondary : NEG }}>
      {value}
    </Typography>
  </Stack>
);

const Badge = ({ children, tone = "primary" }) => {
  const map = {
    primary: { bg: "rgba(15,158,140,0.12)", fg: brandColors.primary },
    mint: { bg: "rgba(45,212,191,0.14)", fg: brandColors.secondary },
    gold: { bg: "rgba(227,180,72,0.16)", fg: brandColors.accentGold },
    neutral: { bg: brandColors.bgSecondary, fg: brandColors.text },
  }[tone];
  return (
    <Box
      sx={{
        px: 1,
        py: 0.35,
        borderRadius: 999,
        bgcolor: map.bg,
        color: map.fg,
        fontSize: 10,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {children}
    </Box>
  );
};

// Mini bar chart — last bar emphasised.
const MiniBars = ({ data, height = 40, accent = brandColors.secondary }) => {
  const max = Math.max(...data);
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "flex-end", height }}>
      {data.map((v, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            height: `${Math.max((v / max) * 100, 6)}%`,
            borderRadius: 0.75,
            bgcolor: i === data.length - 1 ? brandColors.primary : accent,
            opacity: i === data.length - 1 ? 1 : 0.4,
          }}
        />
      ))}
    </Stack>
  );
};

// Filled area chart (no bare line).
const AreaChart = ({ id, data, height = 46, color = brandColors.primary }) => {
  const w = 100;
  const h = 40;
  const pad = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - pad - ((v - min) / range) * (h - pad * 2)]);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <Box component="svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" sx={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
};

// Percentage ring (double CircularProgress).
const Ring = ({ value, size = 74, color = brandColors.primary, children }) => (
  <Box sx={{ position: "relative", display: "inline-flex" }}>
    <CircularProgress variant="determinate" value={100} size={size} thickness={4} sx={{ color: brandColors.bgSecondary }} />
    <CircularProgress
      variant="determinate"
      value={value}
      size={size}
      thickness={4}
      sx={{ position: "absolute", left: 0, color, "& .MuiCircularProgress-circle": { strokeLinecap: "round" } }}
    />
    <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {children}
    </Box>
  </Box>
);

// Semicircle radial gauge.
const Gauge = ({ value, color = brandColors.primary }) => {
  const len = Math.PI * 37;
  const offset = len * (1 - value / 100);
  const d = "M8,46 A37,37 0 0 1 82,46";
  return (
    <Box component="svg" width="90" height="54" viewBox="0 0 90 54">
      <path d={d} fill="none" stroke={brandColors.bgSecondary} strokeWidth="8" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={offset}
      />
    </Box>
  );
};

const ProgressRow = ({ label, value, pct, color = brandColors.primary }) => (
  <Box>
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.primary" }}>{value}</Typography>
    </Stack>
    <Box sx={{ height: 7, borderRadius: 999, bgcolor: brandColors.bgSecondary, overflow: "hidden" }}>
      <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: 999, bgcolor: color }} />
    </Box>
  </Box>
);

/* ---------- section ---------- */

export default function Analytics() {
  return (
    <Box sx={{ gridColumn: "1 / -1", display: "grid", gap: 1.5 }}>
      {/* Tier 1 — compact KPIs, each a different micro-visualization */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
        {/* KPI card — number + trend pill + comparison */}
        <Box sx={{ ...cardSx, p: 2, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "rgba(15,158,140,0.12)" }}>
              <FileText size={15} color={brandColors.primary} />
            </Box>
            <TrendPill value="+18.4%" />
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={labelSx}>Total Articles</Typography>
            <Typography variant="h5" sx={valueSx}>128</Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary", mt: 0.25 }}>
              vs <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>108</Box> last month
            </Typography>
          </Box>
        </Box>

        {/* Percentage ring — publish rate */}
        <Box sx={{ ...cardSx, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Ring value={75} color={brandColors.primary}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", lineHeight: 1 }}>75%</Typography>
          </Ring>
          <Box>
            <Typography sx={labelSx}>Published</Typography>
            <Typography variant="h6" sx={valueSx}>96</Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>of 128 total</Typography>
          </Box>
        </Box>

        {/* Area chart — views */}
        <Box sx={{ ...cardSx, p: 2, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={labelSx}>Views</Typography>
              <Typography variant="h5" sx={valueSx}>248K</Typography>
            </Box>
            <TrendPill value="+24.7%" />
          </Stack>
          <Box sx={{ mt: 1 }}>
            <AreaChart id="views-area" data={[8, 14, 11, 18, 15, 22, 20, 28]} color={brandColors.primary} />
          </Box>
        </Box>

        {/* KPI + comparison bars — revenue */}
        <Box sx={{ ...cardSx, p: 2, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "rgba(227,180,72,0.16)" }}>
              <DollarSign size={15} color={brandColors.accentGold} />
            </Box>
            <TrendPill value="+31.4%" />
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={labelSx}>Revenue</Typography>
            <Typography variant="h5" sx={valueSx}>$4,862</Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <MiniBars data={[6, 9, 7, 11, 10, 14, 16]} accent={brandColors.accentGold} height={26} />
          </Box>
        </Box>
      </Box>

      {/* Tier 2 — feature cards, taller, distinct layouts */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 1.5, alignItems: "stretch" }}>
        {/* Publishing pipeline — progress bars + badges */}
        <Box sx={{ ...cardSx, p: 2.5, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>Publishing Pipeline</Typography>
            <Send size={15} color={brandColors.text} />
          </Stack>
          <Stack spacing={1.75} sx={{ flex: 1 }}>
            <ProgressRow label="Published" value="96" pct={75} color={brandColors.primary} />
            <ProgressRow label="Drafts" value="32" pct={25} color={brandColors.secondary} />
            <ProgressRow label="Scheduled" value="8" pct={10} color={brandColors.accentGold} />
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ mt: 2, flexWrap: "wrap", gap: 0.75 }}>
            <Badge tone="primary">3 in review</Badge>
            <Badge tone="neutral">136 total</Badge>
          </Stack>
        </Box>

        {/* Audience growth — bar chart */}
        <Box sx={{ ...cardSx, p: 2.5, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>Audience Growth</Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.75 }}>
                <Typography variant="h5" sx={valueSx}>92.6K</Typography>
                <TrendPill value="+18.3%" />
              </Stack>
              <Typography sx={{ fontSize: 10.5, color: "text.secondary", mt: 0.25 }}>readers this month</Typography>
            </Box>
            <Users size={15} color={brandColors.text} />
          </Stack>
          <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", minHeight: 74 }}>
            <MiniBars data={[42, 55, 48, 63, 58, 71, 66, 80]} height={74} />
          </Box>
          <Typography sx={{ fontSize: 9.5, color: "text.secondary", mt: 1, letterSpacing: 0.5 }}>LAST 8 WEEKS</Typography>
        </Box>

        {/* Performance — radial gauge + engagement + avatar stack */}
        <Box sx={{ ...cardSx, p: 2.5, display: "flex", flexDirection: "column", gridColumn: { md: "1 / -1", lg: "auto" } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>Performance</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ position: "relative", textAlign: "center" }}>
              <Gauge value={77} color={brandColors.primary} />
              <Box sx={{ mt: -1.5 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary", lineHeight: 1 }}>23.1%</Typography>
                <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: "text.secondary" }}>GROWTH</Typography>
              </Box>
            </Box>
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <MessageSquare size={13} color={brandColors.text} />
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Comments</Typography>
                </Stack>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: "text.primary" }}>2,846</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <Share2 size={13} color={brandColors.text} />
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Shares</Typography>
                </Stack>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: "text.primary" }}>6,492</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <Heart size={13} color={brandColors.text} />
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Likes</Typography>
                </Stack>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: "text.primary" }}>18.9K</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Box sx={{ height: "1px", bgcolor: "divider", my: 1.75 }} />

          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <AvatarGroup
                max={4}
                sx={{
                  "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 10, fontWeight: 700, border: "2px solid", borderColor: "background.paper" },
                }}
              >
                <Avatar sx={{ bgcolor: `${brandColors.primary}22`, color: brandColors.primary }}>AR</Avatar>
                <Avatar sx={{ bgcolor: `${brandColors.secondary}22`, color: brandColors.secondary }}>SK</Avatar>
                <Avatar sx={{ bgcolor: `${brandColors.accentGold}22`, color: brandColors.accentGold }}>MJ</Avatar>
                <Avatar sx={{ bgcolor: brandColors.bgSecondary, color: brandColors.text }}>+9</Avatar>
              </AvatarGroup>
              <Box>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
                  <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.primary" }}>12 active now</Typography>
                </Stack>
                <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>18.7K followers</Typography>
              </Box>
            </Stack>
            <TrendPill value="+21.1%" />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
