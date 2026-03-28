import React, { useState, useEffect } from 'react';
import { Code2, Play, CheckCircle2, Copy, FileCode, Check, Download } from 'lucide-react';
import { TestCase } from './TestDashboard';

interface CodeGeneratorProps {
  selectedTestCase: TestCase | null;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ selectedTestCase }) => {
  const [tool, setTool] = useState<'selenium' | 'playwright'>('playwright');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const generateCode = async () => {
    if (!selectedTestCase) return;
    setIsGenerating(true);
    setGeneratedCode('');

    try {
      const res = await fetch('/api/generate/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCase: selectedTestCase,
          tool: tool
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedCode(data.code);
      }
    } catch (error) {
      console.error("Code Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedTestCase) {
      generateCode();
    }
  }, [selectedTestCase, tool]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fileExtension = tool === 'selenium' ? '.java' : '.spec.ts';
  const fileMimeType = 'text/plain;charset=utf-8;';
  const fileName = selectedTestCase ? `${selectedTestCase.scenarioId.replace(/-/g, '')}Test${fileExtension}` : `test_script${fileExtension}`;

  const handleDownloadCode = () => {
    if (!generatedCode || !selectedTestCase) return;
    const blob = new Blob([generatedCode], { type: fileMimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!selectedTestCase) {
    return (
      <div className="empty-state glass">
        <Code2 size={48} />
        <h3>Select a Test Case</h3>
        <p>Choose a test case from the <strong>Test Dashboard</strong> to generate automation code.</p>
      </div>
    );
  }

  return (
    <div className="feature-view">
      <div className="view-header">
        <div className="view-title-group">
          <h2>Automation Code Generator</h2>
          <p>Generating code for <strong>{selectedTestCase.testCaseId}: {selectedTestCase.testScenario}</strong></p>
        </div>
        <div className="tool-selector glass">
          <button 
            className={`tool-btn ${tool === 'playwright' ? 'active' : ''}`}
            onClick={() => setTool('playwright')}
          >
            Playwright
          </button>
          <button 
            className={`tool-btn ${tool === 'selenium' ? 'active' : ''}`}
            onClick={() => setTool('selenium')}
          >
            Selenium (Java)
          </button>
        </div>
      </div>

      <div className="code-container glass">
        <div className="code-header">
          <div className="code-meta">
            <div className="file-chip">
              <FileCode size={14} />
              <span>{fileName}</span>
            </div>
            {isGenerating && <span className="generating-indicator">Generating AI Code...</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="copy-btn" onClick={handleDownloadCode} disabled={!generatedCode}>
              <Download size={16} /> Download
            </button>
            <button className="copy-btn" onClick={handleCopy} disabled={!generatedCode}>
              {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              {isCopied ? 'Copied!' : 'Copy To Clipboard'}
            </button>
          </div>
        </div>
        
        <div className="code-content">
          {isGenerating ? (
            <div className="code-skeleton">
               <div className="skeleton-line" style={{width: '60%'}}></div>
               <div className="skeleton-line" style={{width: '80%'}}></div>
               <div className="skeleton-line" style={{width: '40%'}}></div>
               <div className="skeleton-line" style={{width: '70%'}}></div>
               <div className="skeleton-line" style={{width: '50%'}}></div>
            </div>
          ) : (
            <pre><code>{generatedCode || '// Select a tool to begin generation.'}</code></pre>
          )}
        </div>
      </div>

      <div className="code-info-grid">
        <div className="info-card glass">
           <Play size={20} className="text-secondary" />
           <h4>Execution Ready</h4>
           <p>This code is optimized for independent execution using {tool}.</p>
        </div>
        <div className="info-card glass">
           <CheckCircle2 size={20} className="text-secondary" />
           <h4>Verified Logic</h4>
           <p>The steps match the user story's acceptance criteria.</p>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
