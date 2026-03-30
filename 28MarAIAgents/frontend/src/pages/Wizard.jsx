import { useState, useEffect } from 'react';
import { llmApi, jiraApi, issuesApi, planApi } from '../api';
import { Check, ArrowRight, FileDown, Cpu, Globe, Ticket, ClipboardCheck, AlertCircle } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

const STEPS = [
  { num: 1, label: 'LLM Setup', icon: Cpu },
  { num: 2, label: 'Jira', icon: Globe },
  { num: 3, label: 'Tickets', icon: Ticket },
  { num: 4, label: 'Result', icon: ClipboardCheck },
];

export default function Wizard() {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([false, false, false, false]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [llmForm, setLlmForm] = useState({ provider: 'ollama', urlKey: 'http://localhost:11434', model: 'llama3' });
  const [llmHasKey, setLlmHasKey] = useState(false);
  const [jiraForm, setJiraForm] = useState({ name: 'My Jira', host: '', email: '', token: '' });
  const [jiraHasToken, setJiraHasToken] = useState(false);
  const [ticketForm, setTicketForm] = useState({ projectKey: '', sprint: '', context: '' });
  const [fetchedIssues, setFetchedIssues] = useState([]);
  const [planResult, setPlanResult] = useState(null);
  const [historyResultId, setHistoryResultId] = useState(null);

  useEffect(() => {
    llmApi.getAll().then(res => {
      if (res.length > 0) {
        const c = res[0];
        setLlmForm({ provider: c.provider, urlKey: c.provider === 'ollama' ? (c.base_url || 'http://localhost:11434') : '', model: c.model });
        setLlmHasKey(!!c.has_key);
        setCompletedSteps(prev => { const n = [...prev]; n[0] = true; return n; });
      }
    }).catch(() => {});

    jiraApi.getAll().then(res => {
      if (res.length > 0) {
        setJiraForm({ name: res[0].connection_name, host: res[0].host, email: res[0].email, token: '' });
        setJiraHasToken(!!res[0].has_token);
        setCompletedSteps(prev => { const n = [...prev]; n[1] = true; return n; });
      }
    }).catch(() => {});
  }, []);

  const markComplete = (stepIndex) => {
    setCompletedSteps(prev => {
      const n = [...prev];
      n[stepIndex - 1] = true;
      return n;
    });
  };

  const handleLlmSubmit = async () => {
    setLoading(true); setMsg(null);
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
        setMsg({ type: 'success', text: 'LLM connection verified and saved!' });
        markComplete(1);
        setTimeout(() => { setActiveStep(2); setMsg(null); }, 1200);
      } else {
        setMsg({ type: 'error', text: res.message });
      }
    } catch (e) { setMsg({ type: 'error', text: 'Failed to connect to LLM. Check your configuration.' }); }
    setLoading(false);
  };

  const handleJiraSubmit = async () => {
    setLoading(true); setMsg(null);
    try {
      const res = await jiraApi.test({ host: jiraForm.host, email: jiraForm.email, api_token: jiraForm.token });
      if (res.ok) {
        await jiraApi.save({ connection_name: jiraForm.name, host: jiraForm.host, email: jiraForm.email, api_token: jiraForm.token });
        setMsg({ type: 'success', text: 'Jira connection verified and saved!' });
        markComplete(2);
        setTimeout(() => { setActiveStep(3); setMsg(null); }, 1200);
      } else {
        setMsg({ type: 'error', text: res.message });
      }
    } catch (e) { setMsg({ type: 'error', text: 'Failed to connect to Jira. Check your credentials.' }); }
    setLoading(false);
  };

  const handleTicketSubmit = async () => {
    setLoading(true); setMsg(null);
    try {
      const jiras = await jiraApi.getAll();
      const cId = jiras.length > 0 ? jiras[jiras.length - 1].id : 1;

      const res = await issuesApi.fetch({
        connection_id: cId,
        project_key: ticketForm.projectKey,
        sprint_version: ticketForm.sprint || null
      });

      if (!res.ok || res.issues.length === 0) {
        setMsg({ type: 'error', text: res.message || 'No issues found for this project key.' });
        setLoading(false);
        return;
      }

      setFetchedIssues(res.issues);
      setMsg({ type: 'success', text: `Fetched ${res.issues.length} issues. Generating test plan...` });

      const genRes = await planApi.generate({
        issues: res.issues,
        llm_provider: llmForm.provider,
        additional_context: ticketForm.context,
        project_key: ticketForm.projectKey
      });

      if (genRes.ok) {
        setPlanResult(genRes.plan);
        setHistoryResultId(genRes.history_id);
        markComplete(3);
        markComplete(4);
        setActiveStep(4);
        setMsg(null);
      } else {
        setMsg({ type: 'error', text: genRes.message });
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error generating test plan. Please try again.' });
    }
    setLoading(false);
  };

  const downloadDocx = () => {
    if (historyResultId) {
      window.open(planApi.downloadDocxUrl(historyResultId), '_blank');
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Test Planner</h1>
        <p>Connect your tools, fetch issues, and generate comprehensive test plans</p>
      </div>

      {/* Progress Bar */}
      <div className="wizard-progress">
        {STEPS.map((step, i) => (
          <div className="wizard-progress-step" key={step.num}>
            <div
              className={`progress-dot ${activeStep === step.num ? 'active' : ''} ${completedSteps[i] ? 'completed' : ''}`}
              onClick={() => setActiveStep(step.num)}
            >
              {completedSteps[i] && activeStep !== step.num ? <Check size={16} /> : step.num}
              <span className="progress-label">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`progress-line ${completedSteps[i] ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {msg && (
        <div className={`alert alert-${msg.type}`}>
          {msg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {msg.text}
        </div>
      )}

      {/* Step 1: LLM Connection */}
      <div className={`wizard-step ${activeStep === 1 ? 'active' : 'collapsed'} ${completedSteps[0] ? 'completed' : ''}`}>
        <div className="wizard-step-header" onClick={() => setActiveStep(1)}>
          <div className="step-circle">{completedSteps[0] && activeStep !== 1 ? <Check size={16} /> : <Cpu size={16} />}</div>
          <div style={{ flex: 1 }}>
            <div className="step-title">LLM Connection</div>
            <div className="step-subtitle">Configure your AI provider for test plan generation</div>
          </div>
          {completedSteps[0] && <span className="step-badge">Connected</span>}
        </div>
        {activeStep === 1 && (
          <div className="wizard-step-content">
            <div className="form-group">
              <label>Provider</label>
              <select className="form-control" value={llmForm.provider} onChange={e => {
                const p = e.target.value;
                let defaultModel = '';
                if (p === 'ollama') defaultModel = 'llama3';
                if (p === 'groq') defaultModel = 'llama-3.3-70b-versatile';
                if (p === 'grok') defaultModel = 'grok-beta';
                const newUrlKey = p === 'ollama' ? 'http://localhost:11434' : (llmForm.provider === 'ollama' ? '' : llmForm.urlKey);
                setLlmForm({ ...llmForm, provider: p, model: defaultModel, urlKey: newUrlKey });
              }}>
                <option value="ollama">Ollama (Local / Private)</option>
                <option value="groq">Groq (Cloud - Fast)</option>
                <option value="grok">Grok (xAI)</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>{llmForm.provider === 'ollama' ? 'Base URL' : 'API Key'}</label>
                {llmForm.provider === 'ollama' ? (
                  <input
                    type="text"
                    className="form-control"
                    value={llmForm.urlKey}
                    onChange={e => setLlmForm({ ...llmForm, urlKey: e.target.value })}
                    placeholder="http://localhost:11434"
                  />
                ) : (
                  <PasswordInput
                    value={llmForm.urlKey}
                    onChange={e => setLlmForm({ ...llmForm, urlKey: e.target.value })}
                    placeholder="sk-..."
                    savedHint={llmHasKey}
                  />
                )}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Model</label>
                <input type="text" className="form-control" value={llmForm.model}
                  onChange={e => setLlmForm({ ...llmForm, model: e.target.value })}
                  placeholder="llama3" />
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" style={{ borderRadius: '999px', padding: '0.75rem 2.5rem' }}
                onClick={handleLlmSubmit} disabled={loading}>
                {loading ? <><span className="spinner" /> Testing...</> : <>Test & Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Jira Connection */}
      <div className={`wizard-step ${activeStep === 2 ? 'active' : 'collapsed'} ${completedSteps[1] ? 'completed' : ''}`}>
        <div className="wizard-step-header" onClick={() => setActiveStep(2)}>
          <div className="step-circle">{completedSteps[1] && activeStep !== 2 ? <Check size={16} /> : <Globe size={16} />}</div>
          <div style={{ flex: 1 }}>
            <div className="step-title">Jira Connection</div>
            <div className="step-subtitle">Link your Atlassian workspace to fetch user stories</div>
          </div>
          {completedSteps[1] && <span className="step-badge">Connected</span>}
        </div>
        {activeStep === 2 && (
          <div className="wizard-step-content">
            <div className="form-row">
              <div className="form-group">
                <label>Host URL</label>
                <input type="text" className="form-control" value={jiraForm.host}
                  onChange={e => setJiraForm({ ...jiraForm, host: e.target.value })}
                  placeholder="yourcompany.atlassian.net" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={jiraForm.email}
                  onChange={e => setJiraForm({ ...jiraForm, email: e.target.value })}
                  placeholder="you@company.com" />
              </div>
            </div>
            <div className="form-group">
              <label>API Token</label>
              <PasswordInput
                value={jiraForm.token}
                onChange={e => setJiraForm({ ...jiraForm, token: e.target.value })}
                placeholder="Atlassian API Token from security settings"
                savedHint={jiraHasToken}
              />
              <div className="form-hint">Generate at id.atlassian.com &gt; Security &gt; API tokens</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" style={{ borderRadius: '999px', padding: '0.75rem 2.5rem' }}
                onClick={handleJiraSubmit} disabled={loading}>
                {loading ? <><span className="spinner" /> Testing...</> : <>Test & Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Ticket Information */}
      <div className={`wizard-step ${activeStep === 3 ? 'active' : 'collapsed'} ${completedSteps[2] ? 'completed' : ''}`}>
        <div className="wizard-step-header" onClick={() => setActiveStep(3)}>
          <div className="step-circle">{completedSteps[2] && activeStep !== 3 ? <Check size={16} /> : <Ticket size={16} />}</div>
          <div style={{ flex: 1 }}>
            <div className="step-title">Ticket Information</div>
            <div className="step-subtitle">Specify which issues to include in the test plan</div>
          </div>
          {completedSteps[2] && <span className="step-badge">{fetchedIssues.length} issues</span>}
        </div>
        {activeStep === 3 && (
          <div className="wizard-step-content">
            <div className="form-row">
              <div className="form-group">
                <label>Jira Project Key or Ticket ID</label>
                <input type="text" className="form-control" value={ticketForm.projectKey}
                  onChange={e => setTicketForm({ ...ticketForm, projectKey: e.target.value })}
                  placeholder="e.g. KAN or KAN-123" />
                <div className="form-hint">Enter a project key for all issues, or a specific ticket ID</div>
              </div>
              <div className="form-group">
                <label>Sprint / Version (Optional)</label>
                <input type="text" className="form-control" value={ticketForm.sprint}
                  onChange={e => setTicketForm({ ...ticketForm, sprint: e.target.value })}
                  placeholder="e.g. Sprint 1" />
              </div>
            </div>
            <div className="form-group">
              <label>Additional Context (Optional)</label>
              <textarea rows="3" className="form-control" value={ticketForm.context}
                onChange={e => setTicketForm({ ...ticketForm, context: e.target.value })}
                placeholder="e.g. Focus on edge cases for the login flow, include security testing..." />
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" style={{ borderRadius: '999px', padding: '0.75rem 2.5rem' }}
                onClick={handleTicketSubmit} disabled={loading || !ticketForm.projectKey.trim()}>
                {loading ? <><span className="spinner" /> Generating Test Plan...</> : <>Generate Test Plan <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Generated Result */}
      <div className={`wizard-step ${activeStep === 4 ? 'active' : 'collapsed'} ${completedSteps[3] ? 'completed' : ''}`}>
        <div className="wizard-step-header" onClick={() => setActiveStep(4)}>
          <div className="step-circle">{completedSteps[3] && activeStep !== 4 ? <Check size={16} /> : <ClipboardCheck size={16} />}</div>
          <div style={{ flex: 1 }}>
            <div className="step-title">Generated Test Plan</div>
            <div className="step-subtitle">Review and export your comprehensive test plan</div>
          </div>
        </div>
        {activeStep === 4 && (
          <div className="wizard-step-content">
            {planResult ? (
              <>
                <div className="plan-header">
                  <div>
                    <h3>Test Plan Generated</h3>
                    <div className="plan-header-sub">{fetchedIssues.length} issues analyzed &middot; {planResult.test_cases?.length || 0} test cases</div>
                  </div>
                  <button className="btn btn-primary" onClick={downloadDocx}>
                    <FileDown size={16} /> Export .DOCX
                  </button>
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
                <h3>No test plan yet</h3>
                <p>Complete the previous steps to generate a comprehensive test plan from your Jira issues.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
