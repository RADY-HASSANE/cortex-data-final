
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { DebugProvider } from './context/DebugContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <DebugProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </DebugProvider>
    </LanguageProvider>
  </React.StrictMode>
);
