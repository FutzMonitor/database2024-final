import React from 'react';

const FacultyPage = () => {
  const location = useLocation();
  const facultyId = location.state.facultyId;
  const studentName = location.state.studentName;

  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);

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

  const handleBorrow = async (selectedIsbn) => {
    try {
        const response = await axios.post('http://localhost:3001/api/borrow', {
            bookIsbn: selectedIsbn,
            facultyId: facultyId,
            librarianId: "0"
        });
        console.log("Borrow response:", response.data);
        alert("Book borrowed successfully!");
    } catch (error) {
        console.error("Error borrowing book:", error.response?.data?.error || error.message);
        alert("Failed to borrow book: " + (error.response?.data?.error || error.message));
    }
  };

  // Function to fetch the student's borrowed books
  const fetchBorrowedBooks = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/student/${studentId}/borrowed-books`);
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

  // Fetch borrowed books when component mounts
  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  // Function to check if a book is overdue
  const isOverdue = (dueDate) => {
    const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
    return dueDate < today;
  };

  const handleReturn = async (bookId) => {
    try {
        const response = await axios.post('http://localhost:3001/api/return', {
            bookId: bookId
        });
        console.log("Return response:", response.data);
        alert("Book returned successfully!");
        // After returning the book, fetch the updated list of borrowed books
        fetchBorrowedBooks();
    } catch (error) {
        console.error("Error returning book:", error.response?.data?.error || error.message);
        alert("Failed to return book: " + (error.response?.data?.error || error.message));
    }
  };

  // Function to fetch transactions for the current student
  const fetchStudentTransactions = async () => {
    try {
        const response = await axios.get(`http://localhost:3001/api/student/${studentId}/transactions`);
        setTransactions(response.data.transactions);
    } catch (error) {
        setError('Failed to fetch borrowing history. ' + error.message);
    }
  };

  // Fetch student's transactions when the component mounts
  useEffect(() => {
    fetchStudentTransactions();
  }, [studentId]);

  return (
    <div className="container">
      <h1>Welcome {studentName}!</h1>
      <p>This is your dashboard. Search for your books right here.</p>
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
            {book.title} by {book.author} - {book.isbn}
            <button onClick={() => handleBorrow(book.isbn)}>Borrow</button>
          </li>
        ))}
      </ul>

      <h2>Student's borrowed books</h2>
      {/* be able to return here */}
      {/* display if overdue */}
      <h2>Student's Borrowed Books</h2>
      <ul>
        {borrowedBooks.map(book => (
          <li key={book.book_id}>
            {book.title} by {book.author} - Due Date: {book.dueDate}
            {isOverdue(book.dueDate) && <span style={{ color: 'red' }}> (Overdue)</span>}
            <button onClick={() => handleReturn(book.book_id)}>Return</button>
          </li>
        ))}
      </ul>

      <h2>Borrowing History</h2>
      <ul>
          {transactions.map(transaction => (
              <li key={transaction.transaction_id}>
                  Book ID: {transaction.book_id}, Librarian ID: {transaction.librarian_id}, Checkout Date: {transaction.checkout_date}, Checkin Date: {transaction.checkin_date}
              </li>
          ))}
      </ul>
    </div>
  );
};

export default FacultyPage;
