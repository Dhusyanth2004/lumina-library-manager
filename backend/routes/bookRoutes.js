const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

// Get all books
router.get('/', bookController.getBooks);

// Add a new book (with validation)
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('status').optional().isIn(['AVAILABLE', 'BORROWED', 'RESERVED', 'PENDING_RESERVATION', 'ACTIVE', 'RENEWED', 'OVERDUE', 'RETURNED', 'PENDING_BORROW']),
    body('borrowerEmail').optional().isEmail().withMessage('Invalid email format'),
    body('externalLink').optional().isURL().withMessage('Invalid URL format'),
  ],
  bookController.addBook
);

// Update a book (with validation)
router.put(
  '/:id',
  authorize(['ADMIN']),
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('borrowerEmail').optional().isEmail().withMessage('Invalid email format'),
    body('externalLink').optional({ checkFalsy: true }).isURL().withMessage('Invalid URL format'),
  ],
  bookController.updateBook
);

// Delete a book
router.delete('/:id', bookController.deleteBook);

module.exports = router;
