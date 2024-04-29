import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import EditBookModal from './EditBookModal';
import AddBookForm from './AddBookForm';

const LibrarianPage = () => {
    const location = useLocation();
    const librarianId = location.state.librarianId;
    const librarianName = location.state.librarianName;
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [borrowedBooksPerGenre, setBorrowedBooksPerGenre] = useState([]);

    const [searchParams, setSearchParams] = useState({
        author: '',
        isbn: '',
        category: '',
        title: '',
        publicationYear: '',
        availability: ''
      });
      const [books, setBooks] = useState([]);
      const [error, setError] = useState('');
      const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    
      const handleInputChange = (e) => {
        setSearchParams({
          ...searchParams,
          [e.target.name]: e.target.value
        });
      };
    
      const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          const response = await axios.get('http://localhost:3001/api/books/search', { params: searchParams });
          setBooks(response.data.books);
        } catch (error) {
          setError('Failed to fetch books. ' + error.message);
        }
      };

      const fetchBorrowedBooks = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/api/all-borrowed-books`);
          // Calculate due date for each borrowed book
          const booksWithDueDate = response.data.books.map(book => {
            const checkoutDate = new Date(book.checkout_date);
            const dueDate = new Date(checkoutDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // Add 14 days
            return {
              ...book,
              dueDate: dueDate.toISOString().slice(0, 10) // Format as YYYY-MM-DD
            };
          });
          setBorrowedBooks(booksWithDueDate);
        } catch (error) {
          setError('Failed to fetch borrowed books. ' + error.message);
        }
      };

      useEffect(() => {
        fetchBorrowedBooks();
      }, []);

      const isOverdue = (dueDate) => {
        const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
        return dueDate < today;
      };


    const handleEditBook = (book) => {
        setSelectedBook(book);
        setShowEditModal(true);
      };
    
      const handleCloseEditModal = (refreshBookList) => {
        setShowEditModal(false);
        if (refreshBookList) {
          fetchBorrowedBooks();
        }
      };

      const fetchBorrowedBooksPerGenre = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/borrowed-books-per-genre');
            setBorrowedBooksPerGenre(response.data.borrowedBooksPerGenre);
        } catch (error) {
            setError('Failed to fetch borrowed books per genre. ' + error.message);
        }
    };

    useEffect(() => {
        fetchBorrowedBooksPerGenre();
    }, []);

  return (
    <div className="container">
      <h1>Welcome, Librarian {librarianName}!</h1>
      <p>This is your librarian dashboard.</p>
      <h2>Search Books</h2>
      <form onSubmit={handleSubmit}>
        <input name="author" placeholder="Author" value={searchParams.author} onChange={handleInputChange} />
        <input name="isbn" placeholder="ISBN" value={searchParams.isbn} onChange={handleInputChange} />
        <input name="category" placeholder="Category" value={searchParams.category} onChange={handleInputChange} />
        <input name="title" placeholder="Title" value={searchParams.title} onChange={handleInputChange} />
        <button type="submit">Search</button>
      </form>
      <ul>
        {books.map(book => (
          <li key={book.book_id}>
            {book.title} by {book.author} - {book.isbn} - Availibility: {book.availability}
            <button onClick={() => handleEditBook(book)}>Edit</button>
          </li>
        ))}
      </ul>
      {/* Render EditBookModal if showEditModal is true */}
      {showEditModal && <EditBookModal book={selectedBook} onClose={handleCloseEditModal} />}

      <h2>Add new book</h2>
      <AddBookForm />

      <h2>Currently borrowed books</h2>
      <ul>
        {borrowedBooks.map(book => (
          <li key={book.book_id}>
            {book.title} by {book.author} - Due Date: {book.dueDate} - Borrower: {book.student_id}
            {isOverdue(book.dueDate) && <span style={{ color: 'red' }}> (Overdue)</span>}
          </li>
        ))}
      </ul>

      <h2>Books borrowed by genre</h2>
            <ul>
                {borrowedBooksPerGenre.map(genre => (
                    <li key={genre.category}>
                        {genre.category}: {genre.count}
                    </li>
                ))}
            </ul>
    </div>
  );
};

export default LibrarianPage;
