import { Header } from '../components/shared/Header';
import { Sidebar } from '../components/shared/Sidebar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MdOutlinePerson } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import { IoColorPalette } from "react-icons/io5";
export const Setting = () => {
  const pages = [
    { title: "Account", path: 'account' ,icon: <MdOutlinePerson />},
    { title: "Notifications", path: 'notification' ,icon: <MdNotifications />},
    { title: "Appearance", path: 'appearance', icon: <IoColorPalette />},
    { title: "Security", path: 'security', icon: <IoLockClosedOutline />},
  ];


  return (
    <div style={{ position: 'relative', minHeight: '94.5vh' }}>
      <Header
        title="Setting"
        description="Manage your account preferences and appearance..."
      />

      <div style={{ display: 'flex', paddingTop: 30 }}>
        <Sidebar  content={pages}  activeIndicator={true}/>

      <div style={{ flex: 1, paddingLeft: 20, position:'absolute', top:'12%', left:'50%', minWidth:450 }}>
          <Outlet />
      </div>
      </div>
    </div>
  );
};
