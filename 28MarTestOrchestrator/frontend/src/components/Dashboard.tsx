import React, { useState, useEffect } from 'react';
import {
  BookOpen, Zap, ShieldCheck, TrendingUp, ChevronRight,
  FileEdit, Database, Code2, ArrowRight, CheckCircle2,
  Clock, AlertCircle, RefreshCw, Download
} from 'lucide-react';
import { JiraStory } from './JiraFetcher';
import { TestCase } from './TestDashboard';

interface DashboardProps {
  testCases: TestCase[];
  selectedStory: JiraStory | null;
  selectedTestCase?: TestCase | null;
}

const Dashboard: React.FC<DashboardProps> = ({ testCases, selectedStory, selectedTestCase }) => {
  const [stories, setStories] = useState<JiraStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/jira/stories');
        const data = await res.json();
        if (data.success && data.stories) setStories(data.stories);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStories(false);
      }
    };
    fetchStories();
  }, []);

  const totalStories = stories.length;
  const totalCases = testCases.length;
  const coverage = totalCases > 0 ? 100 : 0;

  const pipelineSteps = [
    { icon: <Database size={16} />, label: 'Fetch Stories', done: totalStories > 0, count: totalStories },
    { icon: <FileEdit size={16} />, label: 'Test Plan', done: !!selectedStory && totalCases > 0, count: selectedStory ? 1 : 0 },
    { icon: <Zap size={16} />, label: 'Test Cases', done: totalCases > 0, count: totalCases },
    { icon: <Code2 size={16} />, label: 'Automation Code', done: !!selectedTestCase, count: selectedTestCase ? 1 : 0 },
  ];

  const completedSteps = pipelineSteps.filter(s => s.done).length;
  const progressPct = Math.round((completedSteps / pipelineSteps.length) * 100);

  return (
    <div className="db-root">

      {/* ─── Hero Banner ─── */}
      <div className="db-hero glass">
        <div className="db-hero-text">
          <div className="db-badge">AI-Powered QA Platform</div>
          <h1>Orchestrate Your Testing Lifecycle</h1>
          <p>From Jira user stories to production-ready automation — fully AI-driven.</p>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="db-stats-row">
        <div className="db-stat glass pink-glow">
          <div className="db-stat-icon pink"><BookOpen size={18} /></div>
          <div className="db-stat-body">
            <div className="db-stat-value">{loadingStories ? '…' : totalStories || '--'}</div>
            <div className="db-stat-label">Stories Fetched</div>
          </div>
          <TrendingUp size={14} className="db-stat-trend" />
        </div>

        <div className="db-stat glass blue-glow">
          <div className="db-stat-icon blue"><Zap size={18} /></div>
          <div className="db-stat-body">
            <div className="db-stat-value">{totalCases}</div>
            <div className="db-stat-label">Test Cases Generated</div>
          </div>
          <TrendingUp size={14} className="db-stat-trend" />
        </div>

        <div className="db-stat glass green-glow">
          <div className="db-stat-icon green"><ShieldCheck size={18} /></div>
          <div className="db-stat-body">
            <div className="db-stat-value">{coverage}%</div>
            <div className="db-stat-label">Automation Coverage</div>
          </div>
          <TrendingUp size={14} className="db-stat-trend" />
        </div>

        <div className="db-stat glass amber-glow">
          <div className="db-stat-icon amber"><CheckCircle2 size={18} /></div>
          <div className="db-stat-body">
            <div className="db-stat-value">{completedSteps}/{pipelineSteps.length}</div>
            <div className="db-stat-label">Pipeline Steps Done</div>
          </div>
          <TrendingUp size={14} className="db-stat-trend" />
        </div>
      </div>

      {/* ─── Pipeline Progress + Activity ─── */}
      <div className="db-mid-row">

        {/* Pipeline */}
        <div className="db-pipeline glass">
          <div className="db-card-header">
            <h3>Pipeline Status</h3>
            <span className="db-pill">{progressPct}% Complete</span>
          </div>

          <div className="db-progress-bar-track">
            <div className="db-progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="db-pipeline-steps">
            {pipelineSteps.map((step, i) => (
              <div key={i} className={`db-pipeline-step ${step.done ? 'done' : ''}`}>
                <div className="db-step-icon">{step.icon}</div>
                <div className="db-step-info">
                  <span className="db-step-label">{step.label}</span>
                  <span className="db-step-count">{step.count > 0 ? step.count : '—'}</span>
                </div>
                {step.done
                  ? <CheckCircle2 size={16} className="db-step-check" />
                  : <Clock size={16} className="db-step-pending" />}
              </div>
            ))}
          </div>
        </div>

        {/* Active Story Card */}
        <div className="db-active-story glass">
          <div className="db-card-header">
            <h3>Active Story</h3>
            {selectedStory && <span className="db-pill blue">{selectedStory.key}</span>}
          </div>

          {selectedStory ? (
            <div className="db-story-detail">
              <div className="db-story-title">{selectedStory.summary}</div>
              <div className="db-story-meta">
                <span className={`story-priority priority-${selectedStory.priority?.toLowerCase() || 'medium'}`}>
                  {selectedStory.priority}
                </span>
                <span className="story-status">{selectedStory.status}</span>
              </div>
              <div className="db-story-desc">
                {selectedStory.description?.substring(0, 140)}…
              </div>
              <div className="db-story-stats">
                <div className="db-story-stat">
                  <Zap size={14} />
                  <span>{totalCases} test cases</span>
                </div>
                <div className="db-story-stat">
                  <ShieldCheck size={14} />
                  <span>{coverage}% coverage</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="db-empty-story">
              <AlertCircle size={36} />
              <p>No story selected yet.</p>
              <span>Go to <strong>Jira Stories</strong> to begin.</span>
            </div>
          )}
        </div>

      </div>

      {/* ─── Activity ─── */}
      <div className="db-bot-row-full">
        {/* Recent Activity */}
        <div className="db-activity glass">
          <div className="db-card-header">
            <h3>Recent Activity</h3>
            <button className="view-all-btn">View all <ChevronRight size={14} /></button>
          </div>
          <div className="db-activity-list">
            {totalCases > 0 && selectedStory && (
              <div className="db-activity-item">
                <div className="db-activity-dot blue" />
                <div className="db-activity-text">
                  <span>Generated <strong>{totalCases} test cases</strong> for</span>
                  <span className="db-activity-story">{selectedStory.key}: {selectedStory.summary}</span>
                  <span className="db-activity-time"><Clock size={11} /> Just now</span>
                </div>
              </div>
            )}
            {totalStories > 0 && (
              <div className="db-activity-item">
                <div className="db-activity-dot amber" />
                <div className="db-activity-text">
                  <span>Fetched <strong>{totalStories} stories</strong> from Jira</span>
                  <span className="db-activity-story">Project board synced successfully</span>
                  <span className="db-activity-time"><Clock size={11} /> Today</span>
                </div>
              </div>
            )}
            {!totalCases && !totalStories && (
              <div className="db-no-activity">
                <RefreshCw size={28} />
                <p>No activity yet.</p>
                <span>Start by fetching Jira stories.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
