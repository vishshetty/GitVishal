import React, { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface JiraStory {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
}

interface JiraFetcherProps {
  onSelectStory: (story: JiraStory) => void;
  selectedStoryId?: string;
}

const JiraFetcher: React.FC<JiraFetcherProps> = ({ onSelectStory, selectedStoryId }) => {
  const [stories, setStories] = useState<JiraStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jira/stories');
      const data = await res.json();
      if (data.success) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const filteredStories = stories.filter(s => 
    s.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="feature-view">
      <div className="view-header">
        <div className="view-title-group">
          <h2>Jira User Stories</h2>
          <p>Select a user story to generate test plans and cases.</p>
        </div>
        <button className="btn-primary" onClick={fetchStories} disabled={isLoading}>
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Fetching...' : 'Refresh Stories'}
        </button>
      </div>

      <div className="search-filter glass">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Filter by key or summary..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="loading-state">
           <RefreshCw size={48} className="animate-spin" />
           <p>Syncing with Jira Pulse...</p>
        </div>
      ) : stories.length > 0 ? (
        <div className="story-grid">
          {filteredStories.map((story) => (
            <div 
              key={story.id} 
              className={`story-card glass glass-hover ${selectedStoryId === story.id ? 'selected' : ''}`}
              onClick={() => onSelectStory(story)}
            >
              <div className="story-header">
                <span className="story-key">{story.key}</span>
                <span className={`story-priority priority-${story.priority.toLowerCase()}`}>
                  {story.priority}
                </span>
              </div>
              <h3 className="story-summary">{story.summary}</h3>
              <p className="story-desc">{story.description.substring(0, 100)}...</p>
              <div className="story-footer">
                <span className="story-status">{story.status}</span>
                {selectedStoryId === story.id && (
                  <div className="selected-badge">
                    <CheckCircle2 size={16} /> Selected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass">
          <Database size={48} />
          <h3>No User Stories Fetched</h3>
          <p>Connect your Jira instance or use mock data to begin.</p>
        </div>
      )}
    </div>
  );
};

export default JiraFetcher;
