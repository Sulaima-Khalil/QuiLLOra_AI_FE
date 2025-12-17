import React from 'react'

export const ArticleTabs = () => {
    const tabs=[ "All Articles", "Published", "Drafts" ]
  return (
    <div style={{borderBottom:'1px solid gray',display:'flex', gap:40}}>
        {tabs.map((items ,index)=>(
          <div key={index} style={{paddingBottom:10}}>
          <p>{items}</p>
          </div>
        ))}
    </div>
  )
}
