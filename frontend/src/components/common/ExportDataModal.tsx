import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Book } from '../../types';
import { X, Download, FileText, BarChart, Database, Filter } from 'lucide-react';

interface ExportDataModalProps {
  books: Book[];
  onClose: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ books, onClose }) => {
  const [format, setFormat] = useState<'excel' | 'csv'>('excel');
  const [dataScope, setDataScope] = useState<'all' | 'available' | 'borrowed'>('all');

  const handleExport = () => {
    let filteredBooks = books;
    if (dataScope === 'available') {
      filteredBooks = books.filter(b => b.status === 'AVAILABLE');
    } else if (dataScope === 'borrowed') {
      filteredBooks = books.filter(b => b.status === 'BORROWED' || b.status === 'OVERDUE');
    }

    const exportData = filteredBooks.map(book => ({
      Title: book.title,
      Author: book.author,
      Category: book.category,
      Status: book.status,
      Borrower: book.borrower || 'None',
      DueDate: book.dueDate || 'N/A',
      RenewalCount: book.renewalCount
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Library Books");

    if (format === 'excel') {
      XLSX.writeFile(workbook, `Lumina_Library_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `Lumina_Library_Export_${new Date().toISOString().split('T')[0]}.csv`);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-[48px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-200 dark:border-slate-700">
        <div className="px-8 py-7 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Export Data</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-slate-400" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Data Scope</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'all', label: 'All Library' },
                { id: 'available', label: 'Available' },
                { id: 'borrowed', label: 'Borrowed' }
              ].map(scope => (
                <button
                  key={scope.id}
                  onClick={() => setDataScope(scope.id as any)}
                  className={`py-4 px-2 rounded-[24px] text-[11px] font-black transition-all border-2 flex flex-col items-center gap-2 ${
                    dataScope === scope.id 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="uppercase tracking-tighter">{scope.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-slate-400" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Export Format</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'excel', label: 'Excel Sheet', icon: <BarChart className="w-6 h-6" /> },
                { id: 'csv', label: 'CSV File', icon: <FileText className="w-6 h-6" /> }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as any)}
                  className={`py-8 px-4 rounded-[32px] text-xs font-black transition-all border-2 flex flex-col items-center justify-center gap-3 ${
                    format === f.id 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${format === f.id ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    {f.icon}
                  </div>
                  <span className="uppercase tracking-widest">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleExport}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 group"
            >
               <span>Download Data</span>
               <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-6 font-medium italic">
              * Your export will include title, author, category, and borrow status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal;
