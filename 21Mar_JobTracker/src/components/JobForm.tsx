import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Job, JobFormData, Status, Priority } from '../types';
import { ALL_STATUSES } from '../types';

interface JobFormProps {
  initial?: Job | null;
  defaultStatus?: Status;
  onSave: (data: JobFormData) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500/40 transition';

export function JobForm({ initial, defaultStatus = 'Wishlist', onSave, onClose }: JobFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      company: '',
      role: '',
      location: '',
      url: '',
      priority: 'Medium',
      resumeUsed: '',
      dateApplied: new Date().toISOString().slice(0, 10),
      salaryRange: '',
      nextAction: '',
      notes: '',
      status: defaultStatus,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        ...initial,
        dateApplied: initial.dateApplied.slice(0, 10),
      });
    }
  }, [initial, reset]);

  const onSubmit = (data: JobFormData) => onSave(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-base">{initial ? 'Edit Job' : 'Add New Job'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" error={errors.company?.message}>
              <input {...register('company', { required: 'Required' })} className={inputCls} placeholder="Google" />
            </Field>
            <Field label="Role *" error={errors.role?.message}>
              <input {...register('role', { required: 'Required' })} className={inputCls} placeholder="Senior QA Engineer" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Location / Work Model">
              <input {...register('location')} className={inputCls} placeholder="Remote" />
            </Field>
            <Field label="Priority">
              <select {...register('priority')} className={inputCls}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Job / LinkedIn URL">
            <input {...register('url')} type="url" className={inputCls} placeholder="https://linkedin.com/jobs/..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Resume Used">
              <input {...register('resumeUsed')} className={inputCls} placeholder="QA_Lead_Resume_v2" />
            </Field>
            <Field label="Date Applied">
              <input {...register('dateApplied')} type="date" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary Range">
              <input {...register('salaryRange')} className={inputCls} placeholder="₹25-30 LPA" />
            </Field>
            <Field label="Status">
              <select {...register('status')} className={inputCls}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Next Action / Deadline">
            <input {...register('nextAction')} className={inputCls} placeholder="Follow up on Mon, Code challenge due Thu" />
          </Field>

          <Field label="Notes & Contacts">
            <textarea {...register('notes')} rows={3} className={`${inputCls} resize-none`} placeholder="Recruiter: Jane Doe (jane@co.com) | Via referral from Alex..." />
          </Field>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm">
              {initial ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
