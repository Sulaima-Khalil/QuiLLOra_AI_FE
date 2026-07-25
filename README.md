# QuiLLora AI — Frontend

An editorial workspace for writing with AI: draft in a rich-text editor, refine
with AI actions, organise work into collections, and publish. This repository is
the React single-page app; it talks to the QuiLLora AI backend over HTTP.

## Stack

| Area | Choice |
| --- | --- |
| Framework | React 19 + Vite 7 |
| Routing | React Router 7 (`createBrowserRouter`) |
| UI | MUI 9 + Emotion, `lucide-react` icons |
| Editor | TipTap 3 (starter kit, link, image, underline, text-align) |
| HTTP | axios, one configured instance |
| Styling | MUI theme tokens, plus scoped CSS for the auth screens |

## Getting started

Requires Node 20.19+ (or 22.12+) — the floor for Vite 7.

```bash
npm install
cp .env.example .env     # then point VITE_API_URL at your backend
npm run dev              # http://localhost:5173
```

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint over the repo |

## Environment

Variables live in `.env` and must be prefixed `VITE_` to reach the browser.
`.env` is not committed — only `.env.example`, which carries keys and no values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | yes | Backend origin **without** the `/api/v1` suffix — the API client appends it. Falls back to `http://localhost:4000`. |
| `VITE_DEMO_EMAIL` | no | Pre-fills the login form for local demos. Leave blank. |
| `VITE_DEMO_PASSWORD` | no | Pairs with the above. Leave blank. |

Both demo variables are empty by default, and the login hint hides itself when
either is missing. Don't fill them on a deployed environment and don't commit
values for them — a working sign-in should not be advertised in the UI or sitting
in git history.

## How auth works

Sessions are **HTTP-only cookies**. No token is readable by application code, so
there is nothing to leak from `localStorage`. `src/utils/apiClient.js` sets
`withCredentials`, unwraps the backend's `{ success, message, data }` envelope,
and owns the session logic:

- **Transparent refresh** — a `401` triggers one refresh, then replays the
  original request, so an expired access token never surfaces in the UI.
  Concurrent `401`s share a single refresh promise instead of stampeding the
  endpoint. Login, register, refresh and logout are excluded: there, a `401`
  *is* the answer.
- **Session lost** — when a refresh fails, a `quillora-session-expired` event
  fires; `App.jsx` clears the local hint and routes to `/login`.
- **Route guards** — `ProtectedRoute` and `GuestRoute` read a synchronous local
  hint (`quillora_session`) so redirects are instant; the server re-validates on
  every request regardless. `App.jsx` holds the first paint until
  `restoreSession()` resolves, so a reload cannot flash the login screen at an
  already signed-in user.

### Password reset

Three steps, each its own route, with a step rail on screen so the user always
knows where they are:

1. `/forgot-password` — submit the account email; the backend sends a 6-digit
   code. The response is identical whether or not the account exists, and the
   copy is careful not to imply otherwise.
2. `/verify-reset-code` — type the code. Six single-character inputs with paste
   support, auto-advance, and auto-submit on the sixth digit.
3. `/reset-password` — choose the new password, with a strength meter and a rule
   checklist. Also the target of the reset link the backend emails, which
   arrives as `?token=`.

`src/utils/resetFlow.js` keeps the email being recovered in `sessionStorage`, so
refreshing step 2 or 3 continues the flow instead of bouncing back to step 1.
The code itself is deliberately **not** stored — refreshing the password step
asks for it again rather than leaving a live credential in storage.

## Routes

| Path | Access | Screen |
| --- | --- | --- |
| `/` | public | Marketing landing page |
| `/login`, `/register` | guest only | Sign in / create account |
| `/verify-email` | public | Confirms the emailed verification link |
| `/forgot-password` | guest only | Reset step 1 — request a code |
| `/verify-reset-code` | guest only | Reset step 2 — enter the code |
| `/reset-password` | public | Reset step 3 — new password, and the email link target |
| `/reset-success` | guest only | Reset confirmation |
| `/dashboard` | protected | App shell; the index route renders the dashboard |
| `/dashboard/…` | protected | `discover`, `profile`, `my-article`, `collections`, `team`, `analytics`, `archive`, `setting`, `help` |
| `/dashboard/write` | protected | Rich-text editor |
| `/dashboard/ai-writer` | protected | AI drafting workspace |
| `*` | public | Not found |

Guest-only routes send a signed-in user to `/dashboard`; protected routes send a
signed-out one to `/login`.

## Layout

```
src/
├─ Routes/index.jsx        Route table (createBrowserRouter)
├─ pages/                  One file per screen
├─ components/
│  ├─ Home.jsx             Dashboard shell: sidebar, topbar, <Outlet/>
│  ├─ auth/                Auth showcase panel, recovery step rail, auth.css
│  ├─ brand/               QuilloraMark — the logo component
│  ├─ landing/             Marketing sections (hero, features, pricing, footer…)
│  ├─ editer/, aiwriter/   Editor and AI workspace pieces
│  └─ shared/route/        ProtectedRoute, GuestRoute
├─ theme/                  MUI theme, brand tokens, colour-mode context
├─ utils/
│  ├─ apiClient.js         axios instance, refresh interceptor, envelope helpers
│  ├─ auth.js              Register, login, logout, reset, verify, sessions
│  ├─ resetFlow.js         Keeps the recovery email across the reset steps
│  └─ *Store.js            Per-feature state with change events
└─ assets/                 Brand SVGs and imagery
```

## Brand

The logo is one file — `src/assets/quillora-mark.svg` — imported by
`components/brand/QuilloraMark.jsx` and referenced as the favicon from
`index.html`. Both go through the same import, so the favicon and every in-app
placement can't drift apart. It is imported rather than served from `public/` so
Vite rewrites the URL correctly under the project's relative `base`, which a
hardcoded `/quillora.svg` would break on nested routes like `/dashboard/write`.

```jsx
<QuilloraMark size={36} />                  // default teal
<QuilloraMark size={36} color="gold" />     // gold colourway
<QuilloraMark size={220} tone="mono" />     // faded, for watermarks
```

A **gold colourway** (`quillora-mark-gold.svg` — the same artwork with its teal
fills hue-shifted) is available but unused: teal is live on every screen while
the colour decision is still open. `Logo` and `AuthShowcase` both forward a
`mark` prop, so putting a screen on gold is one word. If teal wins, delete the
gold asset and its import from `QuilloraMark`.

## Conventions

- Brand colours come from `brandColors` in `theme/muiTheme.js`, not hex literals
  scattered through components.
- Feature state lives in `utils/*Store.js` modules that emit a
  `quillora-<feature>-change` event; components subscribe rather than poll.
- The auth screens are plain CSS scoped under `.auth` in
  `components/auth/auth.css` rather than MUI — they predate the theme and stay
  self-contained.
- `npm run lint` reports pre-existing `no-unused-vars` errors for destructured
  `Icon` bindings in several list-rendering components. They are known, and the
  build passes clean.
