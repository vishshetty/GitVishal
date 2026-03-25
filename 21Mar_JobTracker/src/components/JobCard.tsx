import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Clock, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../types';
import { PRIORITY_CONFIG } from '../lib/columns';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityCfg = PRIORITY_CONFIG[job.priority];
  const daysAgo = formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-[#15171E] rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 p-4 animate-fade-in`}
    >
      {/* Drag handle area */}
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-xl" />

      {/* Content (above drag layer) */}
      <div className="relative pointer-events-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-semibold tracking-tight text-[15px] leading-snug truncate">{job.company}</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{job.role}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${priorityCfg.color}`}>
            {job.priority}
          </span>
        </div>

        {/* Tags row */}
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

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{daysAgo}</span>
          </div>
          {job.url && (
            <div className="pointer-events-auto">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {job.nextAction && (
          <p className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400 truncate">⚡ {job.nextAction}</p>
        )}
      </div>

      {/* Action buttons — visible on hover */}
      <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 pointer-events-auto z-10">
        <button
          onClick={() => onEdit(job)}
          className="p-1 rounded bg-white dark:bg-slate-700 shadow text-slate-500 hover:text-brand-600 transition"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(job.id)}
          className="p-1 rounded bg-white dark:bg-slate-700 shadow text-slate-500 hover:text-red-500 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
