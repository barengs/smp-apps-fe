import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './globals.css';
import i18n from './i18n.ts';
import { I18nextProvider } from 'react-i18next';
import { LockScreenProvider } from './contexts/LockScreenContext';
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LockScreenProvider>
          <App />
        </LockScreenProvider>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>,
);