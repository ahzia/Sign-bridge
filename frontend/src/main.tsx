import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App.tsx';
import './index.css';
import './fonts.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import SignWritingService from './services/SignWritingService.ts';

const initializeApp = async () => {
  // Load SignWriting fonts
  await SignWritingService.loadFonts();
  
  // Initialize React app
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
};

initializeApp();
