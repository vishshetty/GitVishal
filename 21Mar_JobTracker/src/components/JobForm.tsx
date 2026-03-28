import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle } from 'lucide-react';
import type { Job, JobFormData, Status, Priority } from '../types';
import { ALL_STATUSES } from '../types';

interface JobFormProps {
  initial?: Job | null;
  defaultStatus?: Status;
  resumeSuggestions?: string[];
  onSave: (data: JobFormData) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

function Field({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={`block text-xs font-medium mb-1 transition-colors ${error ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const baseCls = 'w-full text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 transition bg-slate-50 dark:bg-slate-800';
const normalCls = `${baseCls} border border-slate-200 dark:border-slate-700 focus:ring-brand-500/40 focus:border-brand-400 dark:focus:border-brand-500`;
const errorCls  = `${baseCls} border border-red-400 dark:border-red-600 focus:ring-red-400/40`;

export function JobForm({
  initial, defaultStatus = 'Wishlist', resumeSuggestions = [], onSave, onClose,
}: JobFormProps) {
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
      reset({ ...initial, dateApplied: initial.dateApplied.slice(0, 10) });
    }
  }, [initial, reset]);

  const onSubmit = (data: JobFormData) => onSave(data);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
          <div>
            <h2 className="font-semibold text-base">{initial ? 'Edit Job' : 'Add New Job'}</h2>
            {!initial && defaultStatus !== 'Wishlist' && (
              <p className="text-xs text-slate-400 mt-0.5">Adding to: <span className="font-semibold text-brand-500">{defaultStatus}</span></p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">

          {/* ── Basic Info ─────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Basic Info</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company *" error={errors.company?.message}>
                  <input
                    {...register('company', { required: 'Company name is required' })}
                    className={errors.company ? errorCls : normalCls}
                    placeholder="Google"
                    autoFocus
                  />
                </Field>
                <Field label="Role *" error={errors.role?.message}>
                  <input
                    {...register('role', { required: 'Role is required' })}
                    className={errors.role ? errorCls : normalCls}
                    placeholder="Senior QA Engineer"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Location / Work Model">
                  <input
                    {...register('location')}
                    className={normalCls}
                    placeholder="Remote / Hybrid / On-site"
                  />
                </Field>
                <Field label="Priority">
                  <select {...register('priority')} className={normalCls}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Job / LinkedIn URL">
                <input
                  {...register('url')}
                  type="url"
                  className={normalCls}
                  placeholder="https://linkedin.com/jobs/view/..."
                />
              </Field>
            </div>
          </section>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* ── Application Details ────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Application Details</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Resume Used">
                  <>
                    <input
                      {...register('resumeUsed')}
                      list="resume-suggestions"
                      className={normalCls}
                      placeholder="e.g. QA_Lead_Resume_v2"
                      autoComplete="off"
                    />
                    {resumeSuggestions.length > 0 && (
                      <datalist id="resume-suggestions">
                        {resumeSuggestions.map(r => <option key={r} value={r} />)}
                      </datalist>
                    )}
                  </>
                </Field>
                <Field label="Date Applied">
                  <input {...register('dateApplied')} type="date" className={normalCls} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Salary Range">
                  <input
                    {...register('salaryRange')}
                    className={normalCls}
                    placeholder="₹25-30 LPA or $150-180K"
                  />
                </Field>
                <Field label="Status">
                  <select {...register('status')} className={normalCls}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* ── Follow-up ──────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Follow-up</p>
            <div className="space-y-3">
              <Field label="Next Action / Deadline">
                <input
                  {...register('nextAction')}
                  className={normalCls}
                  placeholder="Follow up Mon, Code challenge due Thu…"
                />
              </Field>
              <Field label="Notes & Contacts">
                <textarea
                  {...register('notes')}
                  rows={3}
                  className={`${normalCls} resize-none`}
                  placeholder="Recruiter: Jane Doe (jane@co.com) · Referral from Alex · Interview feedback…"
                />
              </Field>
            </div>
          </section>

          {/* ── Actions ────────────────────────────────── */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
            >
              {initial ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
