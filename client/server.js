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

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const username = email.split('@')[0]; // Assuming username is part of the email before '@'

    try {
        const db = await openDb();
        // Check in students table
        let user = await db.get("SELECT *, 'student' as userType FROM students WHERE email = ?", [email]);
        // If not found, check in faculties table
        if (!user) {
            user = await db.get("SELECT *, 'faculty' as userType FROM faculties WHERE email = ?", [email]);
        }

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            res.json({ message: 'Login successful', userType: user.userType });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await db.close(); // Ensure the database is closed after handling the request
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
