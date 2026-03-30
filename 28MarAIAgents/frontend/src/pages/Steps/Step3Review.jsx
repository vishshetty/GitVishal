import { useState } from 'react';
import { planApi } from '../../api';
import { CheckCircle2 } from 'lucide-react';

export default function Step3Review({ onNext, issues, params, llmProvider }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const res = await planApi.generate({
        issues,
        llm_provider: llmProvider,
        additional_context: params.context,
        project_key: params.project_key
      });
      if (res.ok) {
        onNext(res.plan, res.history_id);
      } else setError(res.message);
    } catch(e) {
       setError(e.response?.data?.detail || "Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
         <h2 className="card-title">Review Jira Issues ({issues.length})</h2>
         <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>These items will be used by the AI to author the test plan.</p>
         
         {error && <div className="alert alert-error">{error}</div>}

         <div className="issues-list" style={{maxHeight:'300px', overflowY:'auto', margin:'1rem 0'}}>
            {issues.length === 0 ? <p>No issues found matching criteria.</p> : issues.map(i => (
              <div key={i.key} className="issue-row">
                 <div className="issue-key">{i.key}</div>
                 <div className="issue-summary">{i.summary}</div>
                 <div className="issue-badge">{i.issue_type}</div>
              </div>
            ))}
         </div>
      </div>

      <button className="btn btn-primary" style={{width:'100%', padding:'1rem'}} onClick={generate} disabled={loading || issues.length === 0}>
        <CheckCircle2 style={{marginRight: '0.5rem'}} />
        {loading ? 'AI is drafting Test Plan...' : 'Generate Test Plan ✨'}
      </button>
    </div>
  );
}
