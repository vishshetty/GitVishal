import { useState, useEffect } from 'react';
import { historyApi, planApi } from '../api';
import { FileDown, Trash2, Search, Clock, FileText } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    fetchHistory();
  };

  const downloadDocx = (id) => {
    window.open(planApi.downloadDocxUrl(id), '_blank');
  };

  const filtered = history.filter(h =>
    !search || h.project_key?.toLowerCase().includes(search.toLowerCase()) ||
    h.issues_used?.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCases = history.reduce((sum, h) => {
    try {
      const plan = typeof h.plan_json === 'string' ? JSON.parse(h.plan_json) : h.plan_json;
      return sum + (plan?.test_cases?.length || 0);
    } catch { return sum; }
  }, 0);

  if (loading) {
    return (
      <div className="page-container">
        <div className="history-header"><h2>History</h2></div>
        <div className="loading-shimmer" style={{ height: '60px', marginBottom: '0.75rem' }} />
        <div className="loading-shimmer" style={{ height: '60px', marginBottom: '0.75rem' }} />
        <div className="loading-shimmer" style={{ height: '60px' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="history-header">
        <h2>History</h2>
        {history.length > 0 && (
          <div className="history-stats">
            <div className="history-stat"><span>{history.length}</span> plans</div>
            <div className="history-stat"><span>{totalCases}</span> test cases</div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-search">
          <div className="history-search-wrapper">
            <Search size={16} className="history-search-icon" />
            <input
              type="text"
              placeholder="Search by project key or issue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {filtered.length === 0 && !search ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={32} />
          </div>
          <h3>No test plans yet</h3>
          <p>Generate your first test plan from the New Plan page. All plans will appear here for easy access.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={32} />
          </div>
          <h3>No results found</h3>
          <p>No test plans match "{search}". Try a different search term.</p>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map(h => (
            <div key={h.id} className="history-card">
              <div className="history-card-info">
                <h3>Test Plan: {h.project_key}</h3>
                <div className="history-card-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {new Date(h.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span>{h.issues_used?.length || 0} issues</span>
                  {h.issues_used?.length > 0 && (
                    <span style={{ opacity: 0.7 }}>{h.issues_used.slice(0, 4).join(', ')}{h.issues_used.length > 4 ? ` +${h.issues_used.length - 4}` : ''}</span>
                  )}
                </div>
              </div>
              <div className="history-card-actions">
                <button className="btn" onClick={() => downloadDocx(h.id)}>
                  <FileDown size={16} /> Download
                </button>
                <button className="btn btn-danger" onClick={() => deleteHist(h.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
