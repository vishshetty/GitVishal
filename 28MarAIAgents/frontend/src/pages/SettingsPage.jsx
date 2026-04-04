import { useState, useEffect } from 'react';
import { llmApi, jiraApi } from '../api';
import { useToast } from '../components/Toast';
import { Cpu, Globe, Trash2, Plus, Check, AlertCircle } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function SettingsPage() {
  const toast = useToast();
  const [llmConnections, setLlmConnections] = useState([]);
  const [jiraConnections, setJiraConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // LLM form
  const [showLlmForm, setShowLlmForm] = useState(false);
  const [llmForm, setLlmForm] = useState({ provider: 'ollama', urlKey: 'http://localhost:11434', model: 'llama3' });
  const [llmTesting, setLlmTesting] = useState(false);

  // Jira form
  const [showJiraForm, setShowJiraForm] = useState(false);
  const [jiraForm, setJiraForm] = useState({ name: '', host: '', email: '', token: '' });
  const [jiraTesting, setJiraTesting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [llms, jiras] = await Promise.all([llmApi.getAll(), jiraApi.getAll()]);
      setLlmConnections(llms);
      setJiraConnections(jiras);
    } catch (e) { }
    setLoading(false);
  };

  const handleSaveLlm = async () => {
    setLlmTesting(true);
    try {
      const payload = {
        provider: llmForm.provider,
        model: llmForm.model,
        api_key: llmForm.provider === 'ollama' ? '' : llmForm.urlKey,
        base_url: llmForm.provider === 'ollama' ? llmForm.urlKey : ''
      };
      const res = await llmApi.test(payload);
      if (res.ok) {
        await llmApi.save(payload);
        toast.success('LLM connection saved!');
        setShowLlmForm(false);
        loadAll();
      } else {
        toast.error(res.message || 'LLM connection failed.');
      }
    } catch (e) { toast.error('Failed to connect to LLM.'); }
    setLlmTesting(false);
  };

  const handleSaveJira = async () => {
    setJiraTesting(true);
    try {
      const res = await jiraApi.test({ host: jiraForm.host, email: jiraForm.email, api_token: jiraForm.token });
      if (res.ok) {
        await jiraApi.save({ connection_name: jiraForm.name, host: jiraForm.host, email: jiraForm.email, api_token: jiraForm.token });
        toast.success('Jira connection saved!');
        setShowJiraForm(false);
        setJiraForm({ name: '', host: '', email: '', token: '' });
        loadAll();
      } else {
        toast.error(res.message || 'Jira connection failed.');
      }
    } catch (e) { toast.error('Failed to connect to Jira.'); }
    setJiraTesting(false);
  };

  const deleteJira = async (id) => {
    if (!confirm('Remove this Jira connection?')) return;
    await jiraApi.delete(id);
    toast.info('Jira connection removed.');
    loadAll();
  };

  return (
    <div className="page-container">
      <div className="app-header" style={{ marginBottom: '2rem' }}>
        <div className="app-header-left">
          <div className="app-header-icon" style={{ background: 'linear-gradient(135deg, #e0e7ff, #f3e8ff)' }}>
            <Cpu size={28} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <h1>Settings</h1>
            <div className="app-header-sub">Manage your LLM and Jira connections</div>
          </div>
        </div>
      </div>

      {/* LLM Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon"><Cpu size={18} /></div>
          <div>
            <div className="settings-section-title">LLM Provider</div>
            <div className="settings-section-desc">AI model used for generating test plans</div>
          </div>
        </div>

        {llmConnections.length > 0 && !showLlmForm ? (
          <>
            {llmConnections.map(c => (
              <div key={c.id} className="connection-card">
                <div className="connection-info">
                  <div className="connection-status" />
                  <div>
                    <div className="connection-name">{c.provider.toUpperCase()}</div>
                    <div className="connection-detail">Model: {c.model}</div>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => {
                  setLlmForm({ provider: c.provider, urlKey: c.provider === 'ollama' ? (c.base_url || 'http://localhost:11434') : '', model: c.model });
                  setShowLlmForm(true);
                }}>Edit</button>
              </div>
            ))}
          </>
        ) : (
          <>
            {!showLlmForm && (
              <button className="btn" onClick={() => setShowLlmForm(true)} style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={16} /> Add LLM Connection
              </button>
            )}
          </>
        )}

        {showLlmForm && (
          <div style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Provider</label>
              <select className="form-control" value={llmForm.provider} onChange={e => {
                const p = e.target.value;
                let model = p === 'ollama' ? 'gemma3:1b' : p === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-1.5-pro';
                let urlKey = p === 'ollama' ? 'http://localhost:11434' : '';
                setLlmForm({ provider: p, model, urlKey });
              }}>
                <option value="groq">Groq.com (Cloud - llama 4, gemma, gpt-120b equivalents)</option>
                <option value="gemini">Gemini API (Free)</option>
                <option value="ollama">Ollama Local (gemma3:1b)</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>{llmForm.provider === 'ollama' ? 'Base URL' : 'API Key'}</label>
                {llmForm.provider === 'ollama' ? (
                  <input type="text" className="form-control"
                    value={llmForm.urlKey} onChange={e => setLlmForm({ ...llmForm, urlKey: e.target.value })}
                    placeholder="http://localhost:11434" />
                ) : (
                  <PasswordInput
                    value={llmForm.urlKey}
                    onChange={e => setLlmForm({ ...llmForm, urlKey: e.target.value })}
                    placeholder="sk-..."
                    savedHint={llmConnections.some(c => c.provider === llmForm.provider && c.has_key)}
                  />
                )}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Model</label>
                <input type="text" className="form-control" value={llmForm.model}
                  onChange={e => setLlmForm({ ...llmForm, model: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowLlmForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveLlm} disabled={llmTesting}>
                {llmTesting ? <><span className="spinner" /> Testing...</> : 'Test & Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jira Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Globe size={18} />
          </div>
          <div>
            <div className="settings-section-title">Jira Connections</div>
            <div className="settings-section-desc">Atlassian workspaces for fetching user stories</div>
          </div>
        </div>

        {jiraConnections.map(c => (
          <div key={c.id} className="connection-card">
            <div className="connection-info">
              <div className="connection-status" />
              <div>
                <div className="connection-name">{c.connection_name}</div>
                <div className="connection-detail">{c.host} · {c.email}</div>
              </div>
            </div>
            <button className="btn btn-danger btn-icon" onClick={() => deleteJira(c.id)} title="Remove">
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {!showJiraForm ? (
          <button className="btn" onClick={() => setShowJiraForm(true)} style={{ width: '100%', justifyContent: 'center', marginTop: jiraConnections.length > 0 ? '0.75rem' : 0 }}>
            <Plus size={16} /> Add Jira Connection
          </button>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Connection Name</label>
                <input type="text" className="form-control" value={jiraForm.name}
                  onChange={e => setJiraForm({ ...jiraForm, name: e.target.value })}
                  placeholder="My Workspace" />
              </div>
              <div className="form-group">
                <label>Host URL</label>
                <input type="text" className="form-control" value={jiraForm.host}
                  onChange={e => setJiraForm({ ...jiraForm, host: e.target.value })}
                  placeholder="company.atlassian.net" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={jiraForm.email}
                  onChange={e => setJiraForm({ ...jiraForm, email: e.target.value })}
                  placeholder="you@company.com" />
              </div>
              <div className="form-group">
                <label>API Token</label>
                <PasswordInput
                  value={jiraForm.token}
                  onChange={e => setJiraForm({ ...jiraForm, token: e.target.value })}
                  placeholder="Atlassian API token"
                  savedHint={false}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowJiraForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveJira} disabled={jiraTesting}>
                {jiraTesting ? <><span className="spinner" /> Testing...</> : 'Test & Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
