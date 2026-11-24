import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { keepAppUpdated } from './lib/update';
import './styles/app.css';

// ask the browser not to clear saved progress when the phone runs low on space or the site goes unvisited for a while
navigator.storage?.persist?.().catch(() => {});

// pick up new versions when the app comes back to the foreground (iOS keeps home-screen apps open for days)
keepAppUpdated();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
