
import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../components/Home';
import Dashboard from '../pages/Dashboard';
import Analytics from '../pages/Analytics';
import Archive from '../pages/Archive';
import { Setting } from '../pages/Setting';
import { Discover } from '../pages/Discover';
import MyArticle from '../pages/MyArticle';
import Collections from '../pages/Collections';
import Team from '../pages/Team';
import Help from '../pages/Help';
import { Profile } from '../pages/Profile';
import { Write } from '../pages/Write';
import AIWriter from '../pages/AIWriter';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyResetCode from '../pages/VerifyResetCode';
import ResetPassword from '../pages/ResetPassword';
import ResetSuccess from '../pages/ResetSuccess';
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';
import { ProtectedRoute } from '../components/shared/route/ProtectedRoute';
import { GuestRoute } from '../components/shared/route/GuestRoute';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: (
       <GuestRoute>
        <Login />
       </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
       <GuestRoute>
        <Register />
       </GuestRoute>
    ),
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/forgot-password',
    element: (
       <GuestRoute>
        <ForgotPassword />
       </GuestRoute>
    ),
  },
  {
    // Step 2: the 6-digit code from the reset email.
    path: '/verify-reset-code',
    element: (
       <GuestRoute>
        <VerifyResetCode />
       </GuestRoute>
    ),
  },
  {
    // Step 3. Also the target of the password-reset link emailed by the backend.
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/reset-success',
    element: (
       <GuestRoute>
        <ResetSuccess />
       </GuestRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
        <ProtectedRoute>
        <Home />
       </ProtectedRoute>
     ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'discover', element: <Discover /> },
      { path: 'profile', element: <Profile /> },
      { path: 'my-article', element: <MyArticle /> },
      { path: 'collections', element: <Collections /> },
      { path: 'team', element: <Team /> },
      { path: 'help', element: <Help /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'archive', element: <Archive /> },
      { path: 'setting', element: <Setting /> },
    ],
  },
  {
    path: '/dashboard/write',
    element: (
        <ProtectedRoute>
        <Write />
       </ProtectedRoute>
     ),
  },
  {
    path: '/dashboard/ai-writer',
    element: (
        <ProtectedRoute>
        <AIWriter />
       </ProtectedRoute>
     ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;


