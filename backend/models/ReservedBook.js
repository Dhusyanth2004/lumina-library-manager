const mongoose = require('mongoose');

const reservedBookSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    bookTitle: { type: String, required: true },
    reservedBy: { type: String, required: true },
    reservationDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['RESERVED', 'PENDING_RESERVATION', 'FULFILLED', 'CANCELLED'],
        default: 'PENDING_RESERVATION'
    }
}, { timestamps: true });

module.exports = mongoose.model('ReservedBook', reservedBookSchema);
