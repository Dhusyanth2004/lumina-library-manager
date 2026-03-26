const mongoose = require('mongoose');

// Use environment variable or default to local mongodb
const url = process.env.MONGO_URI || 'mongodb://localhost:27017/lumina_library';

const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(url);
    console.log("✅ MongoDB Connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return null; // Return null on failure so server knows
  }
};

module.exports = connectDB;
