import { useSeo } from "@/utils/useSeo";
import { SITE, absoluteUrl } from "@/utils/seo";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeaturedArticles from "@/components/landing/FeaturedArticles";
import Categories from "@/components/landing/Categories";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import ContactUs from "@/components/landing/ContactUs";
import Footer from "@/components/landing/Footer";
import SkipLink from "@/components/shared/SkipLink";
import { MAIN_CONTENT_ID } from "@/components/shared/skipTarget";

export default function Landing() {
  /*
   * The site's own metadata. Static values, so no risk of describing the page
   * as something it is not — and the WebSite entity is the one piece of
   * structured data that needs no backend data at all.
   */
  useSeo({
    title: `${SITE.name} — Draft, refine and publish with AI`,
    description: SITE.description,
    canonical: absoluteUrl("/"),
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      description: SITE.description,
      url: absoluteUrl("/"),
    },
  });

  return (
    <div>
      <SkipLink />
      <Navbar />
      {/*
        The marketing sections already carry <section> and the footer its own
        landmark; what was missing was the <main> between them, so every
        section sat directly under <body> with no way to jump past the nav.
      */}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} style={{ outline: "none" }}>
        <Hero />
        <FeaturedArticles />
        <Categories />
        <Features />
        <Pricing />
        <FinalCTA />
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
}
