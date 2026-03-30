import { useState } from 'react';
import { issuesApi } from '../../api';

export default function Step2Fetch({ onNext, selectedJira }) {
  const [form, setForm] = useState({ project_key: 'KAN', sprint_version: '', context: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = async () => {
    if (!form.project_key) return;
    setLoading(true); setError(null);
    try {
      const res = await issuesApi.fetch({
        connection_id: selectedJira,
        project_key: form.project_key,
        sprint_version: form.sprint_version || null
      });
      if (res.ok) {
        onNext(form, res.issues);
      } else setError(res.message);
    } catch(e) {
      setError(e.response?.data?.detail || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Fetch Jira Requirements</h2>
      <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>
        Enter project details to fetch user stories and requirements for testing.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{display:'flex', gap:'1rem'}}>
        <div className="form-group" style={{flex:1}}>
            <label>Product Name (Optional)</label>
            <input type="text" className="form-control" placeholder="e.g. My App" />
        </div>
        <div className="form-group" style={{flex:1}}>
            <label>Project Key *</label>
            <input type="text" className="form-control" placeholder="e.g. KAN" value={form.project_key} onChange={e=>setForm({...form, project_key: e.target.value})} />
        </div>
      </div>

      <div className="form-group">
        <label>Sprint / Fix Version (Optional)</label>
        <input type="text" className="form-control" placeholder="e.g. Sprint 15" value={form.sprint_version} onChange={e=>setForm({...form, sprint_version: e.target.value})} />
      </div>

      <div className="form-group">
        <label>Additional Context (Optional)</label>
        <textarea rows="4" className="form-control" placeholder="Any special goals, constraints..." value={form.context} onChange={e=>setForm({...form, context: e.target.value})}></textarea>
      </div>

      <button className="btn btn-primary" style={{width:'100%', padding:'1rem', marginTop:'1rem'}} onClick={fetchIssues} disabled={loading || !form.project_key}>
        {loading ? 'Fetching...' : 'Fetch Jira Issues ↓'}
      </button>

    </div>
  );
}
