import React, { Suspense, lazy } from 'react';

const PlayerApp = lazy(() => import('./pages/PlayerApp.jsx'));
const AdminApp = lazy(() => import('./pages/AdminApp.jsx'));

/**
 * Root Application Switcher:
 *  - /admin  -> Admin Control Panel (Multi-Lobby Orchestrator)
 *  - /       -> Player Game Client (Among Us: The Skeld)
 */
export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#050811',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Segoe UI, sans-serif',
            fontWeight: 800
          }}
        >
          🚀 Loading Among Us: The Skeld...
        </div>
      }
    >
      {isAdminRoute ? <AdminApp /> : <PlayerApp />}
    </Suspense>
  );
}
