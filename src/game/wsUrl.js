/**
 * Resolves the WebSocket URL automatically for both:
 *  - Vite dev server (port 5173 -> proxies /ws to backend :3000)
 *  - Production Express server (port 3000 -> direct WS)
 */
export function getWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (window.location.port === '5173') {
    return `${protocol}//${window.location.host}/ws`;
  }
  return `${protocol}//${window.location.host}`;
}
