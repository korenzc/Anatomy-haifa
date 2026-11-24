/**
 * Keeps an installed / long-open app current. The service worker (vite-plugin-pwa, autoUpdate) swaps
 * in a new version on its own, but a page that is already open keeps running the old code, and iOS
 * often resumes a home-screen app for days instead of reloading it.
 *
 * So: every time the app comes back to the foreground, ask for a new version; once a new version has
 * taken over, reload the next time the app is brought back (never mid-answer while the user is looking).
 * Saved progress lives in localStorage, so a reload loses nothing.
 */
export function keepAppUpdated(): void {
  const sw = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined;
  if (!sw) return;
  const hadController = !!sw.controller; // first visit: the worker just installed, no reload needed
  let updated = false;
  sw.addEventListener('controllerchange', () => {
    if (hadController) updated = true;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (updated) {
      location.reload();
      return;
    }
    sw.getRegistration()
      .then((r) => r?.update())
      .catch(() => {});
  });
}
