import { Book, BookStatus } from '../types';

export const checkAndSendAlerts = (books: Book[]): { updatedBooks: Book[]; alertsSent: number } => {
    const now = new Date();
    const threeDaysAway = new Date();
    threeDaysAway.setDate(now.getDate() + 3);

    let alertsSent = 0;
    const updatedBooks = books.map(book => {
        if (book.status === BookStatus.RETURNED) return book;

        const dueDate = new Date(book.dueDate);
        const isDueSoon = dueDate <= threeDaysAway && dueDate > now;
        const isOverdue = dueDate <= now;

        if (isOverdue && book.status !== BookStatus.OVERDUE) {
            console.log(`%c[Lumina] Auto-detecting OVERDUE: ${book.title}`, "color: #ef4444; font-weight: bold;");
            return {
                ...book,
                status: BookStatus.OVERDUE,
                lastAlertSent: now.toISOString()
            };
        }

        if ((isDueSoon || isOverdue) && !alreadyAlertedToday && book.borrowerEmail) {
            alertsSent++;
            console.log(`%c[Lumina Alert] Sending ${isOverdue ? 'OVERDUE' : 'DUE SOON'} email to ${book.borrowerEmail}`, "color: #4f46e5; font-weight: bold;");
            // ... rest of logic
            return {
                ...book,
                lastAlertSent: now.toISOString()
            };
        }

        return book;
    });

    return { updatedBooks, alertsSent };
};
