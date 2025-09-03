import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { TanstackProvider } from './lib/tanstack';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TanstackProvider>
      <App />
    </TanstackProvider>
  </StrictMode>,
);
