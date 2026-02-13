
import React from 'react';
import { Book, BookStatus, UserRole } from '../types';
import { calculateStructuredFee, formatCurrency } from '../utils/feeConfig';

interface BookListProps {
  books: Book[];
  onRenew: (id: string) => void;
  onReturn: (id: string) => void;
  onDelete: (id: string) => void;
  onReview: (id: string) => void;
  onReserve: (id: string) => void; // Added onReserve to props interface
  onBorrowRequest: (id: string) => void;
  onApproveReservation?: (id: string) => void;
  onRejectReservation: (id: string) => void;
  onIssueBook: (id: string) => void;
  onEditDueDate: (book: Book) => void;
  onBookClick: (book: Book) => void;
  currentRole: UserRole;
  currentUsername: string;
}

const BookList: React.FC<BookListProps> = ({
  books, onRenew, onReturn, onDelete, onReview, onReserve, onBorrowRequest, onApproveReservation, onRejectReservation, onIssueBook, onEditDueDate, onBookClick, currentRole, currentUsername
}) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
        <p className="text-slate-400">No books found matching this filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {books.map(book => (
        <div key={book.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div
            className="flex p-4 gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors flex-1"
            onClick={() => onBookClick(book)}
          >
            <div className="w-28 h-40 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden shadow-sm relative group">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <StatusBadge status={book.status} />
                {isBookDueSoon(book.dueDate) && book.status === BookStatus.ACTIVE && (
                  <div className="bg-amber-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                    <span>⚠️</span> Due Soon
                  </div>
                )}
                {book.lastAlertSent &&
                  new Date(book.lastAlertSent).toDateString() === new Date().toDateString() &&
                  book.status !== BookStatus.AVAILABLE && (
                    <div className="bg-emerald-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                      <span>📧</span> Alert Sent
                    </div>
                  )}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{book.category}</span>
              <div className="flex items-center gap-2 group/title translate-y-[-2px]">
                {book.externalLink && (
                  currentRole !== UserRole.STUDENT ||
                  (
                    (book.status === BookStatus.BORROWED || book.status === BookStatus.ACTIVE || book.status === BookStatus.RENEWED || book.status === BookStatus.OVERDUE) &&
                    book.borrower?.toLowerCase() === currentUsername.toLowerCase()
                  )
                ) ? (
                  <a
                    href={book.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-lg font-bold text-slate-800 leading-tight truncate mb-0.5 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                  >
                    {book.title}
                    <span className="text-[10px] opacity-0 group-hover/title:opacity-100 transition-opacity">🔗</span>
                  </a>
                ) : (
                  <h3 className="text-lg font-bold text-slate-900 leading-tight truncate mb-0.5">{book.title}</h3>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate mb-1">{book.author}</p>

              {/* Star Rating Display */}
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-xs ${book.rating && book.rating >= s ? 'text-amber-400' : 'text-slate-200'}`}>
                    ★
                  </span>
                ))}
                {book.review && (
                  <span className="ml-2 text-[10px] text-slate-400 italic truncate" title={book.review}>
                    " {book.review.substring(0, 20)}... "
                  </span>
                )}
              </div>
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0">
                  {book.borrower ? (
                    <p className="text-xs text-indigo-600 font-medium truncate">👤 {book.borrower}</p>
                  ) : book.reservedBy ? (
                    <p className="text-xs text-amber-600 font-medium truncate">⌛ {book.reservedBy}</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No borrower assigned</p>
                  )}
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Due Date</span>
                    {currentRole === UserRole.ADMIN && (
                      <button
                        onClick={() => onEditDueDate(book)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-600 transition-colors"
                        title="Edit Due Date"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                  <span className={`font-semibold ${book.status === BookStatus.OVERDUE ? 'text-rose-600' : 'text-slate-700'}`}>
                    {book.dueDate ? new Date(book.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(book.dueDate)}`}
                    style={{ width: `${Math.min(100, calculateProgress(book.borrowDate, book.dueDate))}%` }}
                  ></div>
                </div>

                {book.status === BookStatus.OVERDUE && (
                  <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.1em]">Overdue</span>
                      <span className="text-[10px] font-bold text-rose-600">{calculateOverdueDays(book.dueDate)} Days</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.1em] block">Fine Amount</span>
                      <span className="text-sm font-black text-rose-700">{formatCurrency(calculateStructuredFee(calculateOverdueDays(book.dueDate)))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-4 py-3 flex gap-2">
            {currentRole !== UserRole.STUDENT && (
              <div className="flex gap-2 flex-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onRenew(book.id); }}
                  className="flex-1 py-2 px-3 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  🔄 Renew
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReturn(book.id); }}
                  className="flex-1 py-2 px-3 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100"
                >
                  📦 Return
                </button>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onReview(book.id); }}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
              title="Add Review"
            >
              ⭐
            </button>
            {book.status === BookStatus.AVAILABLE && (
              <button
                onClick={(e) => { e.stopPropagation(); onReserve(book.id); }}
                className="px-3 py-2 text-xs font-semibold bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all"
                title="Reserve Book"
              >
                ⌛ Reserve
              </button>
            )}
            {book.status === BookStatus.PENDING_RESERVATION && (
              <div className="flex flex-col w-full gap-2">
                {currentRole !== UserRole.STUDENT && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onApproveReservation?.(book.id); }}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRejectReservation(book.id); }}
                      className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 italic text-center">
                  {currentRole === UserRole.STUDENT ? "Awaiting Admin Approval" : "Reservation Request"}
                </p>
              </div>
            )}

            {book.status === BookStatus.RESERVED && (
              <div className="flex flex-col w-full gap-2">
                {currentRole !== UserRole.STUDENT ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onIssueBook(book.id); }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    Handover 📖
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-emerald-600 font-bold text-center bg-emerald-50 py-2 rounded-xl border border-emerald-100">
                      ✓ RESERVED FOR YOU
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); onBorrowRequest(book.id); }}
                      className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                      Request Borrowing 📬
                    </button>
                  </div>
                )}
              </div>
            )}

            {book.status === BookStatus.PENDING_BORROW && (
              <div className="flex flex-col w-full gap-2">
                {currentRole !== UserRole.STUDENT ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onIssueBook(book.id); }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    Approve Handover 🤝
                  </button>
                ) : (
                  <p className="text-[10px] text-indigo-600 font-bold text-center bg-indigo-50 py-2 rounded-xl border border-indigo-100 italic">
                    ⌛ Awaiting Handover Approval
                  </p>
                )}
              </div>
            )}
            {currentRole === UserRole.ADMIN && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}
                className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-rose-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all ml-auto"
                title="Delete Book"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: BookStatus }) => {
  const styles = {
    [BookStatus.AVAILABLE]: 'bg-emerald-500',
    [BookStatus.BORROWED]: 'bg-blue-500',
    [BookStatus.RESERVED]: 'bg-amber-500',
    [BookStatus.PENDING_RESERVATION]: 'bg-slate-500',
    [BookStatus.ACTIVE]: 'bg-blue-500',
    [BookStatus.RENEWED]: 'bg-indigo-500',
    [BookStatus.OVERDUE]: 'bg-rose-500',
    [BookStatus.RETURNED]: 'bg-emerald-500',
  };
  return (
    <div className={`${styles[status]} text-[10px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm`}>
      {status}
    </div>
  );
};

const isBookDueSoon = (dueDate: string) => {
  if (!dueDate) return false;
  const d = new Date(dueDate).getTime();
  const now = Date.now();
  const diff = d - now;
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};

const calculateProgress = (start: string, end: string) => {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const n = Date.now();
  if (n >= e) return 100;
  const total = e - s;
  const elapsed = n - s;
  return (elapsed / total) * 100;
};

const getProgressColor = (dueDate: string) => {
  if (!dueDate) return 'bg-blue-500';
  const d = new Date(dueDate).getTime();
  const now = Date.now();
  const diff = d - now;
  if (diff < 0) return 'bg-rose-500';
  if (diff < 3 * 24 * 60 * 60 * 1000) return 'bg-amber-500';
  return 'bg-blue-500';
};

const calculateOverdueDays = (dueDate: string) => {
  if (!dueDate) return 0;
  const d = new Date(dueDate).getTime();
  const now = Date.now();
  if (now <= d) return 0;
  return Math.ceil((now - d) / (1000 * 60 * 60 * 24));
};

export default BookList;
