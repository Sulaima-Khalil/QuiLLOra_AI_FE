import React from 'react'
// import ai1 from '../../assets';
// import ai2 from '../../../assets/ai2.png';
// import rain1 from '../../../assets/rain1.png';
// import rain2 from '../../../assets/rain2.png';
// import rain3 from '../../../assets/rain3.png';
// import rain4 from '../../../assets/rain4.png';
// import design1 from '../../../assets/design1.png';
// import design2 from '../../../assets/design2.png';
// import engineering from '../../../assets/engineering.png';
import { Card } from '../components/shared/Card';
import { Header } from '../components/shared/Header';
import { ProfileCards } from '../components/profile/ProfileCards';

export const Profile = () => {
   const cardsData = [
  {
    // img: ai1,
    heading: "How Generative AI Is Reshaping the Future of Creative Work",
    description: "Generative AI is changing how creatives approach design, writing, and multimedia projects. Discover the opportunities and challenges it brings.",
    title: "AI",
    author: "John Carter",
    date: "Dec 4, 2025",
    readingTime: "5 min read",
    status:"Published"
  },
   {
    // img: design1,
    heading: "User Interviews: The Art of Asking Better Questions",
    description: "Conducting effective user interviews requires skill. Learn the key techniques to get actionable insights.",
    title: "UX Research",
    author: "Ava Collins",
    date: "Dec 3, 2025",
    readingTime: "5 min read",
    status:"Draft"
  },
  {
    // img: rain1,
    heading: "Design Systems: Why Every Brand Needs One",
    description: "A design system ensures consistency across products and teams. Learn how to build one that scales effectively.",
    title: "Design",
    author: "Emma Blake",
    date: "Nov 30, 2025",
    readingTime: "5 min read",
    status:"Draft"
  }
 
];

const getInitials=(name)=>{
  if(!name) return " ";
  const words=name.split();
  if(words.length === 1) return words[0][0].toUpperCase();
  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
}
  return (
    <div>
      <div style={{position:'relative', paddingBottom:70}}>
        <div style={{width:'object-cover',height:300 ,background:'#4422c9ff',position:'relative',borderRadius:12}}></div>
             
              <div 
                style={{
                    width: 130,
                    height: 80,
                    borderRadius: 12,
                    backgroundColor: "#7c5cff", 
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position:'absolute',
                    top:260,
                    left:40,
                    fontWeight: "bold",
                    fontSize: 24,
                    marginRight: 8,
                }}>
                    {getInitials("Sulaima khalil")}
            </div>
            <div style={{marginLeft:200, marginRight:50}}> 
              <Header  title="Sulaima Khalil" description="web developer & Data Analyst" content="Edit Profile" isButton={true}/>
            </div>
          
      </div>
      <div style={{paddingBottom:30}}>
        <ProfileCards />
      </div>
      <div>
        <h2 style={{paddingBottom:20}}>Recents Articles</h2>
     <Card cardsData={cardsData}/>
      </div>
    </div>
  )
}
