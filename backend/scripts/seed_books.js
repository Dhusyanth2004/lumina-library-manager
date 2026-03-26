const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Book = require('../models/Book');
const connectDB = require('../config/db');

const booksData = [
    { title: "The Kite Runner", author: "Khaled Hosseini", category: "Fiction", language: "English" },
    { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", language: "English" },
    { title: "Deep Work", author: "Cal Newport", category: "Self-Improvement", language: "English" },
    { title: "Ikigai", author: "Hector Garcia & Francesc Miralles", category: "Self-Help", language: "English" },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", category: "Programming", language: "English" },
    { title: "Steve Jobs", author: "Walter Isaacson", category: "Biography", language: "English" },
    { title: "1984", author: "George Orwell", category: "Fiction", language: "English" },
    { title: "Brief Answers to the Big Questions", author: "Stephen Hawking", category: "Science", language: "English" },
    { title: "Parthiban Kanavu", author: "Kalki Krishnamurthy", category: "Historical Fiction", language: "Tamil" },
    { title: "Kadal Pura", author: "Sandilyan", category: "Historical Fiction", language: "Tamil" },
    { title: "Yavana Rani", author: "Sandilyan", category: "Historical Fiction", language: "Tamil" },
    { title: "Thillana Mohanambal", author: "Kothamangalam Subbu", category: "Fiction", language: "Tamil" },
    { title: "Aathichudi", author: "Avvaiyar", category: "Ethics / Literature", language: "Tamil" },
    { title: "Kurai Ondrum Illai", author: "Cho Ramaswamy", category: "Essays / Inspiration", language: "Tamil" },
    { title: "Godaan", author: "Munshi Premchand", category: "Fiction", language: "Hindi" },
    { title: "Gaban", author: "Munshi Premchand", category: "Fiction", language: "Hindi" },
    { title: "Madhushala", author: "Harivansh Rai Bachchan", category: "Poetry", language: "Hindi" },
    { title: "Gunahon Ka Devta", author: "Dharamvir Bharati", category: "Fiction", language: "Hindi" },
    { title: "Raavan: Enemy of Aryavarta", author: "Amish Tripathi", category: "Mythology", language: "English" },
    { title: "Shiva Trilogy: The Immortals of Meluha", author: "Amish Tripathi", category: "Mythology", language: "English" }
];

const seedDB = async () => {
    try {
        await connectDB();

        // Clear existing books optional but usually cleaner for seeding new sets
        // await Book.deleteMany({});

        const booksWithImages = booksData.map(book => ({
            ...book,
            status: 'AVAILABLE',
            coverUrl: `https://picsum.photos/seed/${encodeURIComponent(book.title)}/300/450`,
            renewalCount: 0
        }));

        await Book.insertMany(booksWithImages);
        console.log("✅ 20 Books seeded successfully!");

        process.exit();
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedDB();
