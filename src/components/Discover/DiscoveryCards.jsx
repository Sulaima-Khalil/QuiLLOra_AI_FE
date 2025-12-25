import ai1 from '../../assets/ai1.png';
import ai2 from '../../assets/ai2.png';
import rain1 from '../../assets/rain1.png';
import rain2 from '../../assets/rain2.png';
import rain3 from '../../assets/rain3.png';
import rain4 from '../../assets/rain4.png';
import design1 from '../../assets/design1.png';
import design2 from '../../assets/design2.png';
import engineering from '../../assets/engineering.png';
import {Card } from '../shared/Card';

export const DiscoveryCards = () => {
  const cardsData = [
  {
    img: ai1,
    heading: "How Generative AI Is Reshaping the Future of Creative Work",
    description: "Generative AI is changing how creatives approach design, writing, and multimedia projects. Discover the opportunities and challenges it brings.",
    title: "AI",
    author: "John Carter",
    date: "Dec 4, 2025",
    readingTime: "5 min read",
  },
   {
    img: design1,
    heading: "User Interviews: The Art of Asking Better Questions",
    description: "Conducting effective user interviews requires skill. Learn the key techniques to get actionable insights.",
    title: "UX Research",
    author: "Ava Collins",
    date: "Dec 3, 2025",
    readingTime: "5 min read",
  },
  {
    img: rain1,
    heading: "Design Systems: Why Every Brand Needs One",
    description: "A design system ensures consistency across products and teams. Learn how to build one that scales effectively.",
    title: "Design",
    author: "Emma Blake",
    date: "Nov 30, 2025",
    readingTime: "5 min read",
  },
  {
    img: design2,
    heading: "Why UX Research Is the Foundation of Great Digital Products",
    description: "UX research uncovers user needs and behaviors. Discover methods to gather insights that drive product success.",
    title: "UX Research",
    author: "Olivia Reed",
    date: "Dec 1, 2025",
    readingTime: "6 min read",
  },
   {
    img: rain2,
    heading: "Why Minimalism Still Dominates Digital Aesthetics",
    description: "Minimalism remains a key principle in modern design. Understand why simplicity improves user experience and engagement.",
    title: "Design",
    author: "David Lane",
    date: "Nov 28, 2025",
    readingTime: "4 min read",
  },
   {
    img: ai2,
    heading: "AI Agents: The Next Evolution Beyond Chatbots",
    description: "AI agents are taking automation to the next level. Learn how they can handle complex tasks and interact naturally with humans.",
    title: "AI",
    author: "Sarah Miles",
    date: "Dec 2, 2025",
    readingTime: "6 min read",
  },
  {
    img: rain3,
    heading: "Color Psychology: How Colors Influence Digital Behavior",
    description: "Colors impact emotions and decision-making. Explore how to use color effectively in your designs.",
    title: "Design",
    author: "Michael Ross",
    date: "Nov 25, 2025",
    readingTime: "4 min read",
  },
   {
    img: engineering,
    heading: "Breaking Down Distributed Systems for Beginners",
    description: "Distributed systems are the backbone of modern applications. Get a beginner-friendly introduction to key concepts.",
    title: "Engineering",
    author: "Chris Nolan",
    date: "Dec 4, 2025",
    readingTime: "7 min read",
  },
  {
    img: rain4,
    heading: "The Cognitive Biases That Impact User Decisions",
    description: "Understanding cognitive biases helps design better experiences. Learn which biases affect digital behavior.",
    title: "Design",
    author: "Sophia Young",
    date: "Nov 27, 2025",
    readingTime: "5 min read",
  },
 
];


  return (
    <div className="cards-grid">
      <Card cardsData={cardsData} />
    </div>
  );
};
