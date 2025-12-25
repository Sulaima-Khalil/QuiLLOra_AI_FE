
import ai1 from '../assets/ai1.png';
import rain1 from '../assets/rain1.png';
import design1 from '../assets/design1.png';
import { Card } from '../components/shared/Card';
import { Header } from '../components/shared/Header';
import { ProfileCards } from '../components/profile/ProfileCards';
import { theme } from '../theme/Theme';

export const Profile = () => {
  const cardsData = [
    {
      img: ai1,
      heading: "How Generative AI Is Reshaping the Future of Creative Work",
      description: "Generative AI is changing how creatives approach design, writing, and multimedia projects. Discover the opportunities and challenges it brings.",
      title: "AI",
      author: "John Carter",
      date: "Dec 4, 2025",
      readingTime: "5 min read",
      status:"Published"
    },
    {
      img: design1,
      heading: "User Interviews: The Art of Asking Better Questions",
      description: "Conducting effective user interviews requires skill. Learn the key techniques to get actionable insights.",
      title: "UX Research",
      author: "Ava Collins",
      date: "Dec 3, 2025",
      readingTime: "5 min read",
      status:"Draft"
    },
    {
      img: rain1,
      heading: "Design Systems: Why Every Brand Needs One",
      description: "A design system ensures consistency across products and teams. Learn how to build one that scales effectively.",
      title: "Design",
      author: "Emma Blake",
      date: "Nov 30, 2025",
      readingTime: "5 min read",
      status:"Draft"
    }
  ];

  const getInitials = (name) => {
    if(!name) return " ";
    const words = name.split(" ");
    return words.length === 1
      ? words[0][0].toUpperCase()
      : words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }

  return (
    <div style={{
      display:'flex', 
      flexDirection:'column', 
      gap: theme.spacing.lg, 
      padding: theme.spacing.md, 
      // background: theme.colors.bgPrimary, 
      color: theme.colors.textPrimary,
      minHeight: '100vh'
    }}>
      
      {/* Profile Header */}
      <div style={{ position:'relative', marginBottom: theme.spacing.lg }}>
        {/* Banner */}
        <div style={{
          width:'100%',
          height: 220,
          background: '#4057CB',
          borderRadius: theme.radius.lg,
        }}></div>

        {/* Profile Initials */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: theme.colors.accent, 
          color: theme.colors.textPrimary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position:'absolute',
          top: 150,
          left: 20,
          fontWeight: "bold",
          fontSize: 28,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
        }}>
          {getInitials("Sulaima Khalil")}
        </div>

        {/* Name + Description + Edit Button */}
        <div style={{
          marginLeft: 140,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 6,
        }}>
          <Header
            title="Sulaima Khalil"
            description="Web Developer & Data Analyst"
            content="Edit Profile"
            isButton={true}
          />
        </div>
      </div>

      {/* Profile Stats */}
      <div style={{
        display:'flex', 
        flexWrap:'wrap', 
        gap: theme.spacing.md,
        justifyContent: 'center',
        paddingBottom: theme.spacing.lg
      }}>
        <ProfileCards />
      </div>

      {/* Recent Articles */}
      <div style={{ width:'100%' }}>
        <h2 style={{
          marginBottom: theme.spacing.md, 
          fontSize: 22,
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: 8
        }}>Recent Articles</h2>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
          gap: theme.spacing.md
        }}>
          <Card cardsData={cardsData} />
        </div>
      </div>
    </div>
  )
}
