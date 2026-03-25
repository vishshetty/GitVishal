import type { Status } from '../types';

export interface ColumnConfig {
  id: Status;
  label: string;
  icon: string;
  headerBg: string;
  borderColor: string;
  badgeBg: string;
}

export const COLUMN_CONFIGS: ColumnConfig[] = [
  {
    id: 'Wishlist',
    label: 'Wishlist',
    icon: '⭐',
    headerBg: 'bg-indigo-100/80 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    badgeBg: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200',
  },
  {
    id: 'Preparing',
    label: 'Preparing',
    icon: '📝',
    headerBg: 'bg-fuchsia-100/80 dark:bg-fuchsia-900/30',
    borderColor: 'border-fuchsia-300 dark:border-fuchsia-700',
    badgeBg: 'bg-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-800 dark:text-fuchsia-200',
  },
  {
    id: 'Applied',
    label: 'Applied',
    icon: '🚀',
    headerBg: 'bg-blue-100/80 dark:bg-blue-900/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
    badgeBg: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  },
  {
    id: 'Follow-up',
    label: 'Follow-up',
    icon: '📬',
    headerBg: 'bg-sky-100/80 dark:bg-sky-900/30',
    borderColor: 'border-sky-300 dark:border-sky-700',
    badgeBg: 'bg-sky-200 text-sky-800 dark:bg-sky-800 dark:text-sky-200',
  },
  {
    id: 'Screening',
    label: 'Screening',
    icon: '📞',
    headerBg: 'bg-teal-100/80 dark:bg-teal-900/30',
    borderColor: 'border-teal-300 dark:border-teal-700',
    badgeBg: 'bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-200',
  },
  {
    id: 'Interviewing',
    label: 'Interviewing',
    icon: '🎯',
    headerBg: 'bg-amber-100/80 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    badgeBg: 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200',
  },
  {
    id: 'Offer Negotiation',
    label: 'Offer Negotiation',
    icon: '🤝',
    headerBg: 'bg-emerald-100/80 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    badgeBg: 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200',
  },
  {
    id: 'Declined',
    label: 'Declined',
    icon: '👎',
    headerBg: 'bg-orange-100/80 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
    badgeBg: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  },
  {
    id: 'Rejected',
    label: 'Rejected',
    icon: '❌',
    headerBg: 'bg-red-100/80 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
    badgeBg: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
  },
  {
    id: 'Ghosted/Closed',
    label: 'Ghosted/Closed',
    icon: '👻',
    headerBg: 'bg-slate-200/80 dark:bg-slate-800/60',
    borderColor: 'border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  },
];

export const PRIORITY_CONFIG = {
  High:   { label: 'High',   color: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400' },
  Medium: { label: 'Medium', color: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400' },
  Low:    { label: 'Low',    color: 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400' },
};
