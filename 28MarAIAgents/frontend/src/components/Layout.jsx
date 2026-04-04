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
    <div className="app-layout">
      <header className="top-header">
        <Link to="/" className="header-brand">
          <div className="header-brand-icon">
            <Zap size={20} color="white" />
          </div>
          <div>
            <div className="header-brand-text">TestPlanner</div>
            <div className="header-brand-sub">AI-Powered QA</div>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/new-plan" className={`header-nav-link ${isActive('/new-plan') ? 'active' : ''}`}>
            <FileText size={16} /> New Plan
          </Link>
          <Link to="/history" className={`header-nav-link ${isActive('/history') ? 'active' : ''}`}>
            <History size={16} /> History
          </Link>
          <Link to="/settings" className={`header-nav-link ${isActive('/settings') ? 'active' : ''}`}>
            <Settings size={16} /> Settings
          </Link>
        </nav>

        <div className="header-actions">
          <button className="theme-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
