# Lumina Library Manager 📚✨

Lumina is a premium, modern library management system built with the **MERN** stack (MongoDB, Express, React, Node.js). It's designed to provide a seamless and visually stunning experience for both librarians and students.

## 🚀 Key Features

- **AI-Powered Book Scanning**: Automatically identify book details via AI (Gemini 2.0) using either text or cover images.
- **Smart Search & Filters**: Effortlessly find books by title, author, or category with real-time filtering.
- **Role-Based Access Control (RBAC)**: Secure access for Admin, Librarian, and Student roles.
- **Interactive Library Insights**: Real-time stats dashboard including total books, borrowed status, and overdue alerts.
- **Dynamic Fine Calculator**: Automatic calculations of overdue fees based on due dates.
- **Smooth & Responsive UI**: Premium design with glassmorphism effects, dark mode support, and micro-animations via Framer Motion.
- **Export & Import**: Bulk import books via CSV and export your library data in various formats.
- **Skeleton Loading & Empty States**: Polished user experience even during data fetching.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, JWT (Authentication), Express-Validator.
- **Database**: MongoDB (Mongoose).
- **AI Integration**: Google Gemini 2.0 Flash for OCR and book identification.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Gemini API Key (Optional, for AI features)

### Getting Started

1. **Clone & Install**:
   ```bash
   # Root directory
   npm install
   # Backend & Frontend
   npm run install:all
   ```

2. **Environment Setup**:
   Create a `.env` file in the root based on the provided examples:
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   PORT=5000
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

3. **Run for Development**:
   ```bash
   npm run dev
   ```
   - Backend runs on: `http://localhost:5000`
   - Frontend runs on: `http://localhost:3000`

## 📖 API Documentation

The backend provides a RESTful API with the following endpoints (all protected by JWT):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Fetch all books in the library |
| POST | `/api/books` | Add a new book (Admin/Librarian) |
| PUT | `/api/books/:id` | Update book details or status |
| DELETE| `/api/books/:id`| Remove a book (Admin only) |
| POST | `/api/auth/login` | Authenticate user & get token |

---

Developed with ❤️ for the Lumina Library Community.
