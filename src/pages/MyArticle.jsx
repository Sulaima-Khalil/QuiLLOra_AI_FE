import { useState } from "react";
import { ArticleHeader } from "../components/Article/Header";
import { ArticleCards } from "../components/Article/ArticleCard";
import { ArticleTabs } from "../components/Article/ArticleTabs";
 const MyArticle = () => {
   const [activetab, setActiveTab ] = useState(0);
  
  return (
    <div style={{display:'flex', flexDirection:'column',gap:20}}>
      <ArticleHeader />
      <ArticleTabs activetab={activetab} setActiveTab={setActiveTab}/>
      <ArticleCards activetab={activetab}/>
    </div>
  )
}

export default MyArticle