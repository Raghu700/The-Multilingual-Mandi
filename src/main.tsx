import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('main.tsx: Starting app initialization');

try {
  const root = document.getElementById('root');
  console.log('main.tsx: Root element found:', root);
  
  ReactDOM.createRoot(root!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
  console.log('main.tsx: App rendered successfully');
} catch (error) {
  console.error('main.tsx: Fatal error during initialization:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;"><h1>Fatal Error</h1><pre>${error}</pre></div>`;
}
