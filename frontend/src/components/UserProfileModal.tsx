import React from 'react';
import { Book, BookStatus } from '../types';

interface UserProfileModalProps {
    userName: string;
    allUsers: string[];
    onUserChange: (userName: string) => void;
    books: Book[];
    onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userName, allUsers, onUserChange, books, onClose }) => {
    const userBooks = books.filter(b => b.borrower?.trim().toLowerCase() === userName.trim().toLowerCase());
    const activeLoans = userBooks.filter(b => b.status !== BookStatus.RETURNED);
    const borrowHistory = userBooks.filter(b => b.status === BookStatus.RETURNED);

    const currentIndex = allUsers.indexOf(userName);

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % allUsers.length;
        onUserChange(allUsers[nextIndex]);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + allUsers.length) % allUsers.length;
        onUserChange(allUsers[prevIndex]);
    };

    const calculateFines = (book: Book) => {
        if (book.status !== BookStatus.OVERDUE) return 0;
        const due = new Date(book.dueDate).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - due);
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return days * 1; // $1 per day
    };

    const totalFines = activeLoans.reduce((sum, b) => sum + calculateFines(b), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">👤</div>
                                <h2 className="text-3xl font-serif text-slate-900 animate-in slide-in-from-right-4 duration-300" key={userName}>{userName}</h2>
                            </div>

                            {allUsers.length > 1 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrev}
                                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
                                        title="Previous User"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
                                        title="Next User"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-slate-500">Member Profile & Borrowing History (User {currentIndex + 1} of {allUsers.length})</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 ml-4">✕</button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-2xl">
                            <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">Active Loans</p>
                            <p className="text-2xl font-bold text-indigo-900">{activeLoans.length}</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl">
                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Past Books</p>
                            <p className="text-2xl font-bold text-emerald-900">{borrowHistory.length}</p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-2xl">
                            <p className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">Pending Fines</p>
                            <p className="text-2xl font-bold text-rose-900">${totalFines.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Active Loans */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Active Loans</h3>
                        <div className="space-y-3">
                            {activeLoans.map(book => (
                                <div key={book.id} className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{book.title}</p>
                                        <p className="text-xs text-slate-500">Due: {new Date(book.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    {book.status === BookStatus.OVERDUE && (
                                        <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-md">
                                            Fine: ${calculateFines(book).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {activeLoans.length === 0 && <p className="text-sm text-slate-400 italic">No active loans.</p>}
                        </div>
                    </div>

                    {/* Borrow History */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Borrow History</h3>
                        <div className="space-y-3">
                            {borrowHistory.map(book => (
                                <div key={book.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl opacity-75">
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-700 truncate">{book.title}</p>
                                        <p className="text-[10px] text-slate-400">Author: {book.author}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Returned</span>
                                </div>
                            ))}
                            {borrowHistory.length === 0 && <p className="text-sm text-slate-400 italic">No history found.</p>}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
