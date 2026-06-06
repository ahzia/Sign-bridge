import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyPolyfills, defineCustomElements } from '@sutton-signwriting/sgnw-components/loader';
// Eager-load the fsw-sign Stencil chunk — Vite 8 lazy-imports it to a missing .vite/deps path otherwise.
import '@sutton-signwriting/sgnw-components/dist/esm/fsw-sign_2.entry.js';
import './index.css';
import './fonts.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

const root = createRoot(document.getElementById('root')!);

const renderApp = () => {
  root.render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
};

const initializeApp = async () => {
  try {
    await applyPolyfills?.();

    const { cssAppend, cssLoaded } = await import('@sutton-signwriting/font-ttf/font/font.min');
    cssAppend('/fonts/');
    await new Promise<void>((resolve) => cssLoaded(resolve));

    await defineCustomElements(window);

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 3000);

      if ((window as Window & { sgnw?: boolean }).sgnw) {
        clearTimeout(timeout);
        resolve();
        return;
      }

      window.addEventListener(
        'sgnw',
        () => {
          clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
    });

    renderApp();
  } catch {
    renderApp();
  }
};

initializeApp();
