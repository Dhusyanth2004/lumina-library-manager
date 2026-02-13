
import React from 'react';
import { LibraryStats } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface DashboardProps {
  stats: LibraryStats;
  onFilterClick: (filter: 'all' | 'active' | 'overdue' | 'dueSoon' | 'returned' | 'borrowed') => void;
  activeFilter: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, onFilterClick, activeFilter }) => {
  const chartData = [
    { name: 'Due Soon', value: stats.dueSoon, color: '#f59e0b' },
    { name: 'Overdue', value: stats.overdue, color: '#ef4444' },
    { name: 'Healthy', value: Math.max(0, stats.borrowedCount - stats.dueSoon - stats.overdue), color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">Borrowing Status</h2>
          <p className="text-sm text-slate-500">Real-time overview of library circulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Borrowed"
            value={stats.borrowedCount}
            subtitle="Books currently in circulation"
            icon="📖"
            color="bg-indigo-500"
            onClick={() => onFilterClick('borrowed')}
            isActive={activeFilter === 'borrowed'}
          />
          <StatCard
            title="Due Soon"
            value={stats.dueSoon}
            subtitle="Expiring within 72 hours"
            icon="⏳"
            color="bg-amber-500"
            onClick={() => onFilterClick('dueSoon')}
            isActive={activeFilter === 'dueSoon'}
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            subtitle="Immediate action required"
            icon="🚨"
            color="bg-rose-500"
            onClick={() => onFilterClick('overdue')}
            isActive={activeFilter === 'overdue'}
          />
          <StatCard
            title="Returned History"
            value={stats.returnedThisMonth}
            subtitle="Successfully returned books"
            icon="↩️"
            color="bg-emerald-500"
            onClick={() => onFilterClick('returned')}
            isActive={activeFilter === 'returned'}
          />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[300px]">
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-between text-xs font-medium text-slate-400">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color, onClick, isActive }: any) => (
  <button
    onClick={onClick}
    className={`w-full text-left bg-white p-6 rounded-3xl border transition-all duration-300 flex items-start justify-between group hover:shadow-md hover:scale-[1.02] ${isActive ? 'border-indigo-500 ring-4 ring-indigo-50 ring-opacity-50' : 'border-slate-200'}`}
  >
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1 group-hover:text-slate-700">{title}</p>
      <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
    <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-opacity-20 transition-all`}>
      {icon}
    </div>
  </button>
);

export default Dashboard;
