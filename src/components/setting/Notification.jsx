import React, { useState } from "react";
import { SaveButton } from "../shared/SettingComponent";
import { Header } from '../shared/Header';
import { NotificationComponent } from '../shared/NottificationComponent'
export const Notifications = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  const handleSave = () => {
    console.log({ emailAlerts, pushAlerts });
  };

  return (
   <div style={{ maxWidth:400 , height:'auto', border:'2px solid #1F1F1F', padding:20 ,borderRadius:12 ,background:'black' }}>
      <Header 
       title="Notifications"
       description="Choose what you want to be notified about....."
      />
    <NotificationComponent />

        
        <SaveButton onClick={handleSave} />
      </div>
   
  );
};

