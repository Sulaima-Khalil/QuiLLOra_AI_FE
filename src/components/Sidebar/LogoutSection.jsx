import { MdLogout } from "react-icons/md";
import { logoutUser } from "../../utils/auth";

export const LogoutSection = () => {
   const handleLogout = () => {
         logoutUser();
   }
  return (
    <div  onClick={handleLogout}
    style={{
        display:'flex',
        gap:12 ,
        color:'white',
        padding:40,
        borderTop:'2px solid gray'
        }}>
        <span style={{fontSize:24}}>
            <MdLogout />
        </span>
        <span style={{cursor:'pointer'}}>
            Sign out
        </span>
    </div>
  )
}
