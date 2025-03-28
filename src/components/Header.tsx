import React from 'react';
import { AlignCenterVertical as Certificate } from 'lucide-react';
import WalletConnect from './WalletConnect';

const Header = () => {
  return (
    <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Certificate className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Akashi</h1>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}

export default Header;