import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import axios from 'axios'

// Global axios config
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Potential redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// Register PWA service worker
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() { /* can prompt user to refresh */ },
    onOfflineReady() { console.log('App ready for offline use') },
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
