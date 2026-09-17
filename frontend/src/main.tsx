import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {/* Ajoutez ici vos providers comme Toaster si vous en avez */}
  </React.StrictMode>,
);

// ✅ Enregistrement du Service Worker pour la PWA (sans erreur de type)
registerSW({ 
  immediate: true,
  onRegisteredSW: (swUrl: string) => {
    console.log(`Service Worker enregistré : ${swUrl}`);
  }
});