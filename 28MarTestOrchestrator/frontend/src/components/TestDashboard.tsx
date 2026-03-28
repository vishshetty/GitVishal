import React from 'react';
import { ClipboardList, Code2, AlertCircle, Download } from 'lucide-react';
import { JiraStory } from './JiraFetcher';

export interface TestCase {
  testCaseId: string;
  scenarioId: string;
  testScenario: string;
  steps: string[];
  expectedResult: string;
}

interface TestDashboardProps {
  testCases: TestCase[];
  onSelectTestCase: (testCase: TestCase) => void;
  selectedStory?: JiraStory | null;
}

const TestDashboard: React.FC<TestDashboardProps> = ({ testCases, onSelectTestCase, selectedStory }) => {
  if (testCases.length === 0) {
    return (
      <div className="empty-state glass">
        <ClipboardList size={48} />
        <h3>No Test Cases Generated</h3>
        <p>Go to the <strong>Test Generator</strong> tab to create test cases from your user stories.</p>
      </div>
    );
  }

  const handleDownloadCSV = () => {
    const sanitize = (str: any) => {
      if (!str) return '""';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    const header = ['Test Case ID', 'Scenario ID', 'Test Scenario', 'Steps', 'Expected Result'];
    const rows = testCases.map(tc => [
      sanitize(tc.testCaseId),
      sanitize(tc.scenarioId),
      sanitize(tc.testScenario),
      sanitize((tc.steps || []).join('\n')),
      sanitize(tc.expectedResult)
    ]);
    
    const csvContent = [header.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Test_Cases_${selectedStory?.key || 'Export'}.csv`;
    link.click();
  };

  return (
    <div className="feature-view">
      <div className="view-header">
        <div className="view-title-group">
          <h2>Test Dashboard</h2>
          <p>Displaying all generated cases{selectedStory ? ` for ${selectedStory.key}` : ''}.</p>
        </div>
        <button className="btn-icon-primary" onClick={handleDownloadCSV} title="Download Test Cases (.csv)">
          <Download size={20} />
        </button>
      </div>

      <div className="test-cases-table glass">
        <div className="table-header">
          <div className="col-id" style={{ flex: '0 0 160px' }}>TC ID</div>
          <div className="col-type" style={{ flex: '0 0 200px' }}>Scenario ID</div>
          <div className="col-title" style={{ flex: 1 }}>Test Scenario</div>
          <div className="col-actions" style={{ flex: '0 0 80px', textAlign: 'right' }}>Actions</div>
        </div>
        
        <div className="table-body">
          {testCases.map((tc, idx) => (
            <div key={idx} className="table-row glass-hover">
              <div className="col-id" style={{ flex: '0 0 160px', fontWeight: 600, color: 'var(--primary-light)' }}>
                {tc.testCaseId}
              </div>
              <div className="col-type" style={{ flex: '0 0 200px' }}>
                <span className="chip priority-medium">{tc.scenarioId}</span>
              </div>
              <div className="col-title" style={{ flex: 1, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {tc.testScenario}
              </div>
              <div className="col-actions" style={{ flex: '0 0 80px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-icon-primary" title="Generate Code" onClick={() => onSelectTestCase(tc)}>
                  <Code2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="info-box">
          <AlertCircle size={14} />
          <span>Select any test case to generate automation scripts.</span>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
