import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { SuiClient } from '@mysten/sui.js/client';
import { useWalletKit } from '@mysten/wallet-kit';

const PACKAGE_ID = '0xd0f1a15a1363966b7c19b659171c6f892fac44d6cc63dca67c05f9244362a1e3';
const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

export type Activity = {
  id: number;
  type: string;
  timestamp: string;
  link?: string;
  transactionId: string;
  sender: string;
};

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentAccount } = useWalletKit();
  const walletAddress = currentAccount?.address;

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // まず、パッケージの関連トランザクションをクエリ
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
          limit: 50, // より多くのトランザクションを取得して後でフィルタリング
        });

        if (walletAddress) {
          // 接続されたウォレットが送信者のトランザクションのみをフィルタリング
          const walletTxs = txs.data.filter(tx => {
            // トランザクションの送信者を取得
            const sender = tx.transaction?.data?.sender;
            return sender === walletAddress;
          });

          console.log(`接続されたウォレット: ${walletAddress}`);
          console.log(`フィルタリング後のトランザクション数: ${walletTxs.length}`);

          const activitiesData: Activity[] = await Promise.all(
            walletTxs.map(async (tx, index) => {
              const txData = tx.transaction?.data;
              const args = txData?.arguments || [];
              let walrusUrl: string | undefined = undefined;
              let certificateName = 'Certificate Issued';

              // 最初の引数がリンクと仮定
              if (args.length > 0 && typeof args[0] === 'string') {
                walrusUrl = args[0];
              }

              // Try to get created object name
              const created = tx.effects?.created?.[0]?.reference?.objectId;
              if (created) {
                try {
                  const obj = await suiClient.getObject({
                    id: created,
                    options: { showContent: true },
                  });
                  const fields = (obj.data?.content as any)?.fields;
                  if (fields?.description) {
                    certificateName = fields.description;
                  }
                } catch (err) {
                  console.warn('Failed to fetch created object name:', err);
                }
              }

              return {
                id: index,
                type: certificateName,
                timestamp: new Date(Number(tx.timestampMs)).toLocaleString(),
                link: walrusUrl,
                transactionId: tx.digest,
                sender: txData?.sender || '',
              };
            })
          );

          setActivities(activitiesData);
        } else {
          // ウォレットが接続されていない場合は全ての活動をセット
          const activitiesData: Activity[] = txs.data.map((tx, index) => {
            const link = tx.transaction?.data;
            let walrusUrl: string | undefined = undefined;

            if (typeof link === 'string') {
              walrusUrl = link;
            }

            return {
              id: index,
              type: 'Certificate Issued',
              timestamp: new Date(Number(tx.timestampMs)).toLocaleString(),
              link: walrusUrl,
              transactionId: tx.digest,
              sender: tx.transaction?.data?.sender || '',
            };
          });

          setActivities(activitiesData);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [walletAddress]);

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
            {walletAddress && activity.sender === walletAddress && (
              <p className="text-xs text-emerald-400 mt-1">Your transaction</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityHistory;