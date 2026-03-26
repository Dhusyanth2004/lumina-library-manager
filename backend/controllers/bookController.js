const bookService = require('../services/bookService');
const { validationResult } = require('express-validator');

// Get all books
exports.getBooks = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await bookService.getAllBooks({ page, limit });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a new book
exports.addBook = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newBook = await bookService.createBook(req.body);
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a book
exports.updateBook = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedBook = await bookService.updateBookById(req.params.id, req.body);
        if (updatedBook) {
            res.json(updatedBook);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a book
exports.deleteBook = async (req, res) => {
    try {
        const result = await bookService.deleteBookById(req.params.id);
        if (result) {
            res.json({ message: 'Book deleted' });
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
