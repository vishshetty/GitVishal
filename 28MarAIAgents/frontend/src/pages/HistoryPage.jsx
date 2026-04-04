import { useState, useEffect } from 'react';
import { historyApi, planApi } from '../api';
import { useToast } from '../components/Toast';
import {
  FileDown, Trash2, Search, Clock, FileText, Eye, X, Check, Target
} from 'lucide-react';

export default function HistoryPage() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingPlan, setViewingPlan] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await historyApi.getAll();
      setHistory(res);
    } catch (e) { } finally { setLoading(false); }
  };

  const deleteHist = async (id) => {
    if (!confirm('Delete this test plan? This cannot be undone.')) return;
    await historyApi.delete(id);
    toast.info('Test plan deleted.');
    fetchHistory();
  };

  const downloadDocx = (id) => {
    window.open(planApi.downloadDocxUrl(id), '_blank');
  };

  const viewPlan = (h) => {
    const plan = typeof h.plan_json === 'string' ? JSON.parse(h.plan_json) : h.plan_json;
    setViewingPlan({ ...h, parsedPlan: plan });
  };

  const filtered = history.filter(h =>
    !search || h.project_key?.toLowerCase().includes(search.toLowerCase()) ||
    h.issues_used?.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  const getPlanTitle = (h) => {
    try {
      const plan = typeof h.plan_json === 'string' ? JSON.parse(h.plan_json) : h.plan_json;
      if (plan?.overview) {
        const words = plan.overview.split(' ').slice(0, 8).join(' ');
        return `Test Plan for ${h.project_key}`;
      }
    } catch { }
    return `Test Plan: ${h.project_key}`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="history-page-header">
          <div>
            <h1><FileText size={28} /> Test Plan History</h1>
            <p>View and manage all your generated test plans</p>
          </div>
        </div>
        <div className="loading-shimmer" style={{ height: '60px', marginBottom: '0.75rem' }} />
        <div className="loading-shimmer" style={{ height: '60px', marginBottom: '0.75rem' }} />
        <div className="loading-shimmer" style={{ height: '60px' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="history-page-header">
        <div>
          <h1><FileText size={28} /> Test Plan History</h1>
          <p>View and manage all your generated test plans</p>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-search">
          <div className="history-search-wrapper">
            <Search size={16} className="history-search-icon" />
            <input
              type="text"
              placeholder="Search by title, project, or sprint..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {filtered.length === 0 && !search ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={32} />
            </div>
            <h3>No test plans yet</h3>
            <p>Generate your first test plan from the New Plan page. All plans will appear here for easy access.</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={32} />
            </div>
            <h3>No results found</h3>
            <p>No test plans match "{search}". Try a different search term.</p>
          </div>
        </div>
      ) : (
        <div className="history-grid">
          {filtered.map(h => (
            <div key={h.id} className="history-card">
              <h3>{getPlanTitle(h)}</h3>
              <div className="history-project-badge">
                <Target size={11} /> {h.project_key}
              </div>
              <div className="history-card-meta">
                <span>
                  <Clock size={13} />
                  {new Date(h.created_at).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </span>
                <span>{h.issues_used?.length || 0} Jira issues</span>
              </div>
              <div className="history-card-actions">
                <button className="btn btn-primary" onClick={() => viewPlan(h)}>
                  <Eye size={14} /> View
                </button>
                <button className="btn btn-danger btn-icon" onClick={() => deleteHist(h.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Detail Modal */}
      {viewingPlan && (
        <div className="plan-detail-overlay" onClick={() => setViewingPlan(null)}>
          <div className="plan-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="plan-detail-header">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Test Plan: {viewingPlan.project_key}</h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {new Date(viewingPlan.created_at).toLocaleString()} · {viewingPlan.issues_used?.length || 0} issues
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={() => downloadDocx(viewingPlan.id)}>
                  <FileDown size={14} /> Download .DOCX
                </button>
                <button className="btn btn-icon" onClick={() => setViewingPlan(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="plan-detail-body">
              {viewingPlan.parsedPlan && (
                <div className="markdown-preview">
                  <h3>1. Overview</h3>
                  <p>{viewingPlan.parsedPlan.overview}</p>

                  <h3>2. Objectives</h3>
                  <ul>{viewingPlan.parsedPlan.objectives?.map((o, i) => <li key={i}>{o}</li>)}</ul>

                  <h3>3. Test Strategy & Scope</h3>
                  <p>{viewingPlan.parsedPlan.test_strategy}</p>
                  <p>{viewingPlan.parsedPlan.scope}</p>

                  <h3>4. Test Cases</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Jira Ref</th>
                          <th>Title</th>
                          <th>Priority</th>
                          <th>Steps</th>
                          <th>Expected Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingPlan.parsedPlan.test_cases?.map((tc, k) => (
                          <tr key={k}>
                            <td style={{ fontWeight: 600 }}>{tc.id}</td>
                            <td><span className="issue-badge">{tc.jira_ref}</span></td>
                            <td>{tc.title}</td>
                            <td>
                              <span className={`issue-badge ${(tc.priority || '').toLowerCase()}`}>{tc.priority}</span>
                            </td>
                            <td>
                              <ol style={{ margin: 0, paddingLeft: '1.2em' }}>
                                {tc.steps?.map((s, si) => <li key={si}>{s}</li>)}
                              </ol>
                            </td>
                            <td>{tc.expected_result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3>5. Risks & Mitigations</h3>
                  <ul>{viewingPlan.parsedPlan.risks?.map((o, i) => <li key={i}>{o}</li>)}</ul>

                  <h3>6. Estimated Timeline</h3>
                  <p>{viewingPlan.parsedPlan.timeline}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
