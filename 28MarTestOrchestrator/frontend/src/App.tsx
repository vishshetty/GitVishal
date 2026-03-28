import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  FileEdit, 
  ClipboardList, 
  Code2, 
  Settings, 
  Search,
  Bell,
  User,
  ExternalLink
} from 'lucide-react';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import JiraFetcher, { JiraStory } from './components/JiraFetcher';
import TestGenerator from './components/TestGenerator';
import TestDashboard, { TestCase } from './components/TestDashboard';
import CodeGenerator from './components/CodeGenerator';

type View = 'dashboard' | 'jira' | 'generator' | 'tests' | 'codegen';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedStory, setSelectedStory] = useState<JiraStory | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'jira', label: 'Jira Stories', icon: <Database size={20} /> },
    { id: 'generator', label: 'Test Generator', icon: <FileEdit size={20} /> },
    { id: 'tests', label: 'Test Dashboard', icon: <ClipboardList size={20} /> },
    { id: 'codegen', label: 'Code Generator', icon: <Code2 size={20} /> },
  ];

  const handleSelectStory = (story: JiraStory) => {
    if (selectedStory?.id !== story.id) {
       setTestCases([]);
       setSelectedTestCase(null);
    }
    setSelectedStory(story);
    setActiveView('generator');
  };

  const handleGenerateTestCases = (cases: TestCase[]) => {
    setTestCases(cases);
  };

  const handleSelectTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setActiveView('codegen');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass">
        <div className="sidebar-logo">
          <div className="logo-glow"></div>
          <Code2 className="logo-icon" size={28} />
          <span className="logo-text">Test<span>Orchestrator</span></span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id as View)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeView === item.id && <div className="nav-active-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings size={20} />
            <span className="nav-label">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          {activeView === 'dashboard' ? (
            <div className="search-spacer" />
          ) : (
            <div className="search-bar glass">
              <Search size={18} />
              <input type="text" placeholder="Search across all modules..." />
            </div>
          )}
          
          <div className="header-actions">
            <button className="action-btn glass"><Bell size={20} /></button>
            <div className="user-profile glass">
              <User size={20} />
              <div className="user-info">
                <span className="user-name">Vishal Shetty</span>
                <span className="user-role">QA Lead</span>
              </div>
            </div>
          </div>
        </header>

        <div className="view-container fade-in" key={activeView}>
          {activeView === 'dashboard' && (
            <Dashboard 
              testCases={testCases}
              selectedStory={selectedStory}
              selectedTestCase={selectedTestCase}
            />
          )}
          {activeView === 'jira' && (
            <JiraFetcher 
              onSelectStory={handleSelectStory} 
              selectedStoryId={selectedStory?.id} 
            />
          )}
          {activeView === 'generator' && (
            <TestGenerator 
              selectedStory={selectedStory}
              onGenerateTestCases={handleGenerateTestCases}
            />
          )}
          {activeView === 'tests' && (
            <TestDashboard 
              testCases={testCases}
              onSelectTestCase={handleSelectTestCase}
              selectedStory={selectedStory}
            />
          )}
          {activeView === 'codegen' && (
            <CodeGenerator 
              selectedTestCase={selectedTestCase}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
