import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { useWalletKit } from '@mysten/wallet-kit';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const PACKAGE_ID = '0x5f0eb7ec940daaa1096dc1cb18b507c8e01d5bfe9951f57a04178e8fce8b1d01';
const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

const ApproveHistory: React.FC = () => {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  const walletAddress = currentAccount?.address;
  const [approvableNfts, setApprovableNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApprovableNfts = async () => {
      if (!walletAddress) {
        setApprovableNfts([]);
        return;
      }

      setLoading(true);
      try {
        const { data: owned } = await suiClient.getOwnedObjects({
          owner: walletAddress,
          options: { showContent: true },
        });

        const approvables = owned
          .filter(obj => {
            const typeStr = (obj.data?.content as any)?.type || '';
            return typeStr.startsWith(`${PACKAGE_ID}::certificate_nft::CertificateNFT`);
          })
          .map(obj => {
            const fields = (obj.data?.content as any)?.fields;
            console.log('NFT fields:', fields);
            return {
              id: obj.data.objectId,
              name: fields?.name || fields?.description || 'Certificate',
              canApprove: fields?.can_approve ?? true,
              approved: fields?.approved ?? false,
              walrus_cid: fields?.walrus_cid || ''
            };
          })
          .filter(nft => nft.canApprove);

        setApprovableNfts(approvables);
      } catch (err) {
        console.error('Failed to fetch approvable NFTs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovableNfts();
  }, [walletAddress]);

  const approveCertificate = async (id: string) => {
    if (!currentAccount) {
      console.error('Wallet not connected');
      return;
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::certificate_nft::approve_certificate`,
      arguments: [tx.object(id)]
    });

    try {
      const result = await signAndExecuteTransactionBlock({ transactionBlock: tx });
      console.log('Approve success:', result);
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };

  if (loading) {
    return <p className="text-sm text-white/60 italic">Loading approvable certificates...</p>;
  }

  return (
    <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl mt-8">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-6 h-6 text-emerald-400" />
        <h2 className="text-2xl font-semibold text-white">Approvable Certificates</h2>
      </div>
      {approvableNfts.length > 0 ? (
        <ul className="space-y-4">
          {approvableNfts.map((nft, idx) => (
            <li key={idx} className="bg-white/5 rounded-lg p-4 flex justify-between items-center text-white">
              <span>{nft.name}</span>
              <div className="flex gap-4 items-center">
                {nft.walrus_cid && (
                  <a
                    href={nft.walrus_cid}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 underline"
                  >
                    View File
                  </a>
                )}
                {nft.approved ? (
                  <button
                    className="px-4 py-2 bg-gray-500 rounded cursor-not-allowed"
                    disabled
                  >
                    Approved
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
                    onClick={() => approveCertificate(nft.id)}
                  >
                    Approve
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/70">You do not own any certificates that can be approved.</p>
      )}
    </section>
  );
};

export default ApproveHistory;