import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Briefcase, Target, Award, Activity, TrendingUp } from 'lucide-react';
import type { Job } from '../types';
import { COLUMN_CONFIGS, PRIORITY_CONFIG } from '../lib/columns';

interface ReportsProps {
  jobs: Job[];
}

export function Reports({ jobs }: ReportsProps) {
  const metrics = useMemo(() => {
    const submitted = jobs.filter(j => !['Wishlist', 'Preparing'].includes(j.status));
    const totalSubmitted = submitted.length;
    
    // A response is anything beyond 'Applied' and not 'Ghosted' (though rejection is a response)
    const responses = submitted.filter(j => !['Applied', 'Ghosted/Closed'].includes(j.status)).length;
    const responseRate = totalSubmitted > 0 ? Math.round((responses / totalSubmitted) * 100) : 0;

    const interviews = submitted.filter(j => ['Screening', 'Interviewing', 'Offer Negotiation'].includes(j.status)).length;
    const interviewRate = totalSubmitted > 0 ? Math.round((interviews / totalSubmitted) * 100) : 0;

    const offers = submitted.filter(j => j.status === 'Offer Negotiation').length;
    
    return { totalSubmitted, responseRate, interviewRate, offers };
  }, [jobs]);

  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    const submissions = jobs.filter(j => !['Wishlist', 'Preparing'].includes(j.status) && j.dateApplied);
    
    const today = new Date();
    // Default last 6 months buckets
    for(let i=5; i>=0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      counts[key] = 0;
    }

    submissions.forEach(j => {
      const d = new Date(j.dateApplied);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      if (counts[key] !== undefined) {
         counts[key]++;
      }
    });

    return Object.entries(counts).map(([name, Applications]) => ({ name, Applications }));
  }, [jobs]);

  const funnelData = useMemo(() => {
    return COLUMN_CONFIGS
      .filter(col => !['Wishlist', 'Preparing'].includes(col.id))
      .map(col => ({
        name: col.label,
        count: jobs.filter(j => j.status === col.id).length,
        fill: col.chartColor
      })).filter(d => d.count > 0);
  }, [jobs]);

  const priorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    jobs.forEach(j => {
      counts[j.priority]++;
    });
    return [
      { name: 'High', value: counts.High, fill: PRIORITY_CONFIG.High.chartColor },
      { name: 'Medium', value: counts.Medium, fill: PRIORITY_CONFIG.Medium.chartColor },
      { name: 'Low', value: counts.Low, fill: PRIORITY_CONFIG.Low.chartColor },
    ].filter(d => d.value > 0);
  }, [jobs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-xl p-3 border border-slate-200 shadow-xl text-sm z-50 relative">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.color }} />
              <span className="text-slate-600 dark:text-slate-400 capitalize">{p.name}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 p-3 md:p-5 flex flex-col gap-4 md:gap-5 min-h-0 w-full max-w-[1600px] mx-auto overflow-y-auto lg:overflow-hidden">
      
      {/* KPI Row (Fixed height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 shrink-0">
        <KPICard title="Total Submitted" value={metrics.totalSubmitted} icon={<Briefcase className="w-5 h-5 text-blue-500" />} bg="bg-blue-500/10" />
        <KPICard title="Response Rate" value={`${metrics.responseRate}%`} icon={<Activity className="w-5 h-5 text-violet-500" />} bg="bg-violet-500/10" />
        <KPICard title="Interview Rate" value={`${metrics.interviewRate}%`} icon={<Target className="w-5 h-5 text-amber-500" />} bg="bg-amber-500/10" />
        <KPICard title="Offers Received" value={metrics.offers} icon={<Award className="w-5 h-5 text-emerald-500" />} bg="bg-emerald-500/10" />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-5 min-h-[600px] lg:min-h-0">
        
        {/* Left Column: Timeline and Funnel */}
        <div className="lg:col-span-2 flex flex-col gap-3 md:gap-5 min-h-0 h-full">
          
          {/* Timeline Area Chart */}
          <div className="flex-1 glass rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col overflow-hidden shadow-sm min-h-[250px]">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <h2 className="font-semibold text-sm tracking-wide">Application Momentum</h2>
            </div>
            <div className="flex-1 p-4 min-h-0 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-brand-200)" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Applications" stroke="var(--color-brand-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline Bar Chart */}
          <div className="flex-1 glass rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col overflow-hidden shadow-sm min-h-[250px]">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <h2 className="font-semibold text-sm tracking-wide">Current Pipeline (Post-Submission)</h2>
            </div>
            <div className="flex-1 p-4 min-h-0 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 40, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-brand-200)" opacity={0.15} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: 500, fill: '#666' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(100,100,100,0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
                    {funnelData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Priority Distribution */}
        <div className="glass rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col overflow-hidden shadow-sm min-h-[300px] lg:h-full lg:min-h-0">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/50">
            <h2 className="font-semibold text-sm tracking-wide">Priority Focus</h2>
          </div>
          <div className="flex-1 p-4 min-h-0 w-full h-full relative flex items-center justify-center">
            {jobs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400">No jobs added yet</div>
            )}
            {/* Inner Custom Legend positioned in center */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pt-1">
              <span className="text-4xl font-bold text-slate-800 dark:text-white">{jobs.length}</span>
              <span className="text-[10px] mt-1 font-semibold uppercase tracking-[0.2em] text-slate-400">Total</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, icon, bg }: { title: string; value: string | number; icon: React.ReactNode; bg: string }) {
  return (
    <div className="glass p-4 md:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-4 transition-transform hover:-translate-y-0.5 shadow-sm">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-widest truncate pb-1">{title}</p>
        <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">{value}</p>
      </div>
    </div>
  );
}
