import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/app.css';
import { getBasePath } from './utils/basePath';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const basePath = getBasePath();
    const swPath = `${basePath}service-worker.js`;
    
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
