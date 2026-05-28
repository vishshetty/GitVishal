import { useState, useEffect } from 'react';
import './App.css';

interface TestCaseRow {
  id: string;
  description: string;
  type: 'Positive' | 'Negative' | 'Edge Case' | string;
  priority: 'High' | 'Medium' | 'Low' | string;
  steps: string[];
  expectedResult: string;
}

interface GenerationHistory {
  id: number;
  timestamp: string;
  req: string;
  numCases: number;
  testCases: TestCaseRow[];
  provider?: string;
}

function App() {
  const [reqText, setReqText] = useState('Generate test cases for https://login.drde.so/sign_in?request_host=www.sdetclub.com#email');
  const [provider, setProvider] = useState<'ollama' | 'groq' | 'openai' | 'demo'>('demo');
  const [apiKey, setApiKey] = useState('*******************');
  const [showApiKey, setShowApiKey] = useState(false);
  const [numCases, setNumCases] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [currentTestCases, setCurrentTestCases] = useState<TestCaseRow[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('llmHistoryNew');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleGenerate = async () => {
    if (!reqText.trim()) return;
    setIsGenerating(true);

    try {
      if (provider === 'demo') {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockCases: TestCaseRow[] = [
          { id: "TC-001", description: "Successful login with valid credentials", type: "Positive", priority: "High", steps: ["Enter valid email", "Enter valid password", "Click Login"], expectedResult: "User is redirected to dashboard" },
          { id: "TC-002", description: "Login failure with invalid password", type: "Negative", priority: "Medium", steps: ["Enter valid email", "Enter wrong password", "Click Login"], expectedResult: "Error message 'Invalid credentials' is displayed" },
          { id: "TC-003", description: "Empty email validation", type: "Edge Case", priority: "Low", steps: ["Leave email empty", "Enter password", "Click Login"], expectedResult: "Browser validation message or UI error appears" }
        ];
        updateStateWithResults(mockCases);
        return;
      }

      // Determine what model to use mapping based on provider
      const model = provider === 'groq' ? 'llama-3.1-8b-instant' : provider === 'openai' ? 'gpt-3.5-turbo' : 'llama3.2';
      const endpoint = provider === 'ollama' ? 'http://localhost:11434/v1' : provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined;

      const res = await fetch('http://localhost:3001/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider,
          endpoint: endpoint,
          apiKey: provider === 'ollama' ? '' : apiKey === '*******************' ? '' : apiKey,
          model: model,
          prompt: `Generate exactly ${numCases} test cases.\n\nRequirements:\n${reqText}`
        })
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        try {
          const text = data.text;
          // Robust JSON extraction: look for the first [ and last ]
          const startIdx = text.indexOf('[');
          const endIdx = text.lastIndexOf(']');
          
          if (startIdx === -1 || endIdx === -1) {
             throw new Error("Could not find a JSON array in the response.");
          }
          
          const jsonStr = text.substring(startIdx, endIdx + 1);
          const cases = JSON.parse(jsonStr);
          updateStateWithResults(cases);
        } catch (e) {
          console.error("Failed to parse output", e, data.text);
          alert("The LLM response was not valid JSON. You can see the raw output in the console.");
        }
      } else {
        alert(`Generation Error (${res.status}): ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert("Network Error: " + err.message + ". Make sure the backend is running on port 3001.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStateWithResults = (cases: TestCaseRow[]) => {
    setCurrentTestCases(cases);
    const newHistoryEntry: GenerationHistory = {
      id: Date.now(),
      timestamp: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()),
      req: reqText,
      numCases: cases.length,
      testCases: cases,
      provider: provider
    };
    const newHistory = [newHistoryEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem('llmHistoryNew', JSON.stringify(newHistory));
  };

  const handleDownloadCSV = () => {
    if (!currentTestCases.length) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Description,Type,Priority,Steps,Expected Result\n";

    currentTestCases.forEach(row => {
      const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
      const stepsStr = Array.isArray(row.steps) ? row.steps.join("\n") : row.steps;
      csvContent += `${escapeCsv(row.id)},${escapeCsv(row.description)},${escapeCsv(row.type)},${escapeCsv(row.priority)},${escapeCsv(stepsStr)},${escapeCsv(row.expectedResult)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "test_cases.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="layout-container">
      <div className="main-content">

        {/* Main Form Box */}
        <div className="card form-card">
          <h2 className="title">Test Case Generator</h2>

          <div className="form-group">
            <label>Requirements <span className="required">*</span></label>
            <textarea
              value={reqText}
              onChange={e => setReqText(e.target.value)}
              rows={3}
            />
            <p className="helper-text">Detailed requirements improve results.</p>
          </div>

          <div className="form-group">
            <label>LLM Provider <span className="required">*</span></label>
            <div className="provider-options">
              <div
                className={`provider-card ${provider === 'demo' ? 'active' : ''}`}
                onClick={() => setProvider('demo')}
              >
                <div className="dot blue"></div>
                <div className="provider-name">Demo</div>
                <div className="provider-type">(No LLM)</div>
              </div>

              <div
                className={`provider-card ${provider === 'ollama' ? 'active' : ''}`}
                onClick={() => setProvider('ollama')}
              >
                <div className="dot green"></div>
                <div className="provider-name">Ollama</div>
                <div className="provider-type">(Local)</div>
              </div>

              <div
                className={`provider-card ${provider === 'groq' ? 'active' : ''}`}
                onClick={() => setProvider('groq')}
              >
                <div className="dot yellow"></div>
                <div className="provider-name">Groq</div>
                <div className="provider-type">(API)</div>
              </div>

              <div
                className={`provider-card ${provider === 'openai' ? 'active' : ''}`}
                onClick={() => setProvider('openai')}
              >
                <div className="dot orange"></div>
                <div className="provider-name">OpenAI</div>
                <div className="provider-type">(API)</div>
              </div>
            </div>
          </div>

          {(provider === 'groq' || provider === 'openai') && (
            <div className="form-group animate-fade-in">
              <label>{provider === 'groq' ? 'Groq' : 'OpenAI'} API Key</label>
              <div className="api-key-input-wrapper">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${provider} API key...`}
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? "Hide API Key" : "Show API Key"}
                >
                  {showApiKey ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="form-group animate-fade-in">
              <div className="info-box">
                <p><strong>Note:</strong> Ensure Ollama is running locally (<code>ollama serve</code>) and you have the <code>llama3.2</code> model installed.</p>
              </div>
            </div>
          )}

          {provider === 'demo' && (
            <div className="form-group animate-fade-in">
              <div className="info-box blue">
                <p><strong>Demo Mode:</strong> No LLM will be called. It will generate sample test cases for demonstration purposes.</p>
              </div>
            </div>
          )}

          <div className="form-group slider-group">
            <label>Number of Test Cases: {numCases}</label>
            <input
              type="range"
              min={1}
              max={20}
              value={numCases}
              onChange={(e) => setNumCases(parseInt(e.target.value))}
              className="slider"
            />
            <p className="helper-text">Select 1–20.</p>
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating || !reqText.trim()}
          >
            {isGenerating ? 'Generating...' : '✓ Generate Test Cases'}
          </button>
        </div>

        {/* Results Area */}
        {currentTestCases.length > 0 && (
          <div className="card results-card">
            <div className="results-header">
              <h3>Generated Test Cases ({currentTestCases.length})</h3>
              <button className="btn-download" onClick={handleDownloadCSV}>
                ⤓ Download CSV
              </button>
            </div>

            <div className="table-responsive">
              <table className="test-case-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Steps</th>
                    <th>Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTestCases.map((tc, idx) => (
                    <tr key={idx}>
                      <td className="tc-id">{tc.id || `TC-${idx + 1}`}</td>
                      <td>{tc.description}</td>
                      <td>
                        <span className={`chip type-${tc.type?.toLowerCase().includes('positive') ? 'positive' : 'negative'}`}>
                          {tc.type?.toLowerCase().includes('positive') ? '✓ ' : '× '}{tc.type}
                        </span>
                      </td>
                      <td>
                        <span className={`chip priority-${tc.priority?.toLowerCase()}`}>
                          {tc.priority}
                        </span>
                      </td>
                      <td className="tc-steps">
                        <ol>
                          {(Array.isArray(tc.steps) ? tc.steps : String(tc.steps).split('\n')).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      </td>
                      <td>{tc.expectedResult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* History Sidebar */}
      <div className="history-sidebar">
        <div className="card history-card">
          <div className="history-header">
            <h4 className="history-title">⏳ History (Last 10)</h4>
            {history.length > 0 && (
              <button 
                className="clear-history-btn" 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('llmHistoryNew');
                }}
                title="Clear History"
              >
                Clear
              </button>
            )}
          </div>

          <div className="history-list">
            {history.slice(0, 10).map((h) => (
              <div
                key={h.id}
                className="history-item"
                onClick={() => setCurrentTestCases(h.testCases)}
              >
                <div className="history-date">🕒 {h.timestamp} {h.provider && <span className="history-provider-badge">
                  {h.provider === 'ollama' ? '🦙 Ollama' : 
                   h.provider === 'groq' ? '⚡ Groq' : 
                   h.provider === 'demo' ? '🎮 Demo' : '🤖 OpenAI'}
                </span>}</div>
                <div className="history-req">{h.req.length > 40 ? h.req.substring(0, 40) + "..." : h.req}</div>
                <div className="history-cases">{h.numCases} test cases</div>
              </div>
            ))}
          </div>

          <div className="history-footer">
            Showing {Math.min(history.length, 10)} most recent generations
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
