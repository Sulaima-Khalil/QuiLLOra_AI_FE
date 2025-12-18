import { Header } from '../components/shared/Header';
import { Sidebar } from '../components/shared/Sidebar';
import { Account } from '../components/Account/Account';
import { Notifications } from '../components/setting/Notification';
import { Appearance } from '../components/setting/Appearance';
import { Security } from '../components/setting/Security';
import { useState } from 'react';

export const Setting = () => {
  const pages = [
    { title: "Account", component: <Account /> },
    { title: "Notifications", component: <Notifications /> },
    { title: "Appearance", component: <Appearance /> },
    { title: "Security", component: <Security /> },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div style={{ position: 'relative', minHeight: '94.5vh' }}>
      <Header
        title="Setting"
        description="Manage your account preferences and appearance..."
      />

      <div style={{ display: 'flex', paddingTop: 30 }}>
        <Sidebar
          content={pages.map(p => ({ title: p.title, path: '' }))}
          activeIndex={activeIndex}
          onItemClick={setActiveIndex}
          activeIndicator={true}
        />
        <div style={{ flex: 1, paddingLeft: 20 }}>
          {pages[activeIndex].component}
        </div>
      </div>
    </div>
  );
};
