import { Moon, Sun, Plus, Download, Upload, Briefcase, BarChart2, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  view: 'board' | 'reports';
  onViewChange: (view: 'board' | 'reports') => void;
  search: string;
  onSearch: (v: string) => void;
  onAddJob: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Navbar({ view, onViewChange, search, onSearch, onAddJob, onExport, onImport }: NavbarProps) {
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm hidden sm:block tracking-tight">JobTracker</span>
        </div>

        {/* View toggle — pill style */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 mr-2">
          <button
            onClick={() => onViewChange('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              view === 'board'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => onViewChange('reports')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              view === 'reports'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Reports
          </button>
        </div>

        {/* Mobile view toggle (icon only) */}
        <button
          onClick={() => onViewChange(view === 'board' ? 'reports' : 'board')}
          title={view === 'board' ? 'View Reports' : 'View Board'}
          className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {view === 'board' ? <BarChart2 className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
        </button>

        {/* Search */}
        {view === 'board' && (
          <input
            type="search"
            placeholder="Search company, role or resume…"
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="flex-1 min-w-0 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
          />
        )}
        {view !== 'board' && <div className="flex-1" />}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onAddJob}
            className="flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Job</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            onClick={onExport}
            title="Export as JSON"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-medium"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Export</span>
          </button>

          <label
            title="Import from JSON"
            className="cursor-pointer flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-medium"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Import</span>
            <input type="file" accept=".json" className="sr-only" onChange={onImport} />
          </label>

          <button
            onClick={toggle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
