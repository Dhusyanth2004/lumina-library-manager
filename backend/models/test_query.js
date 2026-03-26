const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Book = require('./Book');
const connectDB = require('../config/db');

async function testQuery() {
    await connectDB();
    const books = await Book.find({});
    console.log(`Found ${books.length} books in DB.`);
    process.exit(0);
}

testQuery();
