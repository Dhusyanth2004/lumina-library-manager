
export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  RESERVED = 'RESERVED',
  PENDING_RESERVATION = 'PENDING_RESERVATION',
  ACTIVE = 'ACTIVE',
  RENEWED = 'RENEWED',
  OVERDUE = 'OVERDUE',
  RETURNED = 'RETURNED',
  PENDING_BORROW = 'PENDING_BORROW'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  status: BookStatus;
  coverUrl: string;
  renewalCount: number;
  category: string;
  language: string;
  notes?: string;
  borrower?: string;
  borrowerEmail?: string;
  reservedBy?: string;
  lastAlertSent?: string;
  rating?: number;
  review?: string;
  externalLink?: string;
}

export interface LibraryStats {
  availableCount: number;
  borrowedCount: number;
  reservedCount: number;
  totalBooks: number;
  dueSoon: number;
  overdue: number;
  returnedThisMonth: number;
  totalUniqueBooks: number;
  activeUsersCount: number;
  overdueUsersCount: number;
  pendingReservationsCount: number;
  totalFines: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  STUDENT = 'STUDENT'
}
