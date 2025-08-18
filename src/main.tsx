import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './globals.css';
import i18n from './i18n.ts';
import { I18nextProvider } from 'react-i18next';
import { LockScreenProvider } from './contexts/LockScreenContext';
import { Provider } from 'react-redux';
import { store } from './store';

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <p>Memuat...</p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LockScreenProvider>
          <Suspense fallback={<LoadingFallback />}>
            <App />
          </Suspense>
        </LockScreenProvider>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>,
);