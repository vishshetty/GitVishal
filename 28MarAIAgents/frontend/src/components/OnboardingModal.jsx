import { useState } from 'react';
import { llmApi, jiraApi } from '../api';
import PasswordInput from './PasswordInput';

export default function OnboardingModal({ hasLlm, onComplete }) {
  const [step, setStep] = useState(hasLlm ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // LLM State
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  // Jira State
  const [jName, setJName] = useState('My Jira');
  const [jHost, setJHost] = useState('');
  const [jEmail, setJEmail] = useState('');
  const [jToken, setJToken] = useState('');

  const handleTestLlm = async () => {
    setLoading(true); setError(null);
    try {
      const res = await llmApi.test({ provider, model, api_key: apiKey, base_url: baseUrl });
      if (res.ok) {
        await llmApi.save({ provider, model, api_key: apiKey, base_url: baseUrl });
        setStep(2);
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError("Network error testing LLM");
    } finally {
      setLoading(false);
    }
  };

  const handleTestJira = async () => {
    setLoading(true); setError(null);
    try {
      const res = await jiraApi.test({ host: jHost, email: jEmail, api_token: jToken });
      if (res.ok) {
        await jiraApi.save({ connection_name: jName, host: jHost, email: jEmail, api_token: jToken });
        onComplete();
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError("Network error testing Jira");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{zIndex: 9999}}>
      <div className="modal-content">
        <h2 className="card-title" style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          {step === 1 ? 'Step 1: Welcome!' : 'Step 2: Connect Jira'}
        </h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        {step === 1 && (
          <div>
            <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>First, let's configure your AI Provider to generate Test Plans.</p>
            <div className="form-group">
              <label>Provider</label>
              <select className="form-control" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="groq">GROQ (Fastest)</option>
                <option value="ollama">Ollama (Local / Private)</option>
                <option value="grok">Grok (xAI)</option>
              </select>
            </div>
            {provider !== 'ollama' && (
              <div className="form-group">
                <label>API Key</label>
                <PasswordInput value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." savedHint={false} />
              </div>
            )}
            <div className="form-group">
              <label>Model Name</label>
              <input type="text" className="form-control" value={model} onChange={e => setModel(e.target.value)} />
              <small style={{color: 'var(--text-muted)'}}>Ex: llama-3.3-70b-versatile, llama3, grok-beta</small>
            </div>
            <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}} onClick={handleTestLlm} disabled={loading}>
              {loading ? 'Testing...' : 'Test & Save AI Connection'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>Now, connect Jira so we can fetch your user stories.</p>
            <div className="form-group">
              <label>Connection Name</label>
              <input type="text" className="form-control" value={jName} onChange={e => setJName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Jira Host URL</label>
              <input type="text" placeholder="yourcompany.atlassian.net" className="form-control" value={jHost} onChange={e => setJHost(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" value={jEmail} onChange={e => setJEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>API Token</label>
              <PasswordInput value={jToken} onChange={e => setJToken(e.target.value)} placeholder="Create one in Atlassian Security Settings" savedHint={false} />
            </div>
            <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}} onClick={handleTestJira} disabled={loading}>
              {loading ? 'Testing...' : 'Test & Save Jira Connection'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
