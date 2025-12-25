
import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../components/Home';
import { Setting } from '../pages/Setting';
import { Discover } from '../pages/Discover';
import MyArticle from '../pages/MyArticle';
import { Profile } from '../pages/Profile';
import { Write } from '../pages/Write';
import AuthPage from '../pages/Login';
import { ProtectedRoute } from '../components/shared/route/ProtectedRoute';
import { GuestRoute } from '../components/shared/route/GuestRoute';
import { Account } from '../components/setting/Account';
import { Notifications } from '../components/setting/Notification';
import { Appearance } from '../components/setting/Appearance';
import { Security } from '../components/setting/Security';


const router = createBrowserRouter([
  {
    path: '/login',
    element: (
       <GuestRoute>
        <AuthPage />
       </GuestRoute> 
    ),
  },
  {
    path: '/',
    element: (
        <ProtectedRoute>
        <Home />
       </ProtectedRoute>  
     ),
    children: [
      { index: true, element: <Discover /> },
      { path: 'discover', element: <Discover /> },
      { path: 'profile', element: <Profile /> },
      { path: 'my-article', element: <MyArticle /> },
      { path: 'write', element: <Write /> },

     
      {
        path: 'setting',
        element: <Setting />,
        children: [
          { index: true, element: <Account /> }, 
          { path: 'account', element: <Account /> },
          { path: 'notification', element: <Notifications /> },
          { path: 'appearance', element: <Appearance /> },
          { path: 'security', element: <Security /> },
        ],
      },
    ],
  },
]);

export default router;


