import React from 'react';
import { Book, BookStatus, UserRole } from '../types';
import { calculateStructuredFee, formatCurrency } from '../utils/feeConfig';

interface BookDetailsModalProps {
    book: Book;
    onClose: () => void;
    onRenew: (id: string) => void;
    onReturn: (id: string) => void;
    onReserve: (id: string) => void;
    onApproveReservation: (id: string) => void;
    onRejectReservation: (id: string) => void;
    onIssueBook: (id: string) => void;
    onBorrowRequest: (id: string) => void;
    onUpdateCover: (id: string, coverUrl: string) => void;
    currentRole: UserRole;
    currentUsername: string;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, onClose, onRenew, onReturn, onReserve, onBorrowRequest, onApproveReservation, onRejectReservation, onIssueBook, onUpdateCover, currentRole, currentUsername }) => {
    const isOverdue = book.status === BookStatus.OVERDUE;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size too large. Please use an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                onUpdateCover(book.id, result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Calculate fine for demonstration (e.g., $0.50 per day overdue)
    const calculateFine = () => {
        if (!isOverdue) return 0;
        const due = new Date(book.dueDate).getTime();
        const now = Date.now();
        const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
        return calculateStructuredFee(diffDays);
    };

    const calculateProgress = () => {
        const s = new Date(book.borrowDate).getTime();
        const e = new Date(book.dueDate).getTime();
        const n = Date.now();
        if (n >= e) return 100;
        const total = e - s;
        const elapsed = n - s;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-md flex items-center justify-center p-4 z-[70]">
            <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row max-h-[90vh]">
                {/* Left Side: Cover Image */}
                <div className="md:w-1/2 bg-slate-100 relative group overflow-hidden">
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                    {/* Change Cover Overlay - Restricted to non-students */}
                    {currentRole !== UserRole.STUDENT && (
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2 border border-white/30 text-2xl">📸</span>
                            <span className="text-white font-bold text-sm tracking-wide">Change Cover</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all md:hidden"
                    >
                        ✕
                    </button>
                </div>

                {/* Right Side: Details */}
                <div className="md:w-1/2 p-8 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="hidden md:flex justify-end mb-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                {book.category}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                {book.language}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{book.title}</h2>
                        <p className="text-lg text-slate-500 font-medium mb-4">{book.author}</p>

                        {book.externalLink && (
                            currentRole !== UserRole.STUDENT ||
                            (
                                (book.status === BookStatus.BORROWED || book.status === BookStatus.ACTIVE || book.status === BookStatus.RENEWED || book.status === BookStatus.OVERDUE) &&
                                book.borrower?.toLowerCase() === currentUsername.toLowerCase()
                            )
                        ) && (
                                <a
                                    href={book.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 mb-4"
                                >
                                    <span>📖</span> View External Resource
                                </a>
                            )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${book.status === BookStatus.AVAILABLE ? 'bg-emerald-500' :
                                    book.status === BookStatus.OVERDUE ? 'bg-rose-500' :
                                        book.status === BookStatus.PENDING_RESERVATION ? 'bg-slate-500' :
                                            'bg-blue-500'
                                    }`}></div>
                                <p className="text-sm font-bold text-slate-700 uppercase">{book.status.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Loan Progress</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {book.dueDate ? `Due ${new Date(book.dueDate).toLocaleDateString()}` : 'No due date set'}
                                    </p>
                                </div>
                                <span className={`text-xs font-bold ${isOverdue ? 'text-rose-500' : 'text-indigo-600'}`}>
                                    {Math.round(calculateProgress())}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${isOverdue ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                    style={{ width: `${calculateProgress()}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Refined Fee Breakdown Section - Visible for all Borrowed books */}
                        {(book.borrower || book.status === BookStatus.OVERDUE) && (
                            <div className="p-5 bg-indigo-50/30 rounded-[24px] border border-indigo-100/50 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${isOverdue ? 'bg-rose-500 shadow-rose-100' : 'bg-indigo-600 shadow-indigo-100'} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                            {isOverdue ? '⌛' : '🛡️'}
                                        </div>
                                        <div>
                                            <p className={`text-[10px] ${isOverdue ? 'text-rose-400' : 'text-indigo-400'} font-black uppercase tracking-widest`}>
                                                {isOverdue ? 'Late Return Fine' : 'Fee Protection'}
                                            </p>
                                            <p className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-indigo-600'}`}>
                                                {isOverdue
                                                    ? `${Math.ceil((Date.now() - new Date(book.dueDate).getTime()) / (1000 * 60 * 60 * 24))} Days Overdue`
                                                    : `Due in ${Math.ceil((new Date(book.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-black ${isOverdue ? 'text-rose-700' : 'text-indigo-700'} leading-none`}>
                                            {formatCurrency(calculateFine() as number)}
                                        </p>
                                        <p className={`text-[9px] ${isOverdue ? 'text-rose-400' : 'text-indigo-400'} font-bold uppercase tracking-[0.05em] mt-1`}>
                                            {isOverdue ? 'Total Accumulated' : 'Current Amount'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {book.borrower && (
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">
                                        👤
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Current Borrower</p>
                                        <p className="text-sm font-bold text-indigo-900">{book.borrower}</p>
                                        {book.borrowerEmail && <p className="text-[10px] text-indigo-500">{book.borrowerEmail}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {book.reservedBy && (
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white text-lg">
                                        ⌛
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Reserved By</p>
                                        <p className="text-sm font-bold text-amber-900">{book.reservedBy}</p>
                                        {book.status === BookStatus.PENDING_RESERVATION && (
                                            <p className="text-[10px] text-amber-500 font-bold uppercase">Awaiting Approval</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {book.review && (
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Member Review</p>
                                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 italic text-sm text-amber-900 relative">
                                    <span className="absolute -top-2 -left-1 text-4xl text-amber-200 opacity-50 font-serif">"</span>
                                    {book.review}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                        {(book.status === BookStatus.BORROWED ||
                            book.status === BookStatus.ACTIVE ||
                            book.status === BookStatus.RENEWED ||
                            book.status === BookStatus.OVERDUE) && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => onRenew(book.id)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
                                    >
                                        🔄 Renew
                                    </button>
                                    <button
                                        onClick={() => onReturn(book.id)}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-sm"
                                    >
                                        ✓ Return Book
                                    </button>
                                </div>
                            )}
                        {book.status === BookStatus.AVAILABLE && (
                            <button
                                onClick={() => onReserve(book.id)}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                            >
                                Reserve Now
                            </button>
                        )}
                        {book.status === BookStatus.PENDING_RESERVATION && (
                            <div className="flex flex-col gap-2">
                                {currentRole !== UserRole.STUDENT && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onApproveReservation(book.id)}
                                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all text-sm"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => onRejectReservation(book.id)}
                                            className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all text-sm"
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-slate-400 text-center italic">
                                    {currentRole === UserRole.STUDENT
                                        ? "Your reservation is awaiting administrative approval."
                                        : "This reservation requires administrative approval."}
                                </p>
                            </div>
                        )}

                        {book.status === BookStatus.RESERVED && (
                            <div className="flex flex-col gap-2">
                                {currentRole !== UserRole.STUDENT ? (
                                    <button
                                        onClick={() => onIssueBook(book.id)}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                    >
                                        Handover Book 📖
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                            <p className="text-emerald-700 font-bold mb-1">✓ RESERVED FOR YOU</p>
                                            <p className="text-xs text-emerald-600 italic">You can now request a formal handover.</p>
                                        </div>
                                        <button
                                            onClick={() => onBorrowRequest(book.id)}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                        >
                                            Request Handover & Borrow 📬
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {book.status === BookStatus.PENDING_BORROW && (
                            <div className="flex flex-col gap-2">
                                {currentRole !== UserRole.STUDENT ? (
                                    <button
                                        onClick={() => onIssueBook(book.id)}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                    >
                                        Approve Handover & Issue 🤝
                                    </button>
                                ) : (
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center animate-pulse">
                                        <p className="text-indigo-700 font-bold mb-1">⌛ REQUEST SENT</p>
                                        <p className="text-xs text-indigo-600 italic">Please visit the library desk for physical handover.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
