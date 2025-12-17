import { Header } from '../components/shared/Header';
import { Sidebar } from '../components/shared/Sidebar';
import { Account } from '../components/Account/Account';
export const Setting = () => {
  const pages =[
    {
      icon:"",
      title:"Acccount",
      path:'/Setting'
    }, {
      icon:"",
      title:"Notifications",
      path:''
    },
     {
      icon:"",
      title:"Appearance",
      path:''
    },
     {
      icon:"",
      title:"Security",
      path:''
    },
  ]
  return (
    <div style={{position:'relative',minHeight:'94.5vh'}}>
      <Header 
       title="Setting"
       description="Manage your account preferences and appearance...."
      />
      <div style={{paddingTop:30}}>
        <Sidebar  content={pages} activeIndex={false} activeIndicator={false}/>
      </div>
      

       <div style={{ position:'absolute',top:'20%',left:'50%'}}>
        <Account />
       </div>
       
     
    </div>
  )
}
