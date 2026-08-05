
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';

/*
 * Route-level code splitting.
 *
 * Landing and NotFound stay in the initial bundle: Landing is what a first-time
 * visitor renders, and NotFound is small enough that a second round trip to
 * show "404" would cost more than it saves. Everything else — the dashboard
 * shell, the TipTap editor, the auth screens, the upgrade flow — downloads on
 * first navigation to its route.
 *
 * A guard that redirects (ProtectedRoute, GuestRoute) returns <Navigate> before
 * its lazy child renders, so an unauthorised visitor never fetches the chunk.
 */
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';
import { ProtectedRoute } from '../components/shared/route/ProtectedRoute';
import { GuestRoute } from '../components/shared/route/GuestRoute';
import RouteErrorBoundary from '../components/shared/RouteErrorBoundary';
import AppLoading from '../components/shared/AppLoading';

/** React.lazy needs a default export; several pages are named exports. */
const lazyNamed = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));

const Home = lazyNamed(() => import('../components/Home'), 'Home');
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Archive = lazy(() => import('../pages/Archive'));
const Setting = lazyNamed(() => import('../pages/Setting'), 'Setting');
const Discover = lazyNamed(() => import('../pages/Discover'), 'Discover');
const MyArticle = lazy(() => import('../pages/MyArticle'));
const Collections = lazy(() => import('../pages/Collections'));
const Team = lazy(() => import('../pages/Team'));
const Help = lazy(() => import('../pages/Help'));
const Profile = lazyNamed(() => import('../pages/Profile'), 'Profile');
const Write = lazyNamed(() => import('../pages/Write'), 'Write');
const AIWriter = lazy(() => import('../pages/AIWriter'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const VerifyResetCode = lazy(() => import('../pages/VerifyResetCode'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const ResetSuccess = lazy(() => import('../pages/ResetSuccess'));
const ArticleReader = lazy(() => import('../pages/ArticleReader'));
const AuthorProfile = lazy(() => import('../pages/AuthorProfile'));
const Upgrade = lazy(() => import('../pages/Upgrade'));
const UpgradeCheckout = lazy(() => import('../pages/UpgradeCheckout'));
const UpgradeSuccess = lazy(() => import('../pages/UpgradeSuccess'));


const routes = [
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
  // Standalone full-page flow — deliberately outside the dashboard layout so
  // it renders without the sidebar or top bar.
  {
    path: '/dashboard/upgrade',
    element: (
      <ProtectedRoute>
        <Upgrade />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/upgrade/checkout',
    element: (
      <ProtectedRoute>
        <UpgradeCheckout />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/upgrade/success',
    element: (
      <ProtectedRoute>
        <UpgradeSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/write',
    element: (
      <ProtectedRoute>
        <Write />
      </ProtectedRoute>
    ),
  },
  // Friendly editor entry points. The dashboard uses /dashboard/Write, but
  // these aliases also support direct links to the editor without dropping
  // authors onto the catch-all 404 screen.
  // {
  //   path: '/write',
  //   element: (
  //     <ProtectedRoute>
  //       <Write />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/editer',
  //   element: (
  //     <ProtectedRoute>
  //       <Write />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: '/dashboard/ai-writer',
    element: (
        <ProtectedRoute>
        <AIWriter />
       </ProtectedRoute>
     ),
  },
  {
    // Public reader. Deliberately unguarded: `GET /articles/:id` is optionally
    // authenticated and 404s anything unpublished or private to non-authors,
    // so a published article stays readable signed-out.
    path: '/article/:id',
    element: <ArticleReader />,
  },
  {
    // Public author page, and the destination behind a people search result.
    // Unguarded for the same reason as the reader: `GET /users/:identifier`
    // is optionally authenticated and shows a visitor only published work.
    path: '/author/:identifier',
    element: <AuthorProfile />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

// A pathless root wraps every route above so they share one errorElement:
// without it the router renders its built-in developer error page, stack trace
// and all, whenever a route throws.
const router = createBrowserRouter([
  {
    // One Suspense boundary for every lazy route, so a chunk still in flight
    // shows the app's loader instead of a blank frame. A chunk that fails to
    // load throws, and errorElement below catches it like any render error.
    element: (
      <Suspense fallback={<AppLoading message="Loading…" />}>
        <Outlet />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
    children: routes,
  },
]);

export default router;


