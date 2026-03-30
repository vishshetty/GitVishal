import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Settings, History, Sun, Moon, Zap } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const isActive = (path) => {
    if (path === '/new-plan') return location.pathname === '/new-plan' || location.pathname === '/';
    return location.pathname === path;
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Zap size={18} color="white" />
          </div>
          <div>
            <div className="sidebar-brand-text">TestPlanner</div>
            <div className="sidebar-brand-sub">AI-Powered QA</div>
          </div>
        </div>

        <div className="sidebar-section-label">Main</div>
        <nav className="sidebar-nav">
          <Link to="/new-plan" className={`nav-item ${isActive('/new-plan') ? 'active' : ''}`}>
            <FileText size={18} /> New Plan
          </Link>
          <Link to="/history" className={`nav-item ${isActive('/history') ? 'active' : ''}`}>
            <History size={18} /> History
          </Link>
          <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
