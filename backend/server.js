const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*"
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// connect MongoDB
connectDB().then((database) => {
  if (!database) {
    console.error("⚠️ Server running without MongoDB (Connection Failed)");
  } else {
    console.log("🚀 Server ready with MongoDB integration");
  }
});

// test route
app.get("/", (req, res) => {
  res.send("🔥 Lumina Backend is Working 🔥");
});

// Use Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler - must be last
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
