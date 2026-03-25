import { useState, useMemo, useCallback } from 'react';
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
import { useJobs } from './hooks/useJobs';
import { COLUMN_CONFIGS } from './lib/columns';
import type { Job, Status, JobFormData } from './types';

export default function App() {
  const { jobs, createJob, editJob, removeJob, importJobs, exportJobs } = useJobs();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('Wishlist');
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(j =>
      j.company.toLowerCase().includes(q) ||
      j.role.toLowerCase().includes(q) ||
      j.resumeUsed.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const jobsByStatus = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const col of COLUMN_CONFIGS) map[col.id] = [];
    for (const job of filteredJobs) {
      if (map[job.status]) map[job.status].push(job);
    }
    return map;
  }, [filteredJobs]);

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
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }, [deleteConfirm, removeJob]);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const job = jobs.find(j => j.id === e.active.id);
    setActiveJob(job ?? null);
  }, [jobs]);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeJobObj = jobs.find(j => j.id === active.id);
    if (!activeJobObj) return;

    let newStatus: Status | null = null;
    // If dropped over a column droppable
    if (COLUMN_CONFIGS.find(c => c.id === over.id)) {
      newStatus = over.id as Status;
    } else {
      // dropped over another card
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

    const activeJobObj = jobs.find(j => j.id === active.id);
    const overJobObj = jobs.find(j => j.id === over.id);
    if (activeJobObj && overJobObj && activeJobObj.status === overJobObj.status) {
      // reorder within same column — purely visual; persist order via createdAt isn't needed
    }
  }, [jobs]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as Job[];
    await importJobs(parsed);
    e.target.value = '';
  }, [importJobs]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar search={search} onSearch={setSearch} onAddJob={() => openAdd()} onExport={exportJobs} onImport={handleImport} />

      <main className="flex-1 p-4 overflow-y-auto flex flex-col">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          {/* Changed from horizontal flex to a 5-column grid spanning 2 distinct rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {COLUMN_CONFIGS.map(col => (
              <Column
                key={col.id}
                config={col}
                jobs={jobsByStatus[col.id] ?? []}
                onAddJob={() => openAdd(col.id)}
                onEditJob={openEdit}
                onDeleteJob={handleDelete}
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

      {/* Delete confirmation toast */}
      {deleteConfirm && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-sm px-4 py-2 rounded-xl shadow-lg animate-slide-up flex items-center gap-3 z-50">
          <span>Click delete again to confirm</span>
          <button
            onClick={() => removeJob(deleteConfirm).then(() => setDeleteConfirm(null))}
            className="text-red-400 font-semibold hover:text-red-300 transition"
          >
            Delete
          </button>
          <button onClick={() => setDeleteConfirm(null)} className="text-slate-400 hover:text-slate-200 transition">✕</button>
        </div>
      )}

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
