
import { GoClock } from "react-icons/go";

export const Card = ({ cardsData ,isArticle}) => {

const getInitials=(name)=>{
  if(!name) return " ";
  const words=name.split();
  if(words.length === 1) return words[0][0].toUpperCase();
  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
}
  return (
    <div style={{display:'flex',gap:16, flexWrap:'wrap'}}>
       {cardsData.map((item ,index)=>(
      <div 
        key={index} 
        style={{
            display:'flex',
            flexDirection:'column',
            paddingBottom:16,
            gap:8,
            width:360,
            border:'2px solid gray',
            // borderImage: "linear-gradient(135deg, #7c5cff, #a78bfa)",
            // background: `
            //    linear-gradient(#0b0b0b, #0b0b0b) padding-box,
            //    linear-gradient(135deg, #06011dff, #5a3cb2ff) border-box
            //  `,
            //  border: '2px solid transparent',
            borderRadius:16
            }}>
              <div style={{ width:'100%',position:'relative'}}>
                <span 
                style={{
                  position:'absolute',
                   top:20 ,
                   left:10 , 
                   background:'black', 
                   padding:8 ,
                   borderRadius:12 ,
                   minWidth:50 ,
                   display:'flex',
                   alignItems:'center',
                   justifyContent:'center',
                   }}>
                  {item.title}
                  </span>
          {isArticle &&(       
            <span 
                style={{
                  position:'absolute',
                   top:20 ,
                   left:260 , 
                   background:'transparent', 
                   color:'orange',
                   padding:8 ,
                   borderRadius:12 ,
                   border:'2px solid orange',
                   minWidth:50 ,
                   display:'flex',
                   alignItems:'center',
                   justifyContent:'center',
                   }}>
                  {item.status}
                  </span>
          )}
            <img
             src={item.img} 
             style={{
                width:360,
                height:250 , 
                borderRadius:16
                }}/>
                </div>

        <div style={{display:'flex',justifyContent:'space-between', fontSize:12,paddingTop:8 ,paddingLeft:12 ,paddingRight:12}}>
            <span>{item.date}</span>
            <span style={{display:'flex',gap:6 , alignItems:'center'}}>
                <span><GoClock /></span>
                {item.readingTime}
            </span>
        </div>
        <div 
            style={{
                display:'flex',
                flexDirection:'column',
                gap:12,
                padding:12 ,
                height:120, 
                alignItems:'center'
                 }}>
            <h3>{item.heading}</h3>
            <p>{item.description}</p>
        </div>
        <div 
            style={{
                display:'flex',
                gap:2 ,
                height:40 ,
                alignItems:'center',
                paddingLeft:12
                }}>
            <div 
                style={{
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    backgroundColor: "#7c5cff", 
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: 14,
                    marginRight: 8,
                }}>
                    {getInitials(item.author)}
            </div>
                <span>{item.author}</span>
        </div>
    </div>
       ))
    }
    </div>
  )
}

