import "./App.css"
import { useCallback, useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ColorModeProvider } from './theme/ColorModeContext';
import router from './Routes/index';
import { restoreSession } from './utils/auth';
import { clearSessionFlag } from './utils/apiClient';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ErrorFallback from './components/shared/ErrorFallback';
import AppLoading from './components/shared/AppLoading';

// How long the session check may run before the loader admits something is wrong.
const SLOW_AFTER_MS = 8000;

const App = () => {
  // Holds the first paint until the cookie session has been checked, so a
  // reload cannot flash the login page at an already-signed-in user.
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Reset here rather than at the top of the effect: the effect body must not
  // set state synchronously, and a retry is an event, not a render side effect.
  const retry = useCallback(() => {
    setStatus('loading');
    setSlow(false);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlow(true);
    }, SLOW_AFTER_MS);

    restoreSession()
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch((error) => {
        // restoreSession already absorbs a failed /auth/me and resolves null,
        // so landing here means the bootstrap itself broke. Offer a retry
        // rather than leaving an empty document behind.
        console.error('[quillora] session restore failed:', error);
        if (!cancelled) setStatus('error');
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [attempt]);

  useEffect(() => {
    // Raised by the API client when a refresh attempt fails: the session is
    // gone, so drop the local hint and send the user back to sign in.
    const onExpired = () => {
      clearSessionFlag();
      if (!window.location.pathname.startsWith('/login')) {
        // The data router navigates in place — a location.assign here would
        // throw away the loaded bundle and reload the whole document.
        router.navigate('/login?error=session_expired', { replace: true });
      }
    };

    window.addEventListener('quillora-session-expired', onExpired);
    return () => window.removeEventListener('quillora-session-expired', onExpired);
  }, []);

  return (
    <ColorModeProvider>
      <ErrorBoundary>
        {status === 'error' ? (
          <ErrorFallback
            title="We couldn't start your session"
            description="Something went wrong while checking whether you're signed in. Check your connection and try again."
            onRetry={retry}
          />
        ) : status === 'loading' ? (
          <AppLoading slow={slow} onRetry={retry} />
        ) : (
          <RouterProvider router={router} />
        )}
      </ErrorBoundary>
    </ColorModeProvider>
  )
}

export default App;
