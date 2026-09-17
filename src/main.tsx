// Ensure window.fetch is writable and not a read-only getter in strict environments/iframes
(function ensureFetchWritable() {
  if (typeof window === 'undefined') return;
  try {
    const nativeFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
    let currentFetch = nativeFetch;
    
    const proto = Object.getPrototypeOf ? Object.getPrototypeOf(window) : ((window as any).__proto__ || null);
    if (proto) {
      try {
        const desc = Object.getOwnPropertyDescriptor(proto, 'fetch');
        if (desc && !desc.set && desc.configurable) {
          Object.defineProperty(proto, 'fetch', {
            get: () => currentFetch,
            set: (val) => { currentFetch = val; },
            configurable: true,
            enumerable: true
          });
        }
      } catch (_) {}
    }

    try {
      Object.defineProperty(window, 'fetch', {
        get: () => currentFetch,
        set: (val) => { currentFetch = val; },
        configurable: true,
        enumerable: true
      });
    } catch (_) {}
  } catch (_) {}
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
