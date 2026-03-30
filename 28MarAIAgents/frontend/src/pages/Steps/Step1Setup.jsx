import { useState } from 'react';
import { jiraApi, llmApi } from '../../api';

export default function Step1Setup({ onNext, RefreshConfigs, jiraConfigs, llmConfigs, selectedJira, setSelectedJira, selectedLlm, setSelectedLlm }) {
  const [mode, setMode] = useState('view'); // 'view' or 'add_jira' or 'add_llm'
  const [form, setForm] = useState({ name: '', host: '', email: '', token: '' });
  const [llmForm, setLlmForm] = useState({ provider: 'groq', model: '', key: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const saveJira = async () => {
    setLoading(true); setMsg(null);
    try {
      const res = await jiraApi.test({ host: form.host, email: form.email, api_token: form.token });
      if (res.ok) {
        await jiraApi.save({ connection_name: form.name, host: form.host, email: form.email, api_token: form.token });
        await RefreshConfigs();
        setMode('view');
        setMsg({type:'success', text: 'Jira Connected!'});
      } else {
        setMsg({type:'error', text: res.message});
      }
    } catch(e) { setMsg({type:'error', text: 'Error connecting to Jira'}); }
    setLoading(false);
  };

  const saveLlm = async () => {
    setLoading(true); setMsg(null);
    try {
      const res = await llmApi.test({ provider: llmForm.provider, model: llmForm.model, api_key: llmForm.key, base_url: llmForm.url });
      if (res.ok) {
        await llmApi.save({ provider: llmForm.provider, model: llmForm.model, api_key: llmForm.key, base_url: llmForm.url });
        await RefreshConfigs();
        setMode('view');
        setMsg({type:'success', text: 'LLM Connected!'});
      } else {
        setMsg({type:'error', text: res.message});
      }
    } catch(e) { setMsg({type:'error', text: 'Error connecting to LLM'}); }
    setLoading(false);
  };

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <h2 className="card-title">Jira Connections</h2>
          {mode !== 'add_jira' && <button className="btn" onClick={() => setMode('add_jira')}>+ Add New Connection</button>}
        </div>
        
        {mode === 'add_jira' ? (
          <div style={{padding:'1rem', background:'var(--panel-bg)', borderRadius:'8px', border:'1px solid var(--border-color)'}}>
            <div className="form-group"><label>Connection Name</label><input type="text" className="form-control" onChange={e=>setForm({...form, name:e.target.value})}/></div>
            <div className="form-group"><label>Jira Host</label><input type="text" className="form-control" onChange={e=>setForm({...form, host:e.target.value})}/></div>
            <div className="form-group"><label>Email</label><input type="text" className="form-control" onChange={e=>setForm({...form, email:e.target.value})}/></div>
            <div className="form-group"><label>API Token</label><input type="password" className="form-control" onChange={e=>setForm({...form, token:e.target.value})}/></div>
            <div style={{display:'flex', gap:'1rem'}}>
              <button className="btn btn-primary" onClick={saveJira} disabled={loading}>{loading?'Testing...':'Save Connection'}</button>
              <button className="btn" onClick={()=>setMode('view')}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'1rem'}}>
            {jiraConfigs.map(c => (
              <div key={c.id} 
                   style={{border: selectedJira === c.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', 
                           padding:'1rem', borderRadius:'8px', cursor:'pointer'}}
                   onClick={() => setSelectedJira(c.id)}>
                <div style={{fontWeight:600}}>{c.connection_name}</div>
                <div style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>{c.host}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <h2 className="card-title">AI Provider (LLM) Settings</h2>
          {mode !== 'add_llm' && <button className="btn" onClick={() => setMode('add_llm')}>+ Add LLM Config</button>}
        </div>

        {mode === 'add_llm' ? (
           <div style={{padding:'1rem', background:'var(--panel-bg)', borderRadius:'8px', border:'1px solid var(--border-color)'}}>
           <div className="form-group"><label>Provider</label>
             <select className="form-control" value={llmForm.provider} onChange={e=>setLlmForm({...llmForm, provider:e.target.value})}>
                <option value="groq">GROQ</option><option value="ollama">Ollama</option><option value="grok">Grok</option>
             </select>
           </div>
           <div className="form-group"><label>Model</label><input type="text" className="form-control" onChange={e=>setLlmForm({...llmForm, model:e.target.value})}/></div>
           <div className="form-group"><label>API Key</label><input type="password" className="form-control" onChange={e=>setLlmForm({...llmForm, key:e.target.value})}/></div>
           <div style={{display:'flex', gap:'1rem'}}>
             <button className="btn btn-primary" onClick={saveLlm} disabled={loading}>{loading?'Testing...':'Save LLM'}</button>
             <button className="btn" onClick={()=>setMode('view')}>Cancel</button>
           </div>
         </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'1rem'}}>
            {llmConfigs.map(c => (
              <div key={c.id} 
                   style={{border: selectedLlm === c.provider ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', 
                           padding:'1rem', borderRadius:'8px', cursor:'pointer'}}
                   onClick={() => setSelectedLlm(c.provider)}>
                <div style={{fontWeight:600}}>{c.provider.toUpperCase()}</div>
                <div style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>{c.model || 'Default Model'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn btn-primary" style={{width:'100%', padding:'1rem'}} 
              disabled={!selectedJira || !selectedLlm} onClick={onNext}>
        Continue to Fetch Issues
      </button>

    </div>
  );
}
