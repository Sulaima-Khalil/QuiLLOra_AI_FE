import React from 'react'

export const ProfileCards = () => {
    const title = [
        {
            name:"Articles",
            count: 45,
        },
        {
            name:"Followers",
            count: 125
        },
        {
            name:"Following",
            count: 60
        },
        {
            name:"Total Views",
            count: 35
        }
         ]
    
  return (
    <div style={{ display:'flex', gap:45 , alignItems:'center' ,justifyContent:'center'}}>
  {title.map((items , index) => (
    <div key={index}  
    style={{ 
        width:240 , 
        height:100 ,
        borderRadius:12 , 
        border:'2px solid gray',
        display:'flex' ,
        flexDirection:'column', 
        alignItems:'center' ,
        justifyContent:'center',
        gap:15
        }}>
       <h2>{items.count}</h2>
       <p>{items.name}</p>
    </div>
  ))

  }
    </div>
  )
}
