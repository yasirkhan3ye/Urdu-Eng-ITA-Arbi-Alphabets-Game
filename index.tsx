
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Service Worker is disabled for Native APK build to prevent white-screen routing issues.
// Capacitor handles offline functionality natively.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
