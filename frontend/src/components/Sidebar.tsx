import React, { useState } from 'react';
import { Book, LibraryStats, UserRole } from '../types';

interface SidebarProps {
  activeFilter: 'all' | 'available' | 'borrowed' | 'overdue' | 'reserved' | 'returned';
  onFilterChange: (f: 'all' | 'available' | 'borrowed' | 'overdue' | 'reserved' | 'returned') => void;
  onAddClick: () => void;
  onBookClick: (book: Book) => void;
  onUserClick: (userName: string) => void;
  onLogout: () => void;
  books: Book[];
  stats: LibraryStats;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  username: string;
  onFeeCalculatorClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeFilter, onFilterChange, onAddClick, onBookClick, onUserClick, onLogout, books, stats, currentRole, onRoleChange, username, onFeeCalculatorClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [isProfilesExpanded, setIsProfilesExpanded] = useState(false);

  const uniqueBorrowers = Array.from(new Set(books
    .filter(b => b.borrower)
    .map(b => b.borrower!.trim())
  )).sort();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-auto md:h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-2xl">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">L</div>
          <span className="font-serif tracking-tight">Lumina</span>
        </div>
      </div>

      {currentRole === UserRole.ADMIN && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setIsAdminExpanded(!isAdminExpanded)}
            className="flex items-center justify-between w-full text-left group"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Admin Dashboard</p>
            <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isAdminExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${isAdminExpanded ? 'max-h-80 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Total Books</span>
                <span className="text-sm font-bold text-slate-800">{stats.totalUniqueBooks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Active Users</span>
                <span className="text-sm font-bold text-indigo-600">{stats.activeUsersCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Overdue Users</span>
                <span className="text-sm font-bold text-rose-500">{stats.overdueUsersCount}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Total Fines</span>
                <span className="text-sm font-black text-rose-600">₹{stats.totalFines.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsProfilesExpanded(!isProfilesExpanded)}
                  className="flex items-center justify-between w-full group"
                >
                  <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">→ User Profiles</span>
                  <span className={`text-[8px] text-indigo-400 transition-transform ${isProfilesExpanded ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isProfilesExpanded ? 'max-h-64 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-56 custom-scrollbar">
                    {uniqueBorrowers.map(name => (
                      <button
                        key={name}
                        onClick={() => onUserClick(name)}
                        className="text-left text-[11px] text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-white transition-all truncate"
                      >
                        👤 {name}
                      </button>
                    ))}
                    {uniqueBorrowers.length === 0 && <p className="text-[10px] text-slate-400 italic px-2">No users yet</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
        {[
          { id: 'all', label: 'Dashboard', icon: '📊' },
          { id: 'available', label: 'Available', icon: '✅' },
          { id: 'borrowed', label: 'Borrowed', icon: '📖' },
          { id: 'overdue', label: 'Overdue', icon: '⚠️' },
          { id: 'reserved', label: 'Reserved', icon: '⏳' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id as any)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeFilter === item.id
              ? 'bg-indigo-50 text-indigo-600 font-medium'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          onClick={onFeeCalculatorClick}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-600 hover:bg-slate-50 mt-1 shadow-sm border border-slate-100"
        >
          <span className="text-lg">₹</span>
          <span className="font-medium">Fee Calculator</span>
        </button>
      </nav>

      <div className="flex flex-col gap-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left group"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Book Details</p>
          <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-64 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
            {books.map(book => (
              <button
                key={book.id}
                onClick={() => onBookClick(book)}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 border-l-2 border-transparent hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
              >
                <span className="font-medium group-hover:text-indigo-600 transition-colors block truncate">{book.title}</span>
                <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">{book.category}</span>
              </button>
            ))}
            {books.length === 0 && <p className="px-4 text-xs text-slate-400 italic">No books yet</p>}
          </nav>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              {username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{username || 'User'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentRole}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
          >
            ↪ Sign Out
          </button>
        </div>

        {currentRole !== UserRole.STUDENT && (
          <div className="p-4 bg-indigo-600 rounded-2xl text-white">
            <h3 className="font-semibold mb-2">Pro Member</h3>
            <p className="text-xs text-indigo-100 mb-4">Unlimited book tracking and AI insights enabled.</p>
            <button
              onClick={onAddClick}
              className="w-full bg-white text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
            >
              Quick Add
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
