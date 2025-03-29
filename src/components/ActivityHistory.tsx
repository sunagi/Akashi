import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { SuiClient } from '@mysten/sui.js/client';

const PACKAGE_ID = '0xd0f1a15a1363966b7c19b659171c6f892fac44d6cc63dca67c05f9244362a1e3';
const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

export type Activity = {
  id: number;
  type: string;
  timestamp: string;
  link?: string;
  transactionId: string;
};

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
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
          limit: 10,
        });

        const activitiesData: Activity[] = txs.data.map((tx, index) => {
          const input2 = tx.transaction?.data;
          console.log(tx.transaction?.data);

          let walrusUrl: string | undefined = undefined;

          if (typeof input2 === 'string') {
            walrusUrl = input2;
          }

          return {
            id: index,
            type: 'Certificate Issued',
            timestamp: new Date(Number(tx.timestampMs)).toLocaleString(),
            link: walrusUrl,
            transactionId: tx.digest,
          };
        });

        setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

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
        No data available yet.
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
            <p className="text-sm text-white/60">{activity.name}</p>
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityHistory;