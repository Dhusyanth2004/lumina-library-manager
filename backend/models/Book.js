const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  borrowDate: { type: String },
  dueDate: { type: String },
  status: {
    type: String,
    enum: ['AVAILABLE', 'BORROWED', 'RESERVED', 'PENDING_RESERVATION', 'ACTIVE', 'RENEWED', 'OVERDUE', 'RETURNED', 'PENDING_BORROW'],
    default: 'AVAILABLE'
  },
  coverUrl: { type: String },
  renewalCount: { type: Number, default: 0 },
  category: { type: String },
  language: { type: String },
  notes: { type: String },
  borrower: { type: String },
  borrowerEmail: { type: String },
  reservedBy: { type: String },
  lastAlertSent: { type: String },
  rating: { type: Number },
  review: { type: String },
  externalLink: { type: String }
}, { timestamps: true });

// Ensure virtual fields are serialized
bookSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id; // We use 'id' (virtual) instead
  }
});

module.exports = mongoose.model('Book', bookSchema);
