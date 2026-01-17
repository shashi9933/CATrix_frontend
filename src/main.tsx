import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
