import React, { useEffect, useState } from 'react';

function Books() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/books')
            .then(response => response.json())
            .then(data => setBooks(data.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <h1>Books List</h1>
            <ul>
                {books.map(book => (
                    <li key={book.id}>{book.title} - {book.author}</li>
                ))}
            </ul>
        </div>
    );
}

export default Books;
