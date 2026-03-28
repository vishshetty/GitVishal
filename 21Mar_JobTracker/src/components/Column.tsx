import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import type { Job } from '../types';
import type { ColumnConfig } from '../lib/columns';
import { JobCard } from './JobCard';

interface ColumnProps {
  config: ColumnConfig;
  jobs: Job[];
  onAddJob: () => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onViewDetail: (job: Job) => void;
  collapsible?: boolean;
}

// Columns that represent terminal/done states — collapsible by default
const TERMINAL_STATUSES = new Set(['Declined', 'Rejected', 'Ghosted/Closed']);

export function Column({
  config, jobs, onAddJob, onEditJob, onDeleteJob, onViewDetail, collapsible,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: config.id });
  const isTerminal = collapsible ?? TERMINAL_STATUSES.has(config.id);
  const [collapsed, setCollapsed] = useState(isTerminal);

  return (
    <div className={`flex flex-col w-full rounded-2xl overflow-hidden glass shadow border ${config.borderColor} transition-all ${collapsed ? 'h-auto' : 'h-[calc(50vh-3.5rem)] min-h-[260px]'}`}>
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${config.borderColor} ${config.headerBg} ${collapsed ? 'rounded-b-2xl border-b-0' : ''}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none drop-shadow-sm">{config.icon}</span>
          <span className="font-bold text-xs truncate uppercase tracking-wider">{config.label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badgeBg} shadow-sm`}>
            {jobs.length}
          </span>
          {!collapsed && (
            <button
              onClick={onAddJob}
              title={`Add job to ${config.label}`}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-black/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          {isTerminal && (
            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expand column' : 'Collapse column'}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-black/30 transition"
            >
              {collapsed
                ? <ChevronRight className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
          )}
        </div>
      </div>

      {/* Card list — hidden when collapsed */}
      {!collapsed && (
        <div
          ref={setNodeRef}
          className={`flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[150px] transition-colors duration-200 ${
            isOver ? 'bg-brand-50/40 dark:bg-brand-900/10' : 'bg-slate-50/30 dark:bg-transparent'
          }`}
        >
          <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEditJob}
                onDelete={onDeleteJob}
                onViewDetail={onViewDetail}
              />
            ))}
          </SortableContext>

          {jobs.length === 0 && (
            <button
              onClick={onAddJob}
              className="w-full flex flex-col items-center justify-center gap-1.5 h-24 text-slate-400 dark:text-slate-500 text-xs text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add first job here</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
