import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import FeaturedArticles from "@/components/landing/FeaturedArticles";
import Categories from "@/components/landing/Categories";
import Writers from "@/components/landing/Writers";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import ContactUs from "@/components/landing/ContactUs";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Stats />
      <FeaturedArticles />
      <Categories />
      <Writers />
      <Features />
      <HowItWorks />
      <WhyChooseUs />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <ContactUs />
      <Footer />
    </div>
  );
}
