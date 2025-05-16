import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, register the service worker
// Only register in production to avoid development conflicts
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      // Show a notification when a new version is available
      const updateNotification = document.createElement('div');
      updateNotification.style.position = 'fixed';
      updateNotification.style.bottom = '20px';
      updateNotification.style.left = '50%';
      updateNotification.style.transform = 'translateX(-50%)';
      updateNotification.style.backgroundColor = '#5E8FF7';
      updateNotification.style.color = 'white';
      updateNotification.style.padding = '12px 20px';
      updateNotification.style.borderRadius = '8px';
      updateNotification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      updateNotification.style.zIndex = '9999';
      updateNotification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
          <span>New version available! Please refresh to update.</span>
          <button id="update-btn" style="background-color: white; color: #5E8FF7; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer;">
            Update
          </button>
        </div>
      `;
      document.body.appendChild(updateNotification);

      // Add event listener to the update button
      document.getElementById('update-btn').addEventListener('click', () => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });
    },
  });
} else {
  serviceWorkerRegistration.unregister();
}