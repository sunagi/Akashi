import React from 'react';
import { CheckCircle } from 'lucide-react';

const ActivityHistory = () => {
  // Mock data - replace with actual data later
  const activities = [
    {
      id: 1,
      type: 'Certificate Issued',
      name: 'Professional Development Certificate',
      timestamp: '2 minutes ago',
    },
    {
      id: 2,
      type: 'NFT Created',
      name: 'Course Completion Certificate',
      timestamp: '1 hour ago',
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-1" />
          <div className="flex-1">
            <p className="text-white font-medium">{activity.type}</p>
            <p className="text-sm text-white/60">{activity.name}</p>
            <p className="text-xs text-white/40 mt-1">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityHistory;