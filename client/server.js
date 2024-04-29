import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Open the database
async function openDb() {
    return open({
        filename: '../database/university.db',
        driver: sqlite3.Database
    });
}

// Get all books
app.get('/books', async (req, res) => {
    const db = await openDb();
    try {
        const rows = await db.all("SELECT * FROM books");
        res.json({
            message: "success",
            data: rows
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    } finally {
        await db.close(); // Ensure the database is closed after the query or if an error occurs
    }
});

// Endpoint to add a new book
app.post('/api/books', async (req, res) => {
    const { title, author, isbn, pub_year, category, availability, exp_return_date } = req.body;
    let db;
    try {
        db = await openDb();
        await db.run(
            'INSERT INTO books (book_id, title, author, isbn, pub_year, category, availability, exp_return_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [isbn, title, author, isbn, pub_year, category, availability, null]
        );
        res.status(201).json({ message: 'Book added successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});


app.get('/api/books/search', async (req, res) => {
    const { author, isbn, category, title, publicationYear, availability } = req.query;
    console.log("Received search request:", req.query);  // Log incoming query parameters

    const db = await openDb();
    console.log("Database opened successfully");

    try {
        const conditions = [];
        const params = [];

        if (author) {
            conditions.push("author LIKE ?");
            params.push('%' + author + '%');
        }
        if (isbn) {
            conditions.push("isbn = ?");
            params.push(isbn);
        }
        if (category) {
            conditions.push("category LIKE ?");
            params.push('%' + category + '%');
        }
        if (title) {
            conditions.push("title LIKE ?");
            params.push('%' + title + '%');
        }

        const queryString = `SELECT * FROM books WHERE ${conditions.join(' AND ')}`;
        console.log("Executing query:", queryString, params);  // Log the final query

        const books = await db.all(queryString, params);
        console.log("Query executed successfully, books found:", books.length);
        res.json({ books });
    } catch (error) {
        console.error("Failed to execute search query:", error);
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
        console.log("Database connection closed");
    }
});

app.post('/api/borrow', async (req, res) => {
    const { bookIsbn, studentId, librarianId } = req.body;
    const checkoutDate = new Date().toISOString().slice(0, 10);  // format YYYY-MM-DD
    let db;
    try {
        db = await openDb();

        // Check if the book exists and is available
        const book = await db.get("SELECT * FROM books WHERE isbn = ? AND availability = 'Available'", [bookIsbn]);
        console.log(book)
        if (!book) {
            return res.status(404).json({ error: "Book not available." });
        }

        // Check if the student has already borrowed 2 books
        const count = await db.get("SELECT COUNT(*) as count FROM transactions WHERE student_id = ? AND checkin_date IS NULL", [studentId]);
        if (count.count >= 2) {
            return res.status(400).json({ error: "Student has already borrowed 2 books." });
        }

        // Insert the transaction
        await db.run(
            "INSERT INTO transactions (book_id, librarian_id, checkout_date, student_id) VALUES (?, ?, ?, ?)",
            [bookIsbn, librarianId, checkoutDate, studentId]
        );

        // Update book availability
        await db.run("UPDATE books SET availability = 'no' WHERE isbn = ?", [bookIsbn]);

        res.status(201).json({ message: "Book borrowed successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

// Add this route to handle fetching borrowed books for a specific student
app.get('/api/student/:studentId/borrowed-books', async (req, res) => {
    const { studentId } = req.params;
    let db;
    try {
      db = await openDb();
      const query = `
        SELECT books.title, books.author, transactions.book_id, transactions.checkout_date
        FROM transactions
        INNER JOIN books ON transactions.book_id = books.isbn
        WHERE transactions.student_id = ? AND transactions.checkin_date IS NULL
      `;
      const borrowedBooks = await db.all(query, [studentId]);
      res.json({ books: borrowedBooks });
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await db.close();
    }
  });

  // Add this route to handle fetching all borrowed books
app.get('/api/all-borrowed-books', async (req, res) => {
    let db;
    try {
      db = await openDb();
      const query = `
        SELECT books.title, books.author, transactions.book_id, transactions.checkout_date, transactions.student_id
        FROM transactions
        INNER JOIN books ON transactions.book_id = books.isbn
        WHERE transactions.checkin_date IS NULL
      `;
      const borrowedBooks = await db.all(query);
      res.json({ books: borrowedBooks });
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await db.close();
    }
  });

  
//   return a book
  app.post('/api/return', async (req, res) => {
    const { bookId } = req.body;
    const checkinDate = new Date().toISOString().slice(0, 10);  // Get today's date in YYYY-MM-DD format
    let db;
    try {
        db = await openDb();
        // Update the transaction with the check-in date
        await db.run(
            "UPDATE transactions SET checkin_date = ? WHERE book_id = ? AND checkin_date IS NULL",
            [checkinDate, bookId]
        );
        // Update the book availability to 'Available'
        await db.run("UPDATE books SET availability = 'Available' WHERE isbn = ?", [bookId]);
        res.status(200).json({ message: "Book returned successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

// Endpoint to fetch all past transactions
app.get('/api/all-transactions', async (req, res) => {
    let db;
    try {
        db = await openDb();
        const transactions = await db.all("SELECT * FROM transactions");
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

// Endpoint to fetch transactions for a specific student
app.get('/api/student/:studentId/transactions', async (req, res) => {
    const { studentId } = req.params;
    let db;
    try {
        db = await openDb();
        const transactions = await db.all("SELECT * FROM transactions WHERE student_id = ?", [studentId]);
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});



// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const username = email.split('@')[0]; // Assuming username is part of the email before '@'
    let db;
    try {
        db = await openDb();
        // Check in students table
        let user = await db.get("SELECT *, 'student' as userType FROM students WHERE email = ?", [email]);
        // If not found, check in faculties table
        if (!user) {
            user = await db.get("SELECT *, 'librarian' as userType FROM librarian WHERE email = ?", [email]);
        }

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            res.json({ message: 'Login successful', userType: user.userType, studentId: user.student_id, studentName: user.name});
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (db) {
            await db.close();
            console.log("Database connection closed");
        }
    }
});

app.put('/api/books/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    const updatedBook = req.body;
    let db;
    try {
        db = await openDb();
        // Update the book details in the database
        await db.run(
            "UPDATE books SET title = ?, author = ?, availability = ? WHERE isbn = ?",
            [updatedBook.title, updatedBook.author, updatedBook.availability, isbn]
        );
        res.status(200).json({ message: "Book details updated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (db) await db.close();
    }
});

// Endpoint to fetch the count of books borrowed per genre
app.get('/api/borrowed-books-per-genre', async (req, res) => {
    let db;
    try {
        db = await openDb();
        const query = `
            SELECT books.category, COUNT(*) as count
            FROM transactions
            INNER JOIN books ON transactions.book_id = books.isbn
            WHERE transactions.checkin_date IS NULL
            GROUP BY books.category
        `;
        const borrowedBooksPerGenre = await db.all(query);
        res.json({ borrowedBooksPerGenre });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
