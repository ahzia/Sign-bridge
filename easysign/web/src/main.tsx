import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { defineCustomElements } from '@sutton-signwriting/sgnw-components/loader';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

defineCustomElements(window);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
