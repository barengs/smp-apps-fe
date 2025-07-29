import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import i18n from './i18n'; // Import i18n configuration
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider

createRoot(document.getElementById("root")!).render(
  <React.Suspense fallback="loading...">
    <I18nextProvider i18n={i18n}> {/* Tambahkan I18nextProvider di sini */}
      <App />
    </I18nextProvider>
  </React.Suspense>
);