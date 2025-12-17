import Drawer from "../Sidebar/Drawer"
import { LogoutSection } from "../Sidebar/LogoutSection"

export const Sidebar = () => {
  return (
    <div style={{
      width: 350,
      background: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      borderRight: '2px solid gray',
      height: '100vh' ,
      justifyContent:'space-between',
      position:'fixed',    
    }}>
      <div>
      <h2 style={{ marginLeft: 30,paddingTop: 40, color: 'white' }}>Lumina</h2>
      <Drawer />
      </div>
    <div>
      <LogoutSection />
    </div>
    </div>
  )
}
