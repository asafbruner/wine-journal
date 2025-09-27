import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/* Ensure a fresh session partition for dev API mocks on first app load.
   This isolates Playwright tests from previous runs and other workers,
   while keeping the cookie stable across page reloads within the same test. */
(function ensureTestSession() {
  const cookieName = 'x-test-session';
  const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith(`${cookieName}=`));
  if (!hasCookie) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    document.cookie = `${cookieName}=${id}; path=/`;
  }
})();

/* Reset dev API stores once per browser session to isolate E2E runs,
   but keep state across page reloads within the same test. */
(function initDbOncePerSession() {
  try {
    if (!sessionStorage.getItem('x-init-done')) {
      fetch('/api/init-db', { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('x-init-done', '1');
    }
  } catch {
    // ignore
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
