import { Sidebar } from "./layout/Sidebar"
import { Outlet } from "react-router-dom"

export const Home = () => {
  return (
    <div style={{display:'flex'}}>
        <Sidebar activeIndicator={true} ActiveIndex={true}/>
        <div style={{padding:20 , flex:1 , marginLeft:350 , background: '#1e293b',height:'100%',borderRadius:6}}>
         <Outlet />
        </div>
       
    </div>
  )
}
