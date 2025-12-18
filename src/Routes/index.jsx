
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
      {
        index: true,
        element: <Discover />,
      },
      {
        path: 'discover',
        element: <Discover />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'setting',
        element: <Setting />,
      },
      {
        path: 'my-article',
        element: <MyArticle />,
      },
      {
        path: 'write',
        element: <Write />,
      },
    ],
  },
  // Optional: Redirect root to login or discover based on auth
  {
    path: '/',
    element: <div>Loading...</div>, // या एक redirect component
  },
]);

export default router;