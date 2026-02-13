import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import AddBookModal from './components/AddBookModal';
import UserProfileModal from './components/UserProfileModal';
import ReviewModal from './components/ReviewModal';
import { Book, BookStatus, UserRole, LibraryStats } from './types';
import SearchFilters from './components/SearchFilters';
import EditDueDateModal from './components/EditDueDateModal';
import BookDetailsModal from './components/BookDetailsModal';
import AuthPage from './components/AuthPage';
import { checkAndSendAlerts } from './services/notificationService';
import { calculateStructuredFee } from './utils/feeConfig';
import FeeCalculator from './components/FeeCalculator';
import ApproveReservationModal from './components/ApproveReservationModal';

const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    borrowDate: '2024-06-05',
    dueDate: '2024-06-19',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/alchemist/300/450',
    renewalCount: 0,
    category: 'Fiction',
    language: 'English'
  },
  {
    id: '2',
    title: 'Wings of Fire',
    author: 'A P J Abdul Kalam',
    borrowDate: '2024-06-10',
    dueDate: '2024-06-24',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/wings/300/450',
    renewalCount: 0,
    category: 'Biography',
    language: 'English'
  },
  {
    id: '3',
    title: 'Atomic Habits',
    author: 'James Clear',
    borrowDate: '2024-05-30',
    dueDate: '2024-06-13',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/atomic/300/450',
    renewalCount: 0,
    category: 'Self-Help',
    language: 'English'
  },
  {
    id: '4',
    title: 'Rich Dad Poor Dad',
    author: 'Robert T Kiyosaki',
    borrowDate: '2024-06-15',
    dueDate: '2024-06-29',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/richdad/300/450',
    renewalCount: 0,
    category: 'Finance',
    language: 'English'
  },
  {
    id: '5',
    title: 'Harry Potter and the Philosophers Stone',
    author: 'J K Rowling',
    borrowDate: '2024-06-20',
    dueDate: '2024-07-04',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/hp1/300/450',
    renewalCount: 0,
    category: 'Fantasy',
    language: 'English'
  },
  {
    id: '6',
    title: 'Clean Code',
    author: 'Robert C Martin',
    borrowDate: '2024-06-25',
    dueDate: '2024-07-09',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/cleancode/300/450',
    renewalCount: 0,
    category: 'Technology',
    language: 'English'
  },
  {
    id: '7',
    title: 'Ponniyin Selvan',
    author: 'Kalki Krishnamurthy',
    borrowDate: '2024-07-01',
    dueDate: '2024-07-15',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/ponniyin/300/450',
    renewalCount: 0,
    category: 'Historical Fiction',
    language: 'Tamil'
  },
  {
    id: '8',
    title: 'Thirukkural',
    author: 'Thiruvalluvar',
    borrowDate: '2024-07-05',
    dueDate: '2024-07-19',
    status: BookStatus.AVAILABLE,
    coverUrl: 'https://picsum.photos/seed/thirukkural/300/450',
    renewalCount: 0,
    category: 'Ethics',
    language: 'Tamil'
  }
];

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'dueSoon' | 'returned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookForModal, setSelectedBookForModal] = useState<Partial<Book> | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedBookForReview, setSelectedBookForReview] = useState<Book | null>(null);
  const [selectedBookForDueDate, setSelectedBookForDueDate] = useState<Book | null>(null);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => (localStorage.getItem('lumina_role') as UserRole) || UserRole.ADMIN);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('lumina_auth') === 'true');
  const [username, setUsername] = useState(() => localStorage.getItem('lumina_user') || '');
  const [isFeeCalculatorOpen, setIsFeeCalculatorOpen] = useState(false);
  const [selectedBookForApproval, setSelectedBookForApproval] = useState<Book | null>(null);

  const API_URL = '/api';

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && books.length > 0) {
      const { updatedBooks, alertsSent } = checkAndSendAlerts(books);
      if (alertsSent > 0) {
        // We only update if status changed or alert sent
        // Actually checkAndSendAlerts only returns books that were updated with lastAlertSent or OVERDUE status
        // We should only update the server for those specific books
        updatedBooks.forEach(updatedBook => {
          const originalBook = books.find(b => b.id === updatedBook.id);
          if (originalBook && (originalBook.status !== updatedBook.status || originalBook.lastAlertSent !== updatedBook.lastAlertSent)) {
            updateBookOnServer(updatedBook.id, {
              status: updatedBook.status,
              lastAlertSent: updatedBook.lastAlertSent
            });
          }
        });
      }
    }
  }, [books, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchBooks();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('lumina_auth', isAuthenticated.toString());
    localStorage.setItem('lumina_user', username);
    localStorage.setItem('lumina_role', currentRole);
  }, [isAuthenticated, username, currentRole]);

  const stats: LibraryStats = useMemo(() => {
    const now = new Date();
    const threeDaysAway = new Date();
    threeDaysAway.setDate(now.getDate() + 3);

    return {
      totalBooks: books.length,
      availableCount: books.filter(b => b.status === BookStatus.AVAILABLE).length,
      borrowedCount: books.filter(b => b.status === BookStatus.BORROWED || b.status === BookStatus.ACTIVE || b.status === BookStatus.RENEWED || b.status === BookStatus.OVERDUE).length,
      reservedCount: books.filter(b => b.status === BookStatus.RESERVED).length,
      pendingReservationsCount: books.filter(b => b.status === BookStatus.PENDING_RESERVATION).length,
      dueSoon: books.filter(b => {
        if (!b.dueDate) return false;
        const d = new Date(b.dueDate);
        return d > now && d <= threeDaysAway && b.status !== BookStatus.AVAILABLE;
      }).length,
      overdue: books.filter(b => b.status === BookStatus.OVERDUE).length,
      returnedThisMonth: books.filter(b => b.status === BookStatus.AVAILABLE && !b.borrower).length,
      totalUniqueBooks: new Set(books.map(b => b.title)).size,
      activeUsersCount: new Set(books.filter(b => b.borrower).map(b => b.borrower!.toLowerCase())).size,
      overdueUsersCount: new Set(books.filter(b => b.status === BookStatus.OVERDUE && b.borrower).map(b => b.borrower!.toLowerCase())).size,
      totalFines: books.reduce((acc, book) => {
        if (book.status !== BookStatus.OVERDUE || !book.dueDate) return acc;
        const d = new Date(book.dueDate).getTime();
        const now = Date.now();
        const diffDays = Math.ceil((now - d) / (1000 * 60 * 60 * 24));
        return acc + calculateStructuredFee(diffDays);
      }, 0)
    };
  }, [books]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookForModal(null);
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBookForDetails(book);
  };

  const updateBookOnServer = async (id: string, updates: Partial<Book>) => {
    try {
      const resp = await fetch(`${API_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (resp.ok) fetchBooks();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleAddBook = async (newBook: Book) => {
    const bookWithStatus = {
      ...newBook,
      status: newBook.borrower ? BookStatus.BORROWED : BookStatus.AVAILABLE
    };
    try {
      await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookWithStatus)
      });
      fetchBooks();
      setIsModalOpen(false);
      setSelectedBookForModal(null);
    } catch (error) {
      console.error('Add failed:', error);
    }
  };

  const handleBulkAdd = async (newBooks: Book[]) => {
    for (const book of newBooks) {
      await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
    }
    fetchBooks();
    setIsModalOpen(false);
  };

  const handleRenew = (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return;
    const currentDueDate = book.dueDate ? new Date(book.dueDate) : new Date();
    const newDueDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    updateBookOnServer(id, {
      dueDate: newDueDate,
      renewalCount: (book.renewalCount || 0) + 1,
      status: BookStatus.BORROWED
    });
  };

  const handleReturn = (id: string) => {
    updateBookOnServer(id, {
      status: BookStatus.AVAILABLE,
      borrower: undefined,
      borrowerEmail: undefined,
      dueDate: '',
      borrowDate: '',
      lastAlertSent: undefined
    });
  };

  const handleReserve = (id: string) => {
    updateBookOnServer(id, {
      status: currentRole === UserRole.STUDENT ? BookStatus.PENDING_RESERVATION : BookStatus.RESERVED,
      reservedBy: username
    });
  };

  const handleApproveReservation = (id: string) => {
    updateBookOnServer(id, { status: BookStatus.RESERVED });
  };

  const handleBorrowRequest = (id: string) => {
    updateBookOnServer(id, { status: BookStatus.PENDING_BORROW });
  };

  const handleIssueBook = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      if (book.status === BookStatus.PENDING_BORROW || book.status === BookStatus.RESERVED) {
        setSelectedBookForApproval(book);
      }
    }
  };

  const handleFinalizeApproval = (id: string, dueDate: string, borrowerEmail: string) => {
    const book = books.find(b => b.id === id);
    updateBookOnServer(id, {
      status: BookStatus.BORROWED,
      dueDate,
      borrower: book?.reservedBy,
      borrowerEmail,
      borrowDate: new Date().toISOString().split('T')[0],
      reservedBy: undefined
    });
    setSelectedBookForApproval(null);
  };

  const handleRejectReservation = (id: string) => {
    updateBookOnServer(id, { status: BookStatus.AVAILABLE, reservedBy: undefined });
  };

  const handleUpdateDueDate = (id: string, newDate: string) => {
    const isOverdue = new Date(newDate).getTime() < Date.now();
    updateBookOnServer(id, {
      dueDate: newDate,
      status: isOverdue ? BookStatus.OVERDUE : BookStatus.BORROWED
    });
    setSelectedBookForDueDate(null);
  };

  const handleDeleteBook = async (id: string) => {
    const bookToDelete = books.find(b => b.id === id);
    if (window.confirm(`Are you sure you want to permanently remove "${bookToDelete?.title}"?`)) {
      try {
        await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });
        fetchBooks();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleSaveReview = (rating: number, review: string) => {
    if (selectedBookForReview) {
      updateBookOnServer(selectedBookForReview.id, { review, rating });
    }
    setSelectedBookForReview(null);
  };

  const handleLogin = (role: UserRole, user: string) => {
    setCurrentRole(role);
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    localStorage.removeItem('lumina_auth');
    localStorage.removeItem('lumina_user');
    localStorage.removeItem('lumina_role');
  };

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      // Search Filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = b.title.toLowerCase().includes(searchLower) ||
        b.author.toLowerCase().includes(searchLower) ||
        b.category.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Field Filters
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (languageFilter !== 'all' && b.language !== languageFilter) return false;

      // Status Filters
      if (filter === 'all') return true;
      if (filter === 'available') return b.status === BookStatus.AVAILABLE;
      if (filter === 'borrowed') return b.status === BookStatus.BORROWED || b.status === BookStatus.ACTIVE || b.status === BookStatus.RENEWED || b.status === BookStatus.OVERDUE;
      if (filter === 'overdue') return b.status === BookStatus.OVERDUE;
      if (filter === 'returned') return b.status === BookStatus.AVAILABLE && !b.borrower;
      if (filter === 'reserved') return b.status === BookStatus.RESERVED || b.status === BookStatus.PENDING_RESERVATION;
      if (filter === 'dueSoon') {
        const now = new Date();
        const threeDaysAway = new Date();
        threeDaysAway.setDate(now.getDate() + 3);
        const d = new Date(b.dueDate);
        return d > now && d <= threeDaysAway && b.status !== BookStatus.AVAILABLE;
      }
      return true;
    });
  }, [books, searchTerm, categoryFilter, languageFilter, filter]);

  const uniqueBorrowers = useMemo(() => {
    return Array.from(new Set(books
      .filter(b => b.borrower)
      .map(b => b.borrower!.trim())
    )).sort();
  }, [books]);

  const allCategories = useMemo(() => Array.from(new Set(books.map(b => b.category))).sort(), [books]);
  const allLanguages = useMemo(() => Array.from(new Set(books.map(b => b.language))).sort(), [books]);

  const handleUpdateBookCover = (id: string, coverUrl: string) => {
    updateBookOnServer(id, { coverUrl });
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
      <Sidebar
        activeFilter={filter as any}
        onFilterChange={setFilter as any}
        onAddClick={() => setIsModalOpen(true)}
        onBookClick={handleBookSelect}
        onUserClick={setSelectedUser}
        books={books}
        stats={stats}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onLogout={handleLogout}
        username={username}
        onFeeCalculatorClick={() => setIsFeeCalculatorOpen(true)}
      />

      <main className="flex-1 p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-serif text-slate-900">Library Insights</h1>
          <p className="text-slate-500">Welcome back! Here's the current status of your borrowings.</p>
        </header>

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          selectedLanguage={languageFilter}
          onLanguageChange={setLanguageFilter}
          categories={allCategories}
          languages={allLanguages}
        />

        <Dashboard stats={stats} onFilterClick={setFilter} activeFilter={filter} />

        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Your Books</h2>
            {currentRole !== UserRole.STUDENT && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-2"
              >
                <span>+</span> Add New Book
              </button>
            )}
          </div>

          <BookList
            books={filteredBooks}
            onRenew={handleRenew}
            onReturn={handleReturn}
            onDelete={handleDeleteBook}
            onReview={(id) => setSelectedBookForReview(books.find(b => b.id === id) || null)}
            onReserve={handleReserve}
            onBorrowRequest={handleBorrowRequest}
            onApproveReservation={handleApproveReservation}
            onRejectReservation={handleRejectReservation}
            onEditDueDate={setSelectedBookForDueDate}
            onBookClick={setSelectedBookForDetails}
            onIssueBook={handleIssueBook}
            currentRole={currentRole}
            currentUsername={username}
          />
        </div>
      </main>

      {isModalOpen && (
        <AddBookModal
          onClose={handleCloseModal}
          onSave={handleAddBook}
          onBulkSave={handleBulkAdd}
          initialData={selectedBookForModal || undefined}
          books={books}
          currentRole={currentRole}
        />
      )}

      {selectedBookForDueDate && (
        <EditDueDateModal
          book={selectedBookForDueDate}
          onClose={() => setSelectedBookForDueDate(null)}
          onSave={handleUpdateDueDate}
        />
      )}

      {selectedBookForDetails && (
        <BookDetailsModal
          book={selectedBookForDetails}
          onClose={() => setSelectedBookForDetails(null)}
          onRenew={handleRenew}
          onReturn={handleReturn}
          onReserve={handleReserve}
          onBorrowRequest={handleBorrowRequest}
          onApproveReservation={handleApproveReservation}
          onRejectReservation={handleRejectReservation}
          onIssueBook={handleIssueBook}
          onUpdateCover={handleUpdateBookCover}
          currentRole={currentRole}
          currentUsername={username}
        />
      )}

      {selectedUser && (
        <UserProfileModal
          userName={selectedUser}
          allUsers={uniqueBorrowers}
          onUserChange={setSelectedUser}
          books={books}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {selectedBookForReview && (
        <ReviewModal
          book={selectedBookForReview}
          onClose={() => setSelectedBookForReview(null)}
          onSave={handleSaveReview}
        />
      )}

      {isFeeCalculatorOpen && (
        <FeeCalculator onClose={() => setIsFeeCalculatorOpen(false)} />
      )}

      {selectedBookForApproval && (
        <ApproveReservationModal
          book={selectedBookForApproval}
          onClose={() => setSelectedBookForApproval(null)}
          onConfirm={handleFinalizeApproval}
        />
      )}
    </div>
  );
};

export default App;
