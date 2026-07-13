import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const redirectPath = new URLSearchParams(window.location.search).get('p');
if (redirectPath) {
  const restoredPath =
    redirectPath.replace(/~and~/g, '&') +
    window.location.search
      .slice(1)
      .split('&')
      .filter((part) => !part.startsWith('p='))
      .map((part) => `&${part}`)
      .join('')
      .replace(/^&/, '?') +
    window.location.hash;

  window.history.replaceState(null, '', `${import.meta.env.BASE_URL}${restoredPath.replace(/^\//, '')}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
