import { useState, useEffect, useCallback } from 'react';
import { getAllJobs, addJob, updateJob, deleteJob, bulkImport } from '../lib/db';
import type { Job, JobFormData } from '../types';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    const all = await getAllJobs();
    setJobs(all);
    setLoading(false);
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const createJob = useCallback(async (data: JobFormData) => {
    const job: Job = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await addJob(job);
    setJobs(prev => [...prev, job]);
  }, []);

  const editJob = useCallback(async (id: string, data: Partial<JobFormData>) => {
    setJobs(prev => {
      const updated = prev.map(j => j.id === id ? { ...j, ...data } : j);
      const job = updated.find(j => j.id === id);
      if (job) updateJob(job);
      return updated;
    });
  }, []);

  const removeJob = useCallback(async (id: string) => {
    await deleteJob(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  const importJobs = useCallback(async (incoming: Job[]) => {
    await bulkImport(incoming);
    await loadJobs();
  }, [loadJobs]);

  const exportJobs = useCallback(() => {
    const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tracker-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jobs]);

  return { jobs, loading, createJob, editJob, removeJob, importJobs, exportJobs };
}
