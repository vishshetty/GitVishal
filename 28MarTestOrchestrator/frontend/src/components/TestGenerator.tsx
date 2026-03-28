import React, { useState } from 'react';
import { 
  FileEdit, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle, 
  ListOrdered, 
  Target,
  Download
} from 'lucide-react';
import { JiraStory } from './JiraFetcher';

export interface TestCase {
  testCaseId: string;
  scenarioId: string;
  testScenario: string;
  steps: string[];
  expectedResult: string;
}

export interface TestPlan {
  objective: string;
  scope: string;
  inclusions: string[];
  exclusions: string[];
  testEnvironments: string[];
  defectReporting: string;
  testStrategy: string;
  testSchedule: string;
  testDeliverables: string[];
  entryCriteria: string[];
  exitCriteria: string[];
  tools: string[];
  risksAndMitigations: string[];
  testCases: TestCase[];
}

interface TestGeneratorProps {
  selectedStory: JiraStory | null;
  onGenerateTestCases: (cases: TestCase[]) => void;
}

const TestGenerator: React.FC<TestGeneratorProps> = ({ selectedStory, onGenerateTestCases }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<TestPlan | null>(null);

  React.useEffect(() => {
    setGeneratedPlan(null);
  }, [selectedStory?.id]);

  const handleGenerate = async () => {
    if (!selectedStory) return;
    setIsGenerating(true);
    setGeneratedPlan(null);

    try {
      const res = await fetch('/api/generate/testplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: selectedStory.summary,
          description: selectedStory.description
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedPlan(data.testPlan);
        onGenerateTestCases(data.testPlan.testCases);
      }
    } catch (error) {
      console.error("Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTestPlan = () => {
    if (!generatedPlan || !selectedStory) return;
    
    const content = `# Test Plan for ${selectedStory.key}
1. Objective: ${generatedPlan.objective}
2. Scope: ${generatedPlan.scope}
3. Inclusions: ${generatedPlan.inclusions.join(', ')}
4. Exclusions: ${generatedPlan.exclusions.join(', ')}
5. Test Environments: ${generatedPlan.testEnvironments.join(', ')}
6. Defect Reporting: ${generatedPlan.defectReporting}
7. Test Strategy: ${generatedPlan.testStrategy}
8. Test Schedule: ${generatedPlan.testSchedule}
9. Test Deliverables: ${generatedPlan.testDeliverables.join(', ')}
10. Entry Criteria: ${generatedPlan.entryCriteria.join(', ')}
11. Exit Criteria: ${generatedPlan.exitCriteria.join(', ')}
12. Tools: ${generatedPlan.tools.join(', ')}
13. Risks & Mitigations: ${generatedPlan.risksAndMitigations.join(', ')}
`;
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown;charset=utf-8;'});
    element.href = URL.createObjectURL(file);
    element.download = `Test_Plan_${selectedStory.key}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!selectedStory) {
    return (
      <div className="empty-state glass">
        <FileEdit size={48} />
        <h3>No User Story Selected</h3>
        <p>Go to the <strong>Jira Stories</strong> tab and select a story to generate test cases.</p>
      </div>
    );
  }

  return (
    <div className="feature-view">
      <div className="view-header">
        <div className="view-title-group">
          <h2>Smart Test Generator</h2>
          <p>Generating tests for <strong>{selectedStory.key}: {selectedStory.summary}</strong></p>
        </div>
        <button className="btn-primary" onClick={handleGenerate} disabled={isGenerating}>
          <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Generating...' : generatedPlan ? 'Regenerate Plan' : 'Start Orchestration'}
        </button>
      </div>

      <div className="generator-container">
        {isGenerating ? (
          <div className="generation-progress glass">
            <div className="progress-content">
              <RefreshCw size={48} className="animate-spin glow-icon" />
              <h3>AI is analyzing the story...</h3>
              <div className="progress-steps">
                <div className="p-step active"><CheckCircle2 size={16} /> Parsing Requirements</div>
                <div className="p-step active"><RefreshCw size={16} className="animate-spin" /> Generating Test Plan</div>
                <div className="p-step">Case Extraction</div>
                <div className="p-step">Automation Check</div>
              </div>
            </div>
          </div>
        ) : generatedPlan ? (
          <div className="test-plan-display fade-in">
            <div className="plan-header glass">
              <div className="plan-title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={24} className="text-secondary" />
                  <h3>Test Plan ({selectedStory.key})</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon-primary" onClick={handleDownloadTestPlan} title="Download Test Plan (.md)">
                    <Download size={20} />
                  </button>
                </div>
              </div>
              
              <div className="plan-details-grid" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div><strong>1. Objective:</strong> {generatedPlan.objective}</div>
                <div><strong>2. Scope:</strong> {generatedPlan.scope}</div>
                <div><strong>3. Inclusions:</strong> {generatedPlan.inclusions.join(', ')}</div>
                <div><strong>4. Exclusions:</strong> {generatedPlan.exclusions.join(', ')}</div>
                <div><strong>5. Environments:</strong> {generatedPlan.testEnvironments.join(', ')}</div>
                <div><strong>6. Defect Reporting:</strong> {generatedPlan.defectReporting}</div>
                <div><strong>7. Test Strategy:</strong> {generatedPlan.testStrategy}</div>
                <div><strong>8. Schedule:</strong> {generatedPlan.testSchedule}</div>
                <div><strong>9. Deliverables:</strong> {generatedPlan.testDeliverables.join(', ')}</div>
                <div><strong>10. Entry Criteria:</strong> {generatedPlan.entryCriteria.join(', ')}</div>
                <div><strong>11. Exit Criteria:</strong> {generatedPlan.exitCriteria.join(', ')}</div>
                <div><strong>12. Tools:</strong> {generatedPlan.tools.join(', ')}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>13. Risks and Mitigations:</strong> {generatedPlan.risksAndMitigations.join(' | ')}</div>
              </div>
            </div>

            <div className="test-cases-section">
              <div className="section-header">
                <div className="section-header-text">
                  <h3>Test Cases ({generatedPlan.testCases.length})</h3>
                  <p>Generated based on user story requirements.</p>
                </div>
                <button className="btn-icon-primary" onClick={() => {
                    const sanitize = (str: any) => {
                      if (!str) return '""';
                      return `"${String(str).replace(/"/g, '""')}"`;
                    };
                    const header = ['Test Case ID', 'Scenario ID', 'Test Scenario', 'Steps', 'Expected Result'];
                    const rows = generatedPlan.testCases.map((tc: any) => [
                      sanitize(tc.testCaseId), 
                      sanitize(tc.scenarioId), 
                      sanitize(tc.testScenario), 
                      sanitize((tc.steps || []).join('\n')), 
                      sanitize(tc.expectedResult)
                    ]);
                    const csvContent = [header.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
                    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `Test_Cases_${selectedStory.key}.csv`;
                    link.click();
                }} title="Download Test Cases (.csv)">
                  <Download size={20} />
                </button>
              </div>
              
              <div className="cases-list">
                {generatedPlan.testCases.map((tc, idx) => (
                  <div key={idx} className="case-item glass glass-hover">
                    <div className="case-header">
                      <span className="case-id">{tc.testCaseId}</span>
                      <span className="case-priority priority-medium">{tc.scenarioId}</span>
                    </div>
                    <h4 className="case-title">{tc.testScenario}</h4>
                    <div className="case-body">
                      <div className="case-steps">
                        <h5><ListOrdered size={14} /> Steps:</h5>
                        <ul>
                          {tc.steps.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="case-expected">
                        <h5>Expected Result:</h5>
                        <p>{tc.expectedResult}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-footer">
                <p>Ready to move forward? Check the Dashboard to review all stored tests.</p>
                <button className="btn-primary" onClick={handleGenerate}>
                  <RefreshCw size={18} /> Regenerate Cases
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="story-summary-card glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="case-id" style={{ fontSize: '0.8rem' }}>{selectedStory.key}</span>
                <h3 style={{ marginTop: '8px' }}>{selectedStory.summary}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`story-priority priority-${selectedStory.priority?.toLowerCase() || 'medium'}`}>{selectedStory.priority}</span>
                <span className="story-status">{selectedStory.status}</span>
              </div>
            </div>
            <div className="divider"></div>
            <div style={{ color: '#94a3b8', lineHeight: '1.7', marginTop: '1rem', fontSize: '0.9rem' }}>
              {selectedStory.description || 'No description provided for this story.'}
            </div>
            <div className="divider"></div>
            <p className="hint-text">Click <strong>"Start Orchestration"</strong> above to use AI to generate a full 13-point Test Plan and detailed Test Cases specifically for this story.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGenerator;
