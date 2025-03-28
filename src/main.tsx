import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { WalletKitProvider } from '@mysten/wallet-kit';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletKitProvider>
      <App />
    </WalletKitProvider>
  </StrictMode>
);
