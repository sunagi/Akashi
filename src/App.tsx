import React, { useEffect, useState } from 'react';
import { Upload, History } from 'lucide-react';
import Header from './components/Header';
import CertificateUpload from './components/CertificateUpload';
import ActivityHistory from './components/ActivityHistory';
import ApproveHistory from './components/ApproveHistory';
import { WalletKitProvider } from '@mysten/wallet-kit';

function App() {
  const [approvableNfts, setApprovableNfts] = useState<any[]>([]);

  useEffect(() => {
    // Replace with actual logic to fetch NFTs and check approval eligibility
    const fetchApprovableNfts = async () => {
      // Dummy logic (replace with actual API or wallet logic)
      const nfts = await getMyNfts(); // You should implement getMyNfts
      const eligible = nfts.filter(nft => nft.canApprove);
      setApprovableNfts(eligible);
    };

    fetchApprovableNfts();
  }, []);

  return (
    <WalletKitProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-50">
          <Header />
        </div>
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Certificate Upload Section */}
            <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-semibold text-white">Issue Certificate</h2>
              </div>
              <CertificateUpload />
            </section>

            {/* Sender Activity Section */}
            <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-semibold text-white">Sender Activity</h2>
              </div>
              <ActivityHistory />
            </section>
          </div>

          <ApproveHistory approvableNfts={approvableNfts} />
        </main>
      </div>
    </WalletKitProvider>
  );
}

export default App;