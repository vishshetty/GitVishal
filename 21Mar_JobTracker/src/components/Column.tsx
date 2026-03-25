import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Job } from '../types';
import type { ColumnConfig } from '../lib/columns';
import { JobCard } from './JobCard';

interface ColumnProps {
  config: ColumnConfig;
  jobs: Job[];
  onAddJob: () => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
}

export function Column({ config, jobs, onAddJob, onEditJob, onDeleteJob }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: config.id });

  return (
    <div className={`flex flex-col w-full h-[calc(50vh-4rem)] min-h-[250px] rounded-2xl overflow-hidden glass shadow border ${config.borderColor} transition-all`}>
      {/* Colorful Column header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${config.borderColor} ${config.headerBg}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none drop-shadow-sm">{config.icon}</span>
          <span className="font-bold text-sm truncate uppercase tracking-wider">{config.label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badgeBg} shadow-sm`}>
            {jobs.length}
          </span>
          <button onClick={onAddJob} className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-black/30 transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card list */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px] transition-colors duration-200 ${
          isOver ? 'bg-slate-100/50 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-transparent'
        }`}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onEdit={onEditJob} onDelete={onDeleteJob} />
          ))}
        </SortableContext>

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-slate-400 dark:text-slate-500 text-xs text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-1">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}
