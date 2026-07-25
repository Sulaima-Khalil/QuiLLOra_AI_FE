import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { Check, X, CheckCircle2 } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";

const checklist = [
  "AI-powered writing that saves hours",
  "Built-in SEO tools to rank higher",
  "Beautiful publishing with custom domains",
  "Real-time analytics and insights",
  "Trusted by top creators and teams worldwide",
];

const rows = [
  { feature: "AI Writing Assistant", ink: true, other: "limited" },
  { feature: "SEO Optimization", ink: true, other: "limited" },
  { feature: "Custom Publishing", ink: true, other: false },
  { feature: "Analytics Dashboard", ink: true, other: "limited" },
  { feature: "AI Content Suggestions", ink: true, other: false },
  { feature: "Priority Support", ink: true, other: "limited" },
];

function Cell({ value }) {
  if (value === true) return <Check size={20} style={{ margin: "0 auto", display: "block" }} color={brandColors.secondary} />;
  if (value === false) return <X size={20} style={{ margin: "0 auto", display: "block" }} color="#C0392B" />;
  return <Typography variant="caption" sx={{ color: "text.secondary" }}>{value}</Typography>;
}

export default function WhyChooseUs() {
  return (
    <Box component="section">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 6, alignItems: "center" }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
              Why Choose InkFlow AI?
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
              Everything You Need To Create, Publish &amp; Grow
            </Typography>
            <List sx={{ mt: 2 }}>
              {checklist.map((item) => (
                <ListItem key={item} disableGutters sx={{ py: 0.75, alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                    <CheckCircle2 size={20} color={brandColors.secondary} />
                  </ListItemIcon>
                  <ListItemText slotProps={{ primary: { variant: "body2", color: "text.secondary" } }} primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ borderRadius: "10px", overflowX: "auto", overflowY: "hidden", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", boxShadow: 1 }}>
            <Table size="small" sx={{ minWidth: 420 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: brandColors.bgSecondary }}>
                  <TableCell sx={{ fontFamily: "var(--font-button)", fontWeight: 700 }}>Features</TableCell>
                  <TableCell align="center" sx={{ fontFamily: "var(--font-button)", fontWeight: 700, color: "primary.main" }}>
                    InkFlow AI
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: "var(--font-button)", fontWeight: 700, color: "text.secondary" }}>
                    Other Platforms
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.feature} sx={{ bgcolor: i % 2 === 1 ? "rgba(255,255,255,0.035)" : "transparent" }}>
                    <TableCell sx={{ color: "text.primary", fontWeight: 500 }}>{row.feature}</TableCell>
                    <TableCell align="center">
                      <Cell value={row.ink} />
                    </TableCell>
                    <TableCell align="center">
                      <Cell value={row.other} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
