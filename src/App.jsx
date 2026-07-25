import "./App.css"
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ColorModeProvider } from './theme/ColorModeContext';
import router from './Routes/index';
import { restoreSession } from './utils/auth';
import { clearSessionFlag } from './utils/apiClient';

const App = () => {
  // Blocks the first paint until the cookie session has been checked, so a
  // reload cannot flash the login page at an already-signed-in user.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setReady(true));

    // Raised by the API client when a refresh attempt fails: the session is
    // gone, so drop the local hint and send the user back to sign in.
    const onExpired = () => {
      clearSessionFlag();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?error=session_expired');
      }
    };

    window.addEventListener('quillora-session-expired', onExpired);
    return () => window.removeEventListener('quillora-session-expired', onExpired);
  }, []);

  if (!ready) return null;

  return (
    <ColorModeProvider>
      <RouterProvider router={router}/>
    </ColorModeProvider>
  )
}

export default App;
