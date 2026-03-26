const Book = require('../models/Book');
const BorrowedBook = require('../models/BorrowedBook');
const ReservedBook = require('../models/ReservedBook');

exports.getAllBooks = async (options = {}) => {
    const { page = 1, limit = 100 } = options;
    const skip = (page - 1) * limit;
    
    const books = await Book.find()
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await Book.countDocuments();
    
    return {
        books,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    };
};

exports.createBook = async (bookData) => {
    const book = new Book(bookData);
    return await book.save();
};

exports.updateBookById = async (id, bookData) => {
    // 1. Get the current book state before update
    const currentBook = await Book.findById(id);
    if (!currentBook) return null;

    // 2. Handle field removal (Mongoose findByIdAndUpdate doesn't remove fields if they are undefined in the object)
    // If the frontend sends null or empty string for borrower/reservedBy, we should ensure they are cleaned up.
    const update = { ...bookData };

    // Explicitly handle unset logic if values are null or empty
    const unsetFields = {};
    if (update.borrower === null || update.borrower === undefined && 'borrower' in bookData) {
        unsetFields.borrower = 1;
        delete update.borrower;
    }
    if (update.borrowerEmail === null || update.borrowerEmail === undefined && 'borrowerEmail' in bookData) {
        unsetFields.borrowerEmail = 1;
        delete update.borrowerEmail;
    }
    if (update.reservedBy === null || update.reservedBy === undefined && 'reservedBy' in bookData) {
        unsetFields.reservedBy = 1;
        delete update.reservedBy;
    }
    if ((update.borrowDate === null || update.borrowDate === "") && 'borrowDate' in bookData) {
        unsetFields.borrowDate = 1;
        delete update.borrowDate;
    }
    if ((update.dueDate === null || update.dueDate === "") && 'dueDate' in bookData) {
        unsetFields.dueDate = 1;
        delete update.dueDate;
    }

    const query = { ...update };
    if (Object.keys(unsetFields).length > 0) {
        query.$unset = unsetFields;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, query, { new: true });

    // 3. Handle Transaction Storage (Persistent Records)
    if (updatedBook) {
        // If status changed to BORROWED or related active states
        if (['BORROWED', 'ACTIVE', 'RENEWED', 'OVERDUE'].includes(updatedBook.status) && updatedBook.borrower) {
            await BorrowedBook.findOneAndUpdate(
                { bookId: updatedBook._id, borrower: updatedBook.borrower, status: { $ne: 'RETURNED' } },
                {
                    bookTitle: updatedBook.title,
                    borrower: updatedBook.borrower,
                    borrowerEmail: updatedBook.borrowerEmail,
                    dueDate: updatedBook.dueDate ? new Date(updatedBook.dueDate) : undefined,
                    borrowDate: updatedBook.borrowDate ? new Date(updatedBook.borrowDate) : new Date(),
                    status: updatedBook.status
                },
                { upsert: true, new: true }
            );
        }

        // If status changed to RESERVED or PENDING_RESERVATION
        if (['RESERVED', 'PENDING_RESERVATION'].includes(updatedBook.status) && updatedBook.reservedBy) {
            await ReservedBook.findOneAndUpdate(
                { bookId: updatedBook._id, reservedBy: updatedBook.reservedBy, status: { $in: ['RESERVED', 'PENDING_RESERVATION'] } },
                {
                    bookTitle: updatedBook.title,
                    reservedBy: updatedBook.reservedBy,
                    status: updatedBook.status,
                    reservationDate: new Date()
                },
                { upsert: true, new: true }
            );
        }

        // Handle Return
        if (updatedBook.status === 'AVAILABLE' && !updatedBook.borrower) {
            // Check if there was an active borrow record for this book
            await BorrowedBook.updateMany(
                { bookId: updatedBook._id, status: { $ne: 'RETURNED' } },
                { status: 'RETURNED', returnDate: new Date() }
            );

            // Check if there was an active reservation record
            await ReservedBook.updateMany(
                { bookId: updatedBook._id, status: { $in: ['RESERVED', 'PENDING_RESERVATION'] } },
                { status: 'FULFILLED' }
            );
        }
    }

    return updatedBook;
};

exports.deleteBookById = async (id) => {
    return await Book.findByIdAndDelete(id);
};
