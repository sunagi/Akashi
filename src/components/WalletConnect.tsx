import React from 'react';
import { Wallet } from 'lucide-react';
import { ConnectButton } from '@mysten/wallet-kit';

const WalletConnect = () => {
  return (
    <ConnectButton
      connectText={<><Wallet className="w-5 h-5" /> Connect Wallet</>}
      connectedText="Wallet Connected"
    />
  );
};

export default WalletConnect;