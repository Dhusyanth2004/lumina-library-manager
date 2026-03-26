import React, { useState } from 'react';
import { Book, BookStatus, UserRole } from '../../types';
import { calculateStructuredFee, formatCurrency } from '../../utils/feeConfig';
import { 
  Search, 
  Library, 
  RefreshCw, 
  Archive, 
  Star, 
  Clock, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  BookOpen, 
  Key,
  AlertCircle,
  Mail,
  ExternalLink,
  User,
  History,
  CheckCircle2,
  XCircle,
  HandshakeIcon
} from 'lucide-react';

interface BookListProps {
  books: Book[];
  onRenew: (id: string) => void;
  onReturn: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (book: Book) => void;
  onReview: (id: string) => void;
  onReserve: (id: string) => void;
  onBorrowRequest: (id: string) => void;
  onApproveReservation?: (id: string) => void;
  onRejectReservation: (id: string) => void;
  onIssueBook: (id: string) => void;
  onEditDueDate: (book: Book) => void;
  onBookClick: (book: Book) => void;
  currentRole: UserRole;
  currentUsername: string;
}

const BookList: React.FC<BookListProps> = React.memo(({
  books, onRenew, onReturn, onDelete, onEdit, onReview, onReserve, onBorrowRequest, onApproveReservation, onRejectReservation, onIssueBook, onEditDueDate, onBookClick, currentRole, currentUsername
}) => {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800/50 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-700/50 animate-in fade-in zoom-in duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-xl shadow-indigo-100/20 border border-indigo-50 dark:border-slate-700">
            <Search className="w-12 h-12 text-indigo-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-xl shadow-lg border-4 border-white dark:border-slate-800">
            <Library className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No books found</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center leading-relaxed">
          We couldn't find any books matching your current filters or search criteria.
          Try adjusting your search term or clearing filters.
        </p>
      </div>
    );
  }

  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(books.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = books.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {paginatedBooks.map(book => (
        <div key={book.id} className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
          <div
            className="flex p-5 gap-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors flex-1"
            onClick={() => onBookClick(book)}
          >
            <div className="w-28 h-40 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden shadow-md relative group/image">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110" />
              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                <StatusBadge status={book.status} />
                {isBookDueSoon(book.dueDate) && book.status === BookStatus.ACTIVE && (
                  <div className="bg-amber-500 text-[9px] font-black text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 uppercase tracking-tighter">
                    <AlertCircle className="w-2.5 h-2.5" /> Due Soon
                  </div>
                )}
                {book.lastAlertSent &&
                  new Date(book.lastAlertSent).toDateString() === new Date().toDateString() &&
                  book.status !== BookStatus.AVAILABLE && (
                    <div className="bg-emerald-500 text-[9px] font-black text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 uppercase tracking-tighter">
                      <Mail className="w-2.5 h-2.5" /> Alert Sent
                    </div>
                  )}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1.5">{book.category}</span>
              <div className="flex items-center gap-2 group/title">
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
                    className="text-lg font-bold text-slate-800 dark:text-white leading-tight truncate mb-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    {book.title}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate mb-0.5">{book.title}</h3>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-1.5">{book.author}</p>

              {/* Star Rating Display */}
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${book.rating && book.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`} />
                ))}
                {book.review && (
                  <span className="ml-2 text-[10px] text-slate-400 italic truncate" title={book.review}>
                    " {book.review.substring(0, 20)}... "
                  </span>
                )}
              </div>
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                  {book.borrower ? (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate flex items-center gap-1.5">
                      <User className="w-3 h-3" /> {book.borrower}
                    </p>
                  ) : book.reservedBy ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold truncate flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {book.reservedBy}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic font-medium">No borrower assigned</p>
                  )}
                </div>
              </div>

              <div className="mt-auto space-y-2.5">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase tracking-wider">Due Date</span>
                    {currentRole === UserRole.ADMIN && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditDueDate(book); }}
                        className="p-1 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        title="Edit Due Date"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className={`${book.status === BookStatus.OVERDUE ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>
                    {book.dueDate ? new Date(book.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(book.dueDate)}`}
                    style={{ width: `${Math.min(100, calculateProgress(book.borrowDate, book.dueDate))}%` }}
                  ></div>
                </div>

                {book.status === BookStatus.OVERDUE && (
                  <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.1em]">Overdue</span>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{calculateOverdueDays(book.dueDate)} Days</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.1em] block">Fine Amount</span>
                      <span className="text-sm font-black text-rose-700 dark:text-rose-400">{formatCurrency(calculateStructuredFee(calculateOverdueDays(book.dueDate)))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 px-5 py-4 flex gap-2.5 border-t border-slate-100 dark:border-slate-700/50">
            {currentRole !== UserRole.STUDENT && (
              <div className="flex gap-2 flex-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onRenew(book.id); }}
                  className="flex-1 py-2.5 px-3 text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all border border-indigo-100 dark:border-indigo-900/50 shadow-sm flex items-center justify-center gap-2 group/btn"
                >
                  <RefreshCw className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500" />
                  Renew
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReturn(book.id); }}
                  className="flex-1 py-2.5 px-3 text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all border border-emerald-100 dark:border-emerald-900/50 shadow-sm flex items-center justify-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Return
                </button>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onReview(book.id); }}
              className="px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm"
              title="Add Review"
            >
              <Star className="w-4 h-4" />
            </button>
            {book.status === BookStatus.AVAILABLE && (
              <button
                onClick={(e) => { e.stopPropagation(); onReserve(book.id); }}
                className="px-4 py-2.5 text-[11px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-200 transition-all shadow-sm flex items-center gap-2"
              >
                <Clock className="w-3.5 h-3.5" />
                Reserve
              </button>
            )}
            {book.status === BookStatus.PENDING_RESERVATION && (
              <div className="flex flex-col w-full gap-2">
                {currentRole !== UserRole.STUDENT && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onApproveReservation?.(book.id); }}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRejectReservation(book.id); }}
                      className="flex-1 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 italic text-center font-medium">
                  {currentRole === UserRole.STUDENT ? "Awaiting Admin Approval" : "Reservation Request"}
                </p>
              </div>
            )}

            {book.status === BookStatus.RESERVED && (
              <div className="flex flex-col w-full gap-2">
                {currentRole !== UserRole.STUDENT ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onIssueBook(book.id); }}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Handover
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold text-center bg-emerald-50 dark:bg-emerald-900/20 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> RESERVED FOR YOU
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); onBorrowRequest(book.id); }}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Request Borrowing
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
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                  >
                    <HandshakeIcon className="w-3.5 h-3.5" /> Approve Handover
                  </button>
                ) : (
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold text-center bg-indigo-50 dark:bg-indigo-900/20 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 italic flex items-center justify-center gap-2">
                    <Clock className="w-3 h-3 animate-spin-slow" /> Awaiting Handover Approval
                  </p>
                )}
              </div>
            )}
            {currentRole === UserRole.ADMIN && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(book); }}
                  className="px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-500 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                  title="Edit Book"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}
                  className="px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                  title="Delete Book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
    
    {totalPages > 1 && (
      <div className="flex justify-center items-center mt-12 gap-3">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Previous
        </button>
        
        <div className="flex gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-[24px]">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first, last, and pages around current
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600'
                  }`}
                >
                  {page}
                </button>
              );
            }
            
            // Show ellipses for gaps
            if (
              (page === 2 && currentPage > 3) || 
              (page === totalPages - 1 && currentPage < totalPages - 2)
            ) {
              return <span key={page} className="flex items-center justify-center w-6 text-slate-400">...</span>;
            }
            
            return null;
          })}
        </div>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm group"
        >
          Next
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    )}
    </div>
  );
});

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
    [BookStatus.PENDING_BORROW]: 'bg-indigo-400',
  };
  return (
    <div className={`${styles[status]} text-[9px] font-black text-white px-2 py-1 rounded-lg shadow-lg uppercase tracking-wider`}>
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
