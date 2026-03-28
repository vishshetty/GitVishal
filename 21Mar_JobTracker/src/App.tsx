import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Navbar } from './components/Navbar';
import { Column } from './components/Column';
import { JobCard } from './components/JobCard';
import { JobForm } from './components/JobForm';
import { JobDetail } from './components/JobDetail';
import { Reports } from './components/Reports';
import { useJobs } from './hooks/useJobs';
import { COLUMN_CONFIGS } from './lib/columns';
import { mockJobs } from './lib/mockData';
import type { Job, Status, JobFormData, Priority } from './types';

type PriorityFilter = 'All' | Priority;

const PRIORITY_FILTER_OPTIONS: { label: string; value: PriorityFilter; dot: string }[] = [
  { label: 'All', value: 'All', dot: 'bg-slate-400' },
  { label: 'High', value: 'High', dot: 'bg-red-400' },
  { label: 'Medium', value: 'Medium', dot: 'bg-amber-400' },
  { label: 'Low', value: 'Low', dot: 'bg-green-400' },
];

export default function App() {
  const { jobs, createJob, editJob, removeJob, importJobs, exportJobs } = useJobs();
  const [view, setView] = useState<'board' | 'reports'>('board');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('Wishlist');
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Keyboard shortcut: N → Add Job, Escape → close any open panel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      if (e.key === 'Escape') {
        if (detailJob) { setDetailJob(null); return; }
        if (modalOpen) { setModalOpen(false); setEditingJob(null); return; }
      }
      if (e.key === 'n' && !modalOpen && !detailJob && !e.ctrlKey && !e.metaKey && !e.altKey && !inInput) {
        openAdd();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen, detailJob]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep detail panel in sync if the underlying job is edited
  useEffect(() => {
    if (detailJob) {
      const updated = jobs.find(j => j.id === detailJob.id);
      if (updated) setDetailJob(updated);
      else setDetailJob(null);
    }
  }, [jobs]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        j.resumeUsed.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== 'All') {
      result = result.filter(j => j.priority === priorityFilter);
    }
    return result;
  }, [jobs, search, priorityFilter]);

  const jobsByStatus = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const col of COLUMN_CONFIGS) map[col.id] = [];
    for (const job of filteredJobs) {
      if (map[job.status]) map[job.status].push(job);
    }
    return map;
  }, [filteredJobs]);

  // Pipeline stats
  const boardStats = useMemo(() => {
    const active = jobs.filter(j =>
      ['Applied', 'Follow-up', 'Screening', 'Interviewing', 'Offer Negotiation'].includes(j.status)
    ).length;
    const interviewing = jobs.filter(j =>
      ['Screening', 'Interviewing'].includes(j.status)
    ).length;
    const offers = jobs.filter(j => j.status === 'Offer Negotiation').length;
    const needsAttention = jobs.filter(j => {
      if (!['Applied', 'Follow-up', 'Screening'].includes(j.status)) return false;
      const days = Math.floor((Date.now() - new Date(j.dateApplied).getTime()) / 86400000);
      return days >= 14;
    }).length;
    return { total: jobs.length, active, interviewing, offers, needsAttention };
  }, [jobs]);

  const openAdd = useCallback((status: Status = 'Wishlist') => {
    setEditingJob(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((job: Job) => {
    setEditingJob(job);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (data: JobFormData) => {
    if (editingJob) {
      await editJob(editingJob.id, data);
    } else {
      await createJob(data);
    }
    setModalOpen(false);
    setEditingJob(null);
  }, [editingJob, editJob, createJob]);

  const handleDelete = useCallback(async (id: string) => {
    if (deleteConfirm === id) {
      await removeJob(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 4000);
    }
  }, [deleteConfirm, removeJob]);

  const handleStatusChange = useCallback(async (id: string, status: Status) => {
    await editJob(id, { status });
  }, [editJob]);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setDetailJob(null); // close detail panel when dragging starts
    const job = jobs.find(j => j.id === e.active.id);
    setActiveJob(job ?? null);
  }, [jobs]);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeJobObj = jobs.find(j => j.id === active.id);
    if (!activeJobObj) return;

    let newStatus: Status | null = null;
    if (COLUMN_CONFIGS.find(c => c.id === over.id)) {
      newStatus = over.id as Status;
    } else {
      const overJob = jobs.find(j => j.id === over.id);
      if (overJob && overJob.status !== activeJobObj.status) {
        newStatus = overJob.status;
      }
    }
    if (newStatus && newStatus !== activeJobObj.status) {
      editJob(activeJobObj.id, { status: newStatus });
    }
  }, [jobs, editJob]);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as Job[];
    await importJobs(parsed);
    e.target.value = '';
  }, [importJobs]);

  const isFiltered = search.trim() || priorityFilter !== 'All';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearch={setSearch}
        onAddJob={() => openAdd()}
        onExport={exportJobs}
        onImport={handleImport}
      />

      {view === 'board' ? (
        <main className="flex-1 p-4 overflow-y-auto flex flex-col relative gap-3">

          {/* Pipeline stats + priority filter */}
          {jobs.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatPill label="Total" value={boardStats.total} color="text-slate-500" />
                <StatPill label="Active" value={boardStats.active} color="text-blue-600 dark:text-blue-400" />
                <StatPill label="Interviewing" value={boardStats.interviewing} color="text-amber-600 dark:text-amber-400" />
                <StatPill label="Offers" value={boardStats.offers} color="text-emerald-600 dark:text-emerald-400" />
                {boardStats.needsAttention > 0 && (
                  <StatPill
                    label="Need follow-up"
                    value={boardStats.needsAttention}
                    color="text-orange-600 dark:text-orange-400"
                    icon="⏰"
                    highlight
                  />
                )}
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1 hidden sm:block">Priority:</span>
                {PRIORITY_FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPriorityFilter(priorityFilter === opt.value ? 'All' : opt.value)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                      priorityFilter === opt.value
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    {opt.value !== 'All' && <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter result count */}
          {isFiltered && jobs.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 shrink-0 -mt-1">
              {filteredJobs.length === 0
                ? 'No jobs match your filters'
                : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} shown`}
              {' · '}
              <button
                onClick={() => { setSearch(''); setPriorityFilter('All'); }}
                className="underline text-brand-500 hover:text-brand-600 transition"
              >
                Clear filters
              </button>
            </p>
          )}

          {/* Empty board state */}
          {jobs.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-slate-50/80 dark:bg-[#0b0c10]/80 backdrop-blur-[2px]">
              <div className="text-center max-w-sm glass p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-full flex items-center justify-center text-3xl mb-2">⭐</div>
                <h3 className="text-xl font-bold">Your Board is Empty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Start tracking your job hunt by adding a new job, or load our demo data to see the app in action.
                </p>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => importJobs(mockJobs)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition"
                  >
                    Load Demo Data
                  </button>
                  <button
                    onClick={() => openAdd()}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                  >
                    Add My First Job
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: Press{' '}
                  <kbd className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">N</kbd>
                  {' '}anytime to quickly add a job
                </p>
              </div>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {COLUMN_CONFIGS.map(col => (
                <Column
                  key={col.id}
                  config={col}
                  jobs={jobsByStatus[col.id] ?? []}
                  onAddJob={() => openAdd(col.id)}
                  onEditJob={openEdit}
                  onDeleteJob={handleDelete}
                  onViewDetail={setDetailJob}
                />
              ))}
            </div>

            <DragOverlay>
              {activeJob && (
                <div className="rotate-2 opacity-90 scale-105">
                  <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </main>
      ) : (
        <Reports jobs={jobs} />
      )}

      {/* Keyboard shortcut hint */}
      {view === 'board' && jobs.length > 0 && !detailJob && (
        <div className="fixed bottom-4 right-4 hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pointer-events-none select-none">
          <kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">N</kbd>
          <span>new job</span>
          <span className="mx-1 opacity-50">·</span>
          <span>click card to view</span>
        </div>
      )}

      {/* Delete confirmation toast */}
      {deleteConfirm && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slide-up flex items-center gap-4 z-50">
          <span className="text-slate-300">Are you sure? This cannot be undone.</span>
          <button
            onClick={() => removeJob(deleteConfirm).then(() => setDeleteConfirm(null))}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded-lg transition text-xs"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="text-slate-400 hover:text-slate-200 transition text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Job detail slide-over */}
      {detailJob && (
        <JobDetail
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onEdit={job => { setDetailJob(null); openEdit(job); }}
          onDelete={id => { setDetailJob(null); handleDelete(id); }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <JobForm
          initial={editingJob}
          defaultStatus={defaultStatus}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingJob(null); }}
        />
      )}
    </div>
  );
}

function StatPill({
  label, value, color, icon, highlight,
}: {
  label: string;
  value: number;
  color: string;
  icon?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
      highlight
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }`}>
      {icon && <span>{icon}</span>}
      <span className={`font-bold text-sm leading-none ${color}`}>{value}</span>
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
