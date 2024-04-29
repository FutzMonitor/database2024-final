import React, { useState } from 'react';
import axios from 'axios';

const EditBookModal = ({ book, onClose }) => {
  const [editedBook, setEditedBook] = useState({ ...book });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedBook(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/books/${book.isbn}`, editedBook);
      onClose(true); // Close modal and refresh book list
    } catch (error) {
      console.error('Failed to edit book:', error);
      // Handle error
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => onClose(false)}>&times;</span>
        <h2>Edit Book Details</h2>
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input type="text" name="title" value={editedBook.title} onChange={handleChange} />
          <label>Author:</label>
          <input type="text" name="author" value={editedBook.author} onChange={handleChange} />
          <select name="availability" value={editedBook.availability} onChange={handleChange}>
            <option value="Available">Available</option>
            <option value="no">Unavailable</option>
            </select>
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditBookModal;
