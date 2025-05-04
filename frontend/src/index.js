import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './UserContext'; // Context provider for global app state

/**
 * Entry point for the React application.
 * Wraps the App component in React.StrictMode and UserProvider.
 */

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Optional HTTPS upgrade policy for mixed content handling */}
    <div>
      {process.env.REACT_APP_USE_HTTPS !== undefined && (
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      )}
    </div>

    {/* Global context provider for auth and shared state */}
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

/**
 * Optional performance measuring utility.
 * Replace with `reportWebVitals(console.log)` to log or send metrics.
 */
reportWebVitals();
