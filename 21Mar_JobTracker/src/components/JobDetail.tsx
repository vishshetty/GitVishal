import { X, ExternalLink, Copy, Check, Pencil, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import type { Job, Status } from '../types';
import { ALL_STATUSES } from '../types';
import { COLUMN_CONFIGS, PRIORITY_CONFIG } from '../lib/columns';

interface JobDetailProps {
  job: Job;
  onClose: () => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}

export function JobDetail({ job, onClose, onEdit, onDelete, onStatusChange }: JobDetailProps) {
  const [copied, setCopied] = useState(false);
  const colConfig = COLUMN_CONFIGS.find(c => c.id === job.status)!;
  const priorityCfg = PRIORITY_CONFIG[job.priority];

  const appliedDate = format(new Date(job.dateApplied), 'dd MMM yyyy');
  const appliedAgo = formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true });

  const copyUrl = () => {
    if (!job.url) return;
    navigator.clipboard.writeText(job.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 bg-white dark:bg-[#0f1117] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-in-right">

        {/* Coloured header */}
        <div className={`px-5 pt-5 pb-4 border-b border-slate-200/60 dark:border-slate-800 ${colConfig.headerBg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xl leading-none">{colConfig.icon}</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colConfig.badgeBg}`}>
                  {job.status}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${priorityCfg.color}`}>
                  {job.priority}
                </span>
              </div>
              <h2 className="font-bold text-xl leading-tight">{job.company}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{job.role}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition shrink-0 mt-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick status change */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
            Move to Stage
          </label>
          <select
            value={job.status}
            onChange={e => onStatusChange(job.id, e.target.value as Status)}
            className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Metadata grid */}
          <div className="grid grid-cols-1 gap-3">
            <DetailRow icon="📅" label="Applied" value={`${appliedDate}  ·  ${appliedAgo}`} />
            {job.location && <DetailRow icon="📍" label="Location" value={job.location} />}
            {job.salaryRange && <DetailRow icon="💰" label="Salary Range" value={job.salaryRange} />}
            {job.resumeUsed && <DetailRow icon="📄" label="Resume Used" value={job.resumeUsed} />}
          </div>

          {/* Job URL */}
          {job.url && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
              <span className="text-base shrink-0">🔗</span>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-brand-600 dark:text-brand-400 hover:underline truncate flex items-center gap-1 min-w-0"
              >
                <span className="truncate">{job.url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <button
                onClick={copyUrl}
                title="Copy URL"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Next Action — prominent */}
          {job.nextAction && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1.5">
                ⚡ Next Action
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{job.nextAction}</p>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                📝 Notes & Contacts
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {job.notes}
              </p>
            </div>
          )}

          {(!job.nextAction && !job.notes) && (
            <p className="text-xs text-slate-400 text-center py-4 italic">No notes or next action recorded.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => { onClose(); onEdit(job); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit Job
          </button>
          <button
            onClick={() => { onClose(); onDelete(job.id); }}
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-300 dark:hover:border-red-800/60 transition"
            title="Delete job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base shrink-0 mt-0.5 w-5 text-center">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
}
