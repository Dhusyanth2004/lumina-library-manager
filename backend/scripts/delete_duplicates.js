const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Book = require('../models/Book');
const connectDB = require('../config/db');

async function removeDuplicates() {
    try {
        await connectDB();
        
        const books = await Book.find({});
        console.log(`Found ${books.length} total books.`);

        const seenBooks = new Set();
        const duplicateIds = [];

        for (const book of books) {
            // Create a unique key using title and author (lowercased)
            const key = `${(book.title || '').toLowerCase()}-${(book.author || '').toLowerCase()}`;
            
            if (seenBooks.has(key)) {
                duplicateIds.push(book._id);
            } else {
                seenBooks.add(key);
            }
        }

        console.log(`Found ${duplicateIds.length} duplicate books.`);

        if (duplicateIds.length > 0) {
            const result = await Book.deleteMany({ _id: { $in: duplicateIds } });
            console.log(`✅ Successfully deleted ${result.deletedCount} duplicate books.`);
        } else {
            console.log(`No duplicates needed to be deleted.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error removing duplicates:", error);
        process.exit(1);
    }
}

removeDuplicates();
