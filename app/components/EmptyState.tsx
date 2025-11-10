import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = '表示できるデータはありません。' }) => {
  return (
    <div className="flex flex-col justify-center items-center h-[60vh] text-gray-500">
      <Inbox className="w-16 h-16 mb-4" />
      <p className="text-xl">{message}</p>
    </div>
  );
};

export default EmptyState;