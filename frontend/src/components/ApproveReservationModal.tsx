import React, { useState } from 'react';
import { Book } from '../types';

interface ApproveReservationModalProps {
    book: Book;
    onClose: () => void;
    onConfirm: (id: string, dueDate: string, borrowerEmail: string) => void;
}

const ApproveReservationModal: React.FC<ApproveReservationModalProps> = ({ book, onClose, onConfirm }) => {
    const [dueDate, setDueDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 14); // Default to 14 days from now
        return date.toISOString().split('T')[0];
    });
    const [borrowerEmail, setBorrowerEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(book.id, dueDate, borrowerEmail);
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Approve Reservation</h2>
                        <p className="text-xs text-slate-500 truncate max-w-[250px]">Setting up loan for: {book.title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-full">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Requester</p>
                        <p className="text-sm font-bold text-slate-700">👤 {book.reservedBy}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Borrower Email (Optional)</label>
                        <input
                            type="email"
                            value={borrowerEmail}
                            onChange={(e) => setBorrowerEmail(e.target.value)}
                            className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-4 text-sm font-medium shadow-inner transition-all"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-4 text-sm font-medium shadow-inner transition-all"
                            required
                        />
                        <p className="mt-2 text-[10px] text-slate-400">
                            Standard 14-day loan period set by default.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all hover:-translate-y-0.5"
                        >
                            Confirm Loan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApproveReservationModal;
