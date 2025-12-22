

export const ArticleTabs = ({activetab , setActiveTab}) => {
    const tabs=[ "All Articles", "Published", "Drafts" ]
  
  return (
    <div style={{borderBottom:'1px solid gray',display:'flex', gap:30}}>
        {tabs.map((items ,index)=>(
          <div key={index} style={{paddingBottom:10}}>
          <button  style={{
             border:'none',
             borderBottom: activetab == index ? '2px solid #7c5cff' : 'none',
             paddingBottom:10,
             width:70,
             fontWeight: activetab === index ? 600 :400,
            }} 
              onClick={()=> setActiveTab(index)}>{items}</button>
          </div>
        ))}
    </div>
  )
}
