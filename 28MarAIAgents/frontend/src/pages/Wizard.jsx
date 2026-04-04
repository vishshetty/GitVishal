import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { llmApi, jiraApi, issuesApi, planApi } from '../api';
import { useToast } from '../components/Toast';
import PasswordInput from '../components/PasswordInput';
import {
  Check, ArrowRight, FileDown, Cpu, Globe, Ticket, ClipboardCheck, AlertCircle,
  Target, Settings, Plus, Bell, RotateCcw, Download, Eye
} from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Setup' },
  { num: 2, label: 'Fetch Issues' },
  { num: 3, label: 'Review' },
  { num: 4, label: 'Test Plan' },
];

export default function Wizard() {
  const toast = useToast();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([false, false, false, false]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Step 1 — Connections
  const [jiraConnections, setJiraConnections] = useState([]);
  const [showJiraForm, setShowJiraForm] = useState(false);
  const [jiraForm, setJiraForm] = useState({ name: '', host: '', email: '', token: '' });
  const [jiraHasToken, setJiraHasToken] = useState(false);

  // LLM State
  const [llmConnections, setLlmConnections] = useState([]);
  const [showLlmForm, setShowLlmForm] = useState(false);
  const [llmForm, setLlmForm] = useState({ provider: 'groq', urlKey: '', model: '' });
  const [llmTesting, setLlmTesting] = useState(false);
  const [llmReady, setLlmReady] = useState(false);
  const [llmProvider, setLlmProvider] = useState('groq');

  // Step 2 — Fetch
  const [fetchForm, setFetchForm] = useState({ productName: '', projectKey: '', sprint: '', context: '' });
  const [fetchedIssues, setFetchedIssues] = useState([]);

  // Step 3 — Review
  const [reviewContext, setReviewContext] = useState('');

  // Step 4 — Result
  const [planResult, setPlanResult] = useState(null);
  const [historyResultId, setHistoryResultId] = useState(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const [jiras, llms] = await Promise.all([jiraApi.getAll(), llmApi.getAll()]);
      setJiraConnections(jiras);
      setLlmConnections(llms);
      if (jiras.length > 0 && llms.length > 0) {
        setCompletedSteps(prev => { const n = [...prev]; n[0] = true; return n; });
      } else {
        setCompletedSteps(prev => { const n = [...prev]; n[0] = false; return n; });
      }
      if (llms.length > 0) {
        setLlmReady(true);
        setLlmProvider(llms[0].provider);
      }
    } catch (e) { }
  };

  const markComplete = (stepIndex) => {
    setCompletedSteps(prev => {
      const n = [...prev];
      n[stepIndex - 1] = true;
      return n;
    });
  };

  // --- Step 1: Save Jira Connection ---
  const handleJiraSubmit = async () => {
    setLoading(true); setMsg(null);
    try {
      const res = await jiraApi.test({ host: jiraForm.host, email: jiraForm.email, api_token: jiraForm.token });
      if (res.ok) {
        await jiraApi.save({
          connection_name: jiraForm.name || 'My Jira',
          host: jiraForm.host,
          email: jiraForm.email,
          api_token: jiraForm.token
        });
        toast.success('Jira connection verified and saved!');
        setShowJiraForm(false);
        setJiraForm({ name: '', host: '', email: '', token: '' });
        await loadConnections();
        markComplete(1);
      } else {
        setMsg({ type: 'error', text: res.message });
        toast.error('Jira connection failed. Check your credentials.');
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to connect to Jira. Check your credentials.' });
      toast.error('Network error connecting to Jira.');
    }
    setLoading(false);
  };

  // --- Step 1: Save LLM Connection ---
  const handleLlmSubmit = async () => {
    setLlmTesting(true); setMsg(null);
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
        toast.success(`LLM connection to ${llmForm.provider} verified and saved!`);
        setShowLlmForm(false);
        await loadConnections();
      } else {
        setMsg({ type: 'error', text: res.message });
        toast.error('LLM connection failed.');
      }
    } catch (e) {
      toast.error('Failed to connect to LLM.');
    }
    setLlmTesting(false);
  };

  const handleContinueToFetch = () => {
    if (jiraConnections.length === 0) {
      toast.error('Please add a Jira connection first.');
      return;
    }
    if (!llmReady) {
      toast.error('Please configure an LLM provider in Settings first.');
      return;
    }
    markComplete(1);
    setActiveStep(2);
  };

  // --- Step 2: Fetch Issues ---
  const handleFetchIssues = async () => {
    if (!fetchForm.projectKey.trim()) {
      toast.error('Please enter a Project Key.');
      return;
    }
    setLoading(true); setMsg(null);
    try {
      const jiras = await jiraApi.getAll();
      const cId = jiras.length > 0 ? jiras[jiras.length - 1].id : 1;

      const res = await issuesApi.fetch({
        connection_id: cId,
        project_key: fetchForm.projectKey,
        sprint_version: fetchForm.sprint || null
      });

      if (!res.ok || res.issues.length === 0) {
        setMsg({ type: 'error', text: res.message || 'No issues found for this project key.' });
        toast.error(res.message || 'No issues found.');
        setLoading(false);
        return;
      }

      setFetchedIssues(res.issues);
      setReviewContext(fetchForm.context);
      toast.success(`Fetched ${res.issues.length} issues from Jira!`);
      markComplete(2);
      setActiveStep(3);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error fetching issues.' });
      toast.error('Error fetching issues from Jira.');
    }
    setLoading(false);
  };

  // --- Step 3: Generate Test Plan ---
  const handleGeneratePlan = async () => {
    if (fetchedIssues.length === 0) {
      toast.error('No issues to generate a plan from. Go back and fetch issues first.');
      return;
    }
    setLoading(true); setMsg(null);
    try {
      const genRes = await planApi.generate({
        issues: fetchedIssues,
        llm_provider: llmProvider,
        additional_context: reviewContext || fetchForm.context,
        project_key: fetchForm.projectKey
      });

      if (genRes.ok) {
        setPlanResult(genRes.plan);
        setHistoryResultId(genRes.history_id);
        markComplete(3);
        markComplete(4);
        setActiveStep(4);
        toast.success('Test plan generated successfully!');
      } else {
        setMsg({ type: 'error', text: genRes.message });
        toast.error('Failed to generate test plan.');
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error generating test plan.' });
      toast.error('Error generating test plan.');
    }
    setLoading(false);
  };

  const handleRefreshIssues = async () => {
    setLoading(true);
    try {
      const jiras = await jiraApi.getAll();
      const cId = jiras.length > 0 ? jiras[jiras.length - 1].id : 1;
      const res = await issuesApi.fetch({
        connection_id: cId,
        project_key: fetchForm.projectKey,
        sprint_version: fetchForm.sprint || null
      });
      if (res.ok && res.issues.length > 0) {
        setFetchedIssues(res.issues);
        toast.success(`Refreshed: ${res.issues.length} issues`);
      }
    } catch (e) { toast.error('Error refreshing issues.'); }
    setLoading(false);
  };

  const downloadDocx = () => {
    if (historyResultId) {
      window.open(planApi.downloadDocxUrl(historyResultId), '_blank');
    }
  };

  const deleteJira = async (id) => {
    if (!confirm('Remove this Jira connection?')) return;
    await jiraApi.delete(id);
    await loadConnections();
    toast.info('Jira connection removed.');
  };

  return (
    <div className="page-container">
      {/* App Header */}
      <div className="app-header">
        <div className="app-header-left">
          <div className="app-header-icon">
            <Target size={28} />
          </div>
          <div>
            <h1>Intelligent Test Planning Agent</h1>
            <div className="app-header-sub">Generate comprehensive test plans from Jira requirements using AI</div>
          </div>
        </div>
        <div className="app-header-right">
          <button className="btn btn-outline" onClick={() => navigate('/history')}>
            <ClipboardCheck size={16} /> View History
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((step, i) => (
          <button
            key={step.num}
            className={`stepper-tab ${activeStep === step.num ? 'active' : ''} ${completedSteps[i] && activeStep !== step.num ? 'completed' : ''}`}
            onClick={() => setActiveStep(step.num)}
          >
            {completedSteps[i] && activeStep !== step.num && (
              <span className="stepper-check"><Check size={11} /></span>
            )}
            {step.num}. {step.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`alert alert-${msg.type}`}>
          {msg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {msg.text}
        </div>
      )}

      {/* ============ Step 1: Setup ============ */}
      {activeStep === 1 && (
        <div className="animate-in">
          {/* LLM Connection Section */}
          <div className="section-card">
            <div className="section-card-header">
              <h2>LLM Connection</h2>
              <p>Configure the AI model used for generating test plans</p>
            </div>

            {llmConnections.length > 0 && !showLlmForm && (
              <div className="connection-card-inline">
                <div className="connection-info-bar">
                  <div className="connection-dot" />
                  <div>
                    <div className="connection-name-text">{llmConnections[0].provider.toUpperCase()}</div>
                    <div className="connection-detail-text">Model: {llmConnections[0].model}</div>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => {
                  const c = llmConnections[0];
                  setLlmForm({ provider: c.provider, urlKey: c.provider === 'ollama' ? (c.base_url || 'http://localhost:11434') : '', model: c.model });
                  setShowLlmForm(true);
                }}>Edit</button>
              </div>
            )}

            {(!llmConnections.length || showLlmForm) ? (
              <div className="jira-form-container" style={{ marginTop: llmConnections.length ? '1rem' : 0 }}>
                {llmConnections.length > 0 && (
                  <>
                    <button className="btn" onClick={() => setShowLlmForm(false)} style={{ marginBottom: '1rem' }}>
                      <Settings size={14} /> Cancel
                    </button>
                    <div className="section-divider" />
                  </>
                )}

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
                        placeholder="API Key..."
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
                <button className="btn btn-primary" onClick={handleLlmSubmit} disabled={llmTesting}>
                  {llmTesting ? <><span className="spinner" /> Testing...</> : 'Save Connection'}
                </button>
              </div>
            ) : null}
          </div>

          {/* Jira Connection Section */}
          <div className="section-card">
            <div className="section-card-header">
              <h2>Jira Connection</h2>
              <p>Connect to your Jira instance to fetch requirements</p>
            </div>

            {/* Existing connections */}
            {jiraConnections.map(c => (
              <div key={c.id} className="connection-card-inline">
                <div className="connection-info-bar">
                  <div className="connection-dot" />
                  <div>
                    <div className="connection-name-text">{c.connection_name}</div>
                    <div className="connection-detail-text">{c.host} · {c.email}</div>
                  </div>
                </div>
                <button className="btn btn-danger btn-icon" onClick={() => deleteJira(c.id)} title="Remove">
                  <Settings size={14} />
                </button>
              </div>
            ))}

            {/* Add New / Cancel */}
            {!showJiraForm ? (
              <button className="btn" onClick={() => setShowJiraForm(true)} style={{ marginTop: jiraConnections.length > 0 ? '0.75rem' : 0 }}>
                <Plus size={16} /> Add New Connection
              </button>
            ) : (
              <div className="jira-form-container" style={{ marginTop: '1rem' }}>
                <button className="btn" onClick={() => setShowJiraForm(false)} style={{ marginBottom: '1rem' }}>
                  <Settings size={14} /> Cancel
                </button>
                <div className="section-divider" />

                <div className="form-group">
                  <label>Connection Name</label>
                  <input type="text" className="form-control" value={jiraForm.name}
                    onChange={e => setJiraForm({ ...jiraForm, name: e.target.value })}
                    placeholder="e.g., VWO Production" />
                </div>
                <div className="form-group">
                  <label>Jira URL</label>
                  <input type="text" className="form-control" value={jiraForm.host}
                    onChange={e => setJiraForm({ ...jiraForm, host: e.target.value })}
                    placeholder="https://yourcompany.atlassian.net" />
                </div>
                <div className="form-group">
                  <label>Jira Email</label>
                  <input type="email" className="form-control" value={jiraForm.email}
                    onChange={e => setJiraForm({ ...jiraForm, email: e.target.value })}
                    placeholder="your-email@company.com" />
                </div>
                <div className="form-group">
                  <label>API Token</label>
                  <PasswordInput
                    value={jiraForm.token}
                    onChange={e => setJiraForm({ ...jiraForm, token: e.target.value })}
                    placeholder="Your Jira API token"
                    savedHint={jiraHasToken}
                  />
                  <div className="form-hint">Generate at: https://id.atlassian.com/manage-profile/security/api-tokens</div>
                </div>
                <button className="btn btn-primary" onClick={handleJiraSubmit} disabled={loading}>
                  {loading ? <><span className="spinner" /> Testing...</> : 'Save Connection'}
                </button>
              </div>
            )}

            <div className="section-divider" />

            <button className="btn btn-primary-full" onClick={handleContinueToFetch} disabled={jiraConnections.length === 0}>
              Continue to Fetch Issues <ArrowRight size={16} />
            </button>
          </div>

          {/* Integration Tools Section */}
          <div className="section-card">
            <div className="integrations-header">
              <h2>Import from Test Management Tools</h2>
              <p>Connect to your existing test case repositories and management platforms</p>
            </div>
            <div className="integrations-grid">
              {/* Jira Card */}
              <div className="integration-card available">
                <div className="integration-card-top">
                  <div className="integration-icon jira"><Target size={20} /></div>
                  <div>
                    <div className="integration-name">Jira</div>
                    <span className="integration-badge available">Available</span>
                  </div>
                </div>
                <div className="integration-desc">Import requirements and user stories from Atlassian Jira</div>
                <div className="integration-features">
                  <strong>Key Features:</strong>
                  <ul>
                    <li>Requirements import</li>
                    <li>User stories</li>
                    <li>Acceptance criteria</li>
                  </ul>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowJiraForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Connect
                </button>
              </div>

              {/* TestRail Card */}
              <div className="integration-card">
                <div className="integration-card-top">
                  <div className="integration-icon testrail"><ClipboardCheck size={20} /></div>
                  <div>
                    <div className="integration-name">TestRail</div>
                    <span className="integration-badge coming-soon">Coming Soon</span>
                  </div>
                </div>
                <div className="integration-desc">Import existing test cases and test suites from TestRail</div>
                <div className="integration-features">
                  <strong>Key Features:</strong>
                  <ul>
                    <li>Test cases</li>
                    <li>Test suites</li>
                    <li>Test runs</li>
                  </ul>
                </div>
                <button className="btn" disabled style={{ opacity: 0.7 }}>
                  <Bell size={14} /> Notify Me
                </button>
              </div>

              {/* Zephyr Card */}
              <div className="integration-card">
                <div className="integration-card-top">
                  <div className="integration-icon zephyr"><Cpu size={20} /></div>
                  <div>
                    <div className="integration-name">Zephyr</div>
                    <span className="integration-badge coming-soon">Coming Soon</span>
                  </div>
                </div>
                <div className="integration-desc">Sync test cases from Zephyr Scale or Zephyr Squad</div>
                <div className="integration-features">
                  <strong>Key Features:</strong>
                  <ul>
                    <li>Test cases</li>
                    <li>Test cycles</li>
                    <li>Test execution</li>
                  </ul>
                </div>
                <button className="btn" disabled style={{ opacity: 0.7 }}>
                  <Bell size={14} /> Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Step 2: Fetch Issues ============ */}
      {activeStep === 2 && (
        <div className="animate-in">
          <div className="section-card">
            <div className="section-card-header">
              <h2>Fetch Jira Requirements</h2>
              <p>Enter project details to fetch user stories and requirements</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" className="form-control" value={fetchForm.productName}
                  onChange={e => setFetchForm({ ...fetchForm, productName: e.target.value })}
                  placeholder="e.g., App.vwo.com" />
              </div>
              <div className="form-group">
                <label>Project Key <span className="required">*</span></label>
                <input type="text" className="form-control" value={fetchForm.projectKey}
                  onChange={e => setFetchForm({ ...fetchForm, projectKey: e.target.value })}
                  placeholder="e.g., VWOAPP" />
              </div>
            </div>

            <div className="form-group">
              <label>Sprint/Fix Version (Optional)</label>
              <input type="text" className="form-control" value={fetchForm.sprint}
                onChange={e => setFetchForm({ ...fetchForm, sprint: e.target.value })}
                placeholder="e.g., Sprint 15 or leave empty for all open issues" />
            </div>

            <div className="form-group">
              <label>Additional Context (Optional)</label>
              <textarea rows="4" className="form-control" value={fetchForm.context}
                onChange={e => setFetchForm({ ...fetchForm, context: e.target.value })}
                placeholder="Any additional information about the product, testing goals, or constraints..." />
            </div>

            <button className="btn btn-primary-full" onClick={handleFetchIssues} disabled={loading || !fetchForm.projectKey.trim()}>
              {loading ? <><span className="spinner" /> Fetching Issues...</> : <><Download size={16} /> Fetch Jira Issues</>}
            </button>
          </div>
        </div>
      )}

      {/* ============ Step 3: Review ============ */}
      {activeStep === 3 && (
        <div className="animate-in">
          {/* Connection Info Bar */}
          <div className="section-card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="connection-dot" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fetchForm.projectKey || 'None'}</span>
              </div>
              <button className="btn btn-ghost" onClick={handleRefreshIssues} disabled={loading} style={{ fontSize: '0.82rem' }}>
                <RotateCcw size={14} /> Refresh Issues
              </button>
            </div>
          </div>

          {/* Additional Context */}
          <div className="section-card">
            <div className="section-card-header">
              <h2>Additional Context & Notes</h2>
              <p>Add any additional context, special requirements, or constraints</p>
            </div>
            <textarea rows="4" className="form-control" value={reviewContext}
              onChange={e => setReviewContext(e.target.value)}
              placeholder="Add any additional context about the testing approach, special requirements, constraints, team structure, or specific areas of focus..." />
          </div>

          {/* Review Issues */}
          <div className="section-card">
            <div className="issues-summary-bar">
              <div>
                <h3>Review Jira Issues ({fetchedIssues.length})</h3>
                <p>Issues that will be used to generate the test plan</p>
              </div>
            </div>

            {fetchedIssues.length > 0 ? (
              <div className="issues-list">
                {fetchedIssues.map((issue, i) => (
                  <div key={i} className="issue-row">
                    <span className="issue-key">{issue.key}</span>
                    <span className="issue-summary">{issue.summary}</span>
                    <span className={`issue-badge ${(issue.priority || '').toLowerCase()}`}>
                      {issue.issue_type || issue.priority || 'Story'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <p>No issues fetched yet. Go back to Step 2 to fetch issues.</p>
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary-full" onClick={handleGeneratePlan} disabled={loading || fetchedIssues.length === 0}>
                {loading ? <><span className="spinner" /> Generating Test Plan...</> : <><Target size={16} /> Generate Test Plan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Step 4: Test Plan ============ */}
      {activeStep === 4 && (
        <div className="animate-in">
          <div className="section-card">
            {planResult ? (
              <>
                <div className="plan-header">
                  <div>
                    <h3>Test Plan Generated</h3>
                    <div className="plan-header-sub">{fetchedIssues.length} issues analyzed · {planResult.test_cases?.length || 0} test cases</div>
                  </div>
                  <div className="plan-actions">
                    <button className="btn btn-primary" onClick={downloadDocx}>
                      <FileDown size={16} /> Export .DOCX
                    </button>
                  </div>
                </div>

                <div className="markdown-preview">
                  <h3>1. Overview</h3>
                  <p>{planResult.overview}</p>

                  <h3>2. Objectives</h3>
                  <ul>{planResult.objectives?.map((o, i) => <li key={i}>{o}</li>)}</ul>

                  <h3>3. Test Strategy & Scope</h3>
                  <p>{planResult.test_strategy}</p>
                  <p>{planResult.scope}</p>

                  <h3>4. Entry & Exit Criteria</h3>
                  <p><strong>Entry Criteria:</strong></p>
                  <ul>{planResult.entry_criteria?.map((o, i) => <li key={i}>{o}</li>)}</ul>
                  <p><strong>Exit Criteria:</strong></p>
                  <ul>{planResult.exit_criteria?.map((o, i) => <li key={i}>{o}</li>)}</ul>

                  <h3>5. Test Cases</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Jira Ref</th>
                          <th>Title</th>
                          <th>Priority</th>
                          <th>Preconditions</th>
                          <th>Steps</th>
                          <th>Expected Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planResult.test_cases?.map((tc, k) => (
                          <tr key={k}>
                            <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{tc.id}</td>
                            <td><span className="issue-badge">{tc.jira_ref}</span></td>
                            <td>{tc.title}</td>
                            <td>
                              <span className={`issue-badge ${(tc.priority || '').toLowerCase()}`}>
                                {tc.priority}
                              </span>
                            </td>
                            <td>{tc.preconditions}</td>
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

                  <h3>6. Risks & Mitigations</h3>
                  <ul>{planResult.risks?.map((o, i) => <li key={i}>{o}</li>)}</ul>

                  <h3>7. Estimated Timeline</h3>
                  <p>{planResult.timeline}</p>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ClipboardCheck size={32} />
                </div>
                <h3>No test plan generated yet</h3>
                <p>Complete the previous steps to generate your test plan</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
