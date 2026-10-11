import React from 'react';
import { PropertyStatus } from '../types';

interface StatusBadgeProps {
  status: PropertyStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<
    PropertyStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    available: {
      label: 'Available',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    pending: {
      label: 'Pending',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
    },
    pending_approval: {
      label: 'Pending Approval',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500 animate-pulse',
    },
    rented: {
      label: 'Rented',
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-500/30',
      dot: 'bg-blue-500',
    },
    sold: {
      label: 'Sold',
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-500/30',
      dot: 'bg-purple-500',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500',
    },
  };

  const item = config[status] || config.available;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${item.bg} ${item.text} ${item.border} ${sizeClasses} backdrop-blur-xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
};
