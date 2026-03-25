import React, { useState, useEffect } from 'react';

export interface LLMSettings {
  provider: 'ollama' | 'lmstudio' | 'openai' | 'claude' | 'grok' | 'gemini';
  endpoint: string;
  apiKey: string;
  model: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LLMSettings;
  onSave: (s: LLMSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [provider, setProvider] = useState(settings.provider);
  const [endpoint, setEndpoint] = useState(settings.endpoint);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Update local state when opened with new settings
  useEffect(() => {
    if (isOpen) {
      setProvider(settings.provider);
      setEndpoint(settings.endpoint);
      setApiKey(settings.apiKey);
      setModel(settings.model);
      setTestStatus(null);
    }
  }, [isOpen, settings]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as LLMSettings['provider'];
    setProvider(val);
    if (val === 'ollama') { setEndpoint('http://localhost:11434/v1'); setModel('llama3.2'); }
    else if (val === 'lmstudio') { setEndpoint('http://localhost:1234/v1'); setModel('local-model'); }
    else { setEndpoint(''); setModel(''); }
  };

  const handleTestConnection = async () => {
    setTestStatus('Testing...');
    try {
      const res = await fetch('http://localhost:3001/api/llm/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, endpoint, apiKey, model })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus('✅ Connection successful');
      } else {
        setTestStatus('❌ Failed: ' + data.error);
      }
    } catch (err: any) {
      setTestStatus('❌ Network Error: ' + err.message);
    }
  };

  const handleSave = () => {
    onSave({ provider, endpoint, apiKey, model });
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="glass-panel modal-content">
        <div className="modal-header">
          <h2>LLM Configurations</h2>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Provider</label>
            <select value={provider} onChange={handleProviderChange}>
              <option value="ollama">Ollama (Local)</option>
              <option value="lmstudio">LM Studio (Local)</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Claude API</option>
              <option value="grok">Grok API</option>
              <option value="gemini">Gemini API</option>
            </select>
          </div>

          {(provider === 'ollama' || provider === 'lmstudio' || provider === 'openai' || provider === 'grok') && (
            <div className="form-group">
              <label>API Endpoint Base URL</label>
              <input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="e.g. http://localhost:11434/v1" />
            </div>
          )}

          {(provider !== 'ollama' && provider !== 'lmstudio') && (
            <div className="form-group">
              <label>API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={`Enter your ${provider} API Key`} />
            </div>
          )}

          <div className="form-group">
            <label>Model Name</label>
            <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g., llama3.2, -4o, etc." />
          </div>

          {testStatus && (
            <div style={{ marginTop: 8, fontSize: '0.9rem', color: testStatus.includes('✅') ? '#7ee787' : '#ff7b72' }}>
              {testStatus}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={handleTestConnection}>Test Connection</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};
