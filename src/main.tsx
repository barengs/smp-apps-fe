import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './globals.css';
import { ThemeProvider } from './components/theme-provider.tsx';
import i18n from './i18n.ts'; // Import the i18n instance
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}> {/* Wrap the app with I18nextProvider */}
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </I18nextProvider>
  </React.StrictMode>,
);