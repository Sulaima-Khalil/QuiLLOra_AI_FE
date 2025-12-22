import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

export const Header = ({handleClick ,isButton , isDiscover, title, description, content}) => {
  
  return (

    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
           <h1 style={{paddingBottom:16 ,'&:hover':{color:'#7c5cff'}}}>{title}</h1>
           <p>{description}</p>
        </div>
{isDiscover &&(
        <div style={{display:'flex', gap:10}}>
            <input type="search" placeholder='search here'
             style={{
                    width:300,
                    height:40,
                    border:'2px solid #2B2B2B',
                    color:'white',
                    borderRadius:40,
                    padding:18,
                    background:'black',
            }}/>
            <button style={{background:'black', width:47,borderRadius:12 ,height:37}} onClick={handleClick}>
              <HiOutlineAdjustmentsHorizontal style={{fontSize:24 }}/>
              </button>
        </div>
)}
{isButton && (
  
       <button style={{background:'#7c5cff', width:120, borderRadius:6 ,height:37}} onClick={handleClick}>
              {content}
        </button>
 
)}
        
    </div>
  )
}
