import React from 'react'
import { ArticleHeader } from "../components/Article/Header";
import { ArticleCards } from "../components/Article/ArticleCard";
import { ArticleTabs } from "../components/Article/ArticleTabs";
 const MyArticle = () => {
  return (
    <div style={{display:'flex', flexDirection:'column',gap:20}}>
      <ArticleHeader />
      <ArticleTabs />
      <ArticleCards />
    </div>
  )
}

export default MyArticle