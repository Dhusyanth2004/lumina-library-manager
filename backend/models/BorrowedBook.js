const mongoose = require('mongoose');

const borrowedBookSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    bookTitle: { type: String, required: true },
    borrower: { type: String, required: true },
    borrowerEmail: { type: String },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: {
        type: String,
        enum: ['BORROWED', 'ACTIVE', 'RENEWED', 'OVERDUE', 'RETURNED'],
        default: 'BORROWED'
    }
}, { timestamps: true });

module.exports = mongoose.model('BorrowedBook', borrowedBookSchema);
