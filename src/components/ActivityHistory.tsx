import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { SuiClient } from '@mysten/sui.js/client';
import { useWalletKit } from '@mysten/wallet-kit';

const PACKAGE_ID = '0x57ef8f2cfa12b3f5fcff0c2ac99cd40de3d81038b0758f13f4dde3804e7d7333';
const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

export type Activity = {
  id: number;
  type: string;
  timestamp: string;
  link?: string;
  transactionId: string;
  sender: string;
  approved?: boolean;
};

const ActivityHistory: React.FC<{ mode?: 'sender' | 'approver' }> = ({ mode = 'sender' }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentAccount } = useWalletKit();
  const walletAddress = currentAccount?.address;

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        if (!walletAddress) {
          setActivities([]);
          setLoading(false);
          return;
        }

        if (mode === 'approver') {
          const { data: owned } = await suiClient.getOwnedObjects({
            owner: walletAddress,
            options: { showContent: true },
          });

          const ownedNfts = owned
            .filter(obj => {
              const typeStr = (obj.data?.content as any)?.type || '';
              return typeStr.startsWith(`${PACKAGE_ID}::certificate_nft::CertificateNFT`);
            })
            .map((obj, index) => {
              const fields = (obj.data?.content as any)?.fields;
              return {
                id: index,
                type: fields?.name || fields?.description || 'Certificate',
                timestamp: new Date().toLocaleString(), // No timestamp available
                link: fields?.walrus_cid,
                transactionId: obj.data?.objectId,
                sender: walletAddress,
                approved: fields?.approved,
              };
            });

          setActivities(ownedNfts);
        } else {
          const txs = await suiClient.queryTransactionBlocks({
            filter: {
              MoveFunction: {
                package: PACKAGE_ID,
                module: 'certificate_nft',
                function: 'mint_certificate',
              },
            },
            options: {
              showInput: true,
              showEffects: true,
              showEvents: true,
              showObjectChanges: true,
              showRawInput: true,
            },
            limit: 50,
          });

          const walletTxs = txs.data.filter(tx => tx.transaction?.data?.sender === walletAddress);

          const activitiesData: Activity[] = await Promise.all(
            walletTxs.map(async (tx, index) => {
              const txData = tx.transaction?.data;
              const args = txData?.arguments || [];
              let walrusUrl: string | undefined = undefined;
              let certificateName = 'Certificate Issued';
              let approved: boolean | undefined = undefined;

              if (args.length > 0 && typeof args[0] === 'string') {
                walrusUrl = args[0];
              }

              const created = tx.effects?.created?.[0]?.reference?.objectId;
              if (created) {
                try {
                  const obj = await suiClient.getObject({
                    id: created,
                    options: { showContent: true },
                  });
                  const fields = (obj.data?.content as any)?.fields;
                  if (fields?.description) certificateName = fields.description;
                  if (typeof fields?.approved === 'boolean') approved = fields.approved;
                } catch (err) {
                  console.warn('Failed to fetch created object fields:', err);
                }
              }

              return {
                id: index,
                type: certificateName,
                timestamp: new Date(Number(tx.timestampMs)).toLocaleString(),
                link: walrusUrl,
                transactionId: tx.digest,
                sender: txData?.sender || '',
                approved,
              };
            })
          );

          setActivities(activitiesData);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [walletAddress, mode]);

  const handleActivityClick = (transactionId: string) => {
    const explorerUrl = `https://suiscan.xyz/testnet/tx/${transactionId}`;
    window.open(explorerUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="text-sm text-white/60 italic">
        Loading...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-sm text-white/60 italic">
        {walletAddress 
          ? "There are no transactions for this wallet yet." 
          : "No data available yet."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => handleActivityClick(activity.transactionId)}
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-1" />
          <div className="flex-1">
            <p className="text-white font-medium">{activity.type}</p>
            {activity.link && (
              <a
                href={activity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 underline mt-1 block"
                onClick={(e) => e.stopPropagation()}
              >
                View File
              </a>
            )}
            <p className="text-xs text-white/40 mt-1">{activity.timestamp}</p>
            <p className={`text-xs mt-1 ${activity.approved ? 'text-emerald-400' : 'text-yellow-400'}`}>
              Status: {activity.approved ? 'Approved' : 'Pending Approval'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityHistory;