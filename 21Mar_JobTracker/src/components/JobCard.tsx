import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Clock, Pencil, Trash2, StickyNote, AlertTriangle, GripVertical } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import type { Job } from '../types';
import { PRIORITY_CONFIG } from '../lib/columns';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onViewDetail?: (job: Job) => void;
}

const PRIORITY_BORDER = {
  High:   'border-l-red-400 dark:border-l-red-500',
  Medium: 'border-l-amber-400 dark:border-l-amber-500',
  Low:    'border-l-green-400 dark:border-l-green-500',
};

const STALE_STATUSES = new Set(['Applied', 'Follow-up', 'Screening']);

export function JobCard({ job, onEdit, onDelete, onViewDetail }: JobCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityCfg = PRIORITY_CONFIG[job.priority];
  const daysAgo = formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true });
  const daysSince = differenceInDays(new Date(), new Date(job.dateApplied));
  const isStale = STALE_STATUSES.has(job.status) && daysSince >= 14;

  const handleCardClick = () => {
    if (!isDragging && onViewDetail) onViewDetail(job);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-white dark:bg-[#15171E] rounded-xl border border-slate-200/80 dark:border-slate-700/50 border-l-4 ${PRIORITY_BORDER[job.priority]} shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 animate-fade-in cursor-grab active:cursor-grabbing`}
      onClick={handleCardClick}
    >
      {/* Grip handle — visual indicator, top-right of left edge */}
      <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical className="w-3 h-5 text-slate-300 dark:text-slate-600" />
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-semibold tracking-tight text-[15px] leading-snug truncate">{job.company}</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{job.role}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityCfg.color}`}>
            {job.priority}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.location && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-[#1A1D24] text-slate-600 dark:text-slate-300">
              📍 {job.location}
            </span>
          )}
          {job.resumeUsed && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-[#1A1D24] text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
              📄 {job.resumeUsed}
            </span>
          )}
          {job.salaryRange && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-[#1A1D24] text-slate-600 dark:text-slate-300">
              💰 {job.salaryRange}
            </span>
          )}
        </div>

        {/* Next action pill */}
        {job.nextAction && (
          <p className="mb-2.5 text-[11px] text-amber-700 dark:text-amber-400 truncate bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-md px-2 py-1">
            ⚡ {job.nextAction}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{daysAgo}</span>
            {isStale && (
              <span
                title={`No movement in ${daysSince} days — consider following up`}
                className="flex items-center gap-0.5 text-orange-500 ml-1"
              >
                <AlertTriangle className="w-3 h-3" />
              </span>
            )}
            {job.notes && (
              <span className="flex items-center gap-0.5 text-slate-400 ml-1" title={job.notes}>
                <StickyNote className="w-3 h-3" />
              </span>
            )}
          </div>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Hover action buttons */}
      <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 z-10">
        <button
          onClick={e => { e.stopPropagation(); onEdit(job); }}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-md border border-slate-100 dark:border-slate-600 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
          title="Edit job"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(job.id); }}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-md border border-slate-100 dark:border-slate-600 text-slate-500 hover:text-red-500 transition"
          title="Delete job"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
