import { MdLogout } from "react-icons/md";

export const LogoutSection = () => {
   
  return (
    <div style={{
        display:'flex',
        gap:12 ,
        color:'white',
        padding:40,
        borderTop:'2px solid gray'
        }}>
        <span style={{fontSize:24}}>
            <MdLogout />
        </span>
        <span>
            Sign out
        </span>
    </div>
  )
}
