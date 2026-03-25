import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Job } from '../types';

interface JobTrackerDB extends DBSchema {
  jobs: {
    key: string;
    value: Job;
    indexes: { 'by-status': string; 'by-company': string };
  };
}

let db: IDBPDatabase<JobTrackerDB>;

async function getDB() {
  if (!db) {
    db = await openDB<JobTrackerDB>('job-tracker-db', 1, {
      upgrade(database) {
        const store = database.createObjectStore('jobs', { keyPath: 'id' });
        store.createIndex('by-status', 'status');
        store.createIndex('by-company', 'company');
      },
    });
  }
  return db;
}

export async function getAllJobs(): Promise<Job[]> {
  const database = await getDB();
  return database.getAll('jobs');
}

export async function addJob(job: Job): Promise<void> {
  const database = await getDB();
  await database.put('jobs', job);
}

export async function updateJob(job: Job): Promise<void> {
  const database = await getDB();
  await database.put('jobs', job);
}

export async function deleteJob(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('jobs', id);
}

export async function bulkImport(jobs: Job[]): Promise<void> {
  const database = await getDB();
  const tx = database.transaction('jobs', 'readwrite');
  await Promise.all([...jobs.map(j => tx.store.put(j)), tx.done]);
}
