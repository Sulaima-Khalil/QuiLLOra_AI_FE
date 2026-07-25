import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Does InkFlow AI offer a free trial?",
    answer: "Yes. The Free plan lets you publish up to 3 articles with basic SEO tools at no cost, and every paid plan includes a 7-day free trial before you're billed.",
  },
  {
    question: "Who owns the content I create with AI?",
    answer: "You do. Every draft, edit, and published article generated on InkFlow AI belongs entirely to you, with full rights to publish, edit, or repurpose it anywhere.",
  },
  {
    question: "Can I cancel or change my plan anytime?",
    answer: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings, with no long-term contracts or cancellation fees.",
  },
  {
    question: "How accurate are the SEO recommendations?",
    answer: "Our SEO engine analyzes live search data and top-ranking content in real time, giving you keyword, structure, and readability suggestions tuned to your specific topic.",
  },
  {
    question: "Is my data and content kept private?",
    answer: "Yes. Your drafts and published work are never used to train shared models, and all content is encrypted in transit and at rest.",
  },
];

export default function FAQ() {
  return (
    <Box component="section" id="faq">
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
            Got Questions? We&rsquo;ve Got Answers
          </Typography>
        </Box>

        <Box sx={{ mt: 5 }}>
          {faqs.map((faq, i) => (
            <Accordion key={faq.question} disableGutters>
              <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                <Typography variant="body1" sx={{ fontFamily: "var(--font-button)", fontWeight: 600 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
