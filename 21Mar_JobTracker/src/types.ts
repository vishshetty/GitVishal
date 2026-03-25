export type Priority = 'High' | 'Medium' | 'Low';

export type Status =
  | 'Wishlist'
  | 'Preparing'
  | 'Applied'
  | 'Follow-up'
  | 'Screening'
  | 'Interviewing'
  | 'Offer Negotiation'
  | 'Declined'
  | 'Rejected'
  | 'Ghosted/Closed';

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  url: string;
  priority: Priority;
  resumeUsed: string;
  dateApplied: string; // ISO date string
  salaryRange: string;
  nextAction: string;
  notes: string;
  status: Status;
  createdAt: string;
}

export const ALL_STATUSES: Status[] = [
  'Wishlist',
  'Preparing',
  'Applied',
  'Follow-up',
  'Screening',
  'Interviewing',
  'Offer Negotiation',
  'Declined',
  'Rejected',
  'Ghosted/Closed',
];

export type JobFormData = Omit<Job, 'id' | 'createdAt'>;
