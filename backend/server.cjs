require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db.cjs");
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
app.use('/api/users', userRoutes);

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
