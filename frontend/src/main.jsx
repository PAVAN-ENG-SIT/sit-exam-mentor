// ─────────────────────────────────────────────────────────────
// App Entry Point  —  frontend/src/main.jsx
// Renders the Root wrapper which handles auth gating & theme.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './app/root';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
